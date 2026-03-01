import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  FileText,
  ImageIcon,
  CheckCircle2,
  Wand2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  read_time: string;
  image_url?: string;
}

interface AiBlogWriterProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: BlogPostData) => void;
  categories: { id: string; name: string }[];
}

type Step = "input" | "generating-text" | "generating-image" | "done" | "error";

const AiBlogWriter = ({
  isOpen,
  onClose,
  onGenerated,
  categories,
}: AiBlogWriterProps) => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [progress, setProgress] = useState(0);
  const [generatedData, setGeneratedData] = useState<BlogPostData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const tones = [
    { value: "professional", label: "Professional & Authoritative" },
    { value: "warm", label: "Warm & Conversational" },
    { value: "luxurious", label: "Luxurious & Aspirational" },
    { value: "practical", label: "Practical & How-To Guide" },
    { value: "inspirational", label: "Inspirational & Creative" },
    { value: "listicle", label: "Listicle (Top 10, Best Of)" },
    { value: "educational", label: "Educational & In-Depth" },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for your blog post");
      return;
    }

    setStep("generating-text");
    setProgress(15);
    setErrorMessage("");

    try {
      // Step 1: Generate blog content
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 45));
      }, 500);

      const { data: textData, error: textError } =
        await supabase.functions.invoke("generate-blog-post", {
          body: { topic, tone, category, keywords },
        });

      clearInterval(progressInterval);

      if (textError) throw new Error(textError.message || "Failed to generate blog content");
      if (textData?.error) throw new Error(textData.error);

      setProgress(50);
      setStep("generating-image");

      // Step 2: Generate featured image
      const imageProgressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 90));
      }, 600);

      let imageUrl = "";
      try {
        const { data: imageData, error: imageError } =
          await supabase.functions.invoke("generate-blog-image", {
            body: { prompt: textData.image_prompt },
          });

        if (!imageError && imageData?.image_url) {
          imageUrl = imageData.image_url;
        }
      } catch (imgErr) {
        console.warn("Image generation failed, continuing without image:", imgErr);
      }

      clearInterval(imageProgressInterval);
      setProgress(100);

      const blogData: BlogPostData = {
        title: textData.title,
        slug: textData.slug,
        excerpt: textData.excerpt,
        content: textData.content,
        meta_title: textData.meta_title,
        meta_description: textData.meta_description,
        read_time: textData.read_time,
        image_url: imageUrl || undefined,
      };

      setGeneratedData(blogData);
      setStep("done");
    } catch (error) {
      console.error("AI generation error:", error);
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      setErrorMessage(msg);
      setStep("error");
    }
  };

  const handleApply = () => {
    if (generatedData) {
      onGenerated(generatedData);
      handleReset();
      onClose();
      toast.success("AI-generated blog post applied to editor!");
    }
  };

  const handleReset = () => {
    setStep("input");
    setProgress(0);
    setGeneratedData(null);
    setErrorMessage("");
  };

  const handleClose = () => {
    if (step === "generating-text" || step === "generating-image") return;
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-accent/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-display text-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            AI Blog Writer
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Generate a professional, SEO-optimized blog post designed to rank high on Google — with a matching AI-generated featured image.
          </DialogDescription>
        </DialogHeader>

        {/* Input Step */}
        {step === "input" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ai-topic" className="text-sm font-medium">
                What should the blog post be about? *
              </Label>
              <Textarea
                id="ai-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 10 minimalist bedroom ideas for small apartments, how to style a reading nook on a budget..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Writing Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-keywords" className="text-sm font-medium">
                Target Keywords{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="ai-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., minimalist decor, small bedroom, cozy interior"
              />
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full rounded-full bg-accent text-accent-foreground hover:brightness-110 h-11 text-sm font-semibold"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Blog Post
            </Button>
          </div>
        )}

        {/* Generating Steps */}
        {(step === "generating-text" || step === "generating-image") && (
          <div className="py-8 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-gold rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {progress}% complete
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {step === "generating-text" ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {step === "generating-text"
                      ? "Writing SEO-optimized content..."
                      : "Content generated"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Title, excerpt, meta tags, and full article
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {step === "generating-image" ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : step === "generating-text" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step === "generating-text" ? "text-muted-foreground" : ""
                    }`}
                  >
                    {step === "generating-image"
                      ? "Creating featured image..."
                      : "Generate featured image"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AI-generated photography matching your topic
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              This usually takes 15-30 seconds
            </p>
          </div>
        )}

        {/* Done Step */}
        {step === "done" && generatedData && (
          <div className="space-y-4 pt-2">
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Blog post ready</p>
                  <h3 className="font-display text-base font-medium leading-tight mb-2">
                    {generatedData.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {generatedData.excerpt}
                  </p>
                </div>
              </div>

              {generatedData.image_url && (
                <img
                  src={generatedData.image_url}
                  alt="AI generated featured"
                  className="w-full h-44 object-cover rounded-lg shadow-sm"
                />
              )}

              {/* SEO Score Preview */}
              <div className="bg-background/80 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">SEO Preview</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary truncate">
                    {generatedData.meta_title || generatedData.title}
                  </p>
                  <p className="text-xs text-accent">
                    roomrefine.com/blog/{generatedData.slug}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {generatedData.meta_description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2.5 py-1 rounded-full font-medium">
                  <FileText className="w-3 h-3" />
                  {generatedData.read_time}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2.5 py-1 rounded-full font-medium">
                  Title: {generatedData.meta_title.length}/60
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2.5 py-1 rounded-full font-medium">
                  Desc: {generatedData.meta_description.length}/160
                </span>
                {generatedData.image_url && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">
                    <ImageIcon className="w-3 h-3" />
                    Featured image ✓
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={handleReset}
              >
                Regenerate
              </Button>
              <Button
                className="flex-1 rounded-full bg-accent text-accent-foreground hover:brightness-110"
                onClick={handleApply}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Apply to Editor
              </Button>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === "error" && (
          <div className="py-6 space-y-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">Generation failed</p>
                  <p className="text-xs text-muted-foreground">{errorMessage}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full bg-accent text-accent-foreground hover:brightness-110"
                onClick={handleReset}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiBlogWriter;
