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
  Search,
  TrendingUp,
  BookOpen,
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

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const countSyllables = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const vowelGroups = word.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? vowelGroups.length : 1;
};

const analyzeReadability = (html: string) => {
  const text = stripHtml(html);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const totalSentences = Math.max(sentences.length, 1);
  const totalWords = Math.max(words.length, 1);
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  // Flesch Reading Ease: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
  const fre = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  const score = Math.max(0, Math.min(100, Math.round(fre)));

  // Flesch-Kincaid Grade Level
  const gradeLevel = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
  const grade = Math.max(1, Math.round(gradeLevel * 10) / 10);

  const avgWordsPerSentence = +(totalWords / totalSentences).toFixed(1);
  const avgSyllablesPerWord = +(totalSyllables / totalWords).toFixed(1);

  let level: string, description: string, color: "accent" | "foreground" | "destructive";
  if (score >= 70) { level = "Easy to Read"; description = "Accessible to most readers. Great for blogs!"; color = "accent"; }
  else if (score >= 50) { level = "Fairly Easy"; description = "Good for general audience content."; color = "accent"; }
  else if (score >= 30) { level = "Moderate"; description = "May be too complex for casual readers."; color = "foreground"; }
  else { level = "Difficult"; description = "Consider simplifying for wider reach."; color = "destructive"; }

  return { score, grade, level, description, color, avgWordsPerSentence, avgSyllablesPerWord, totalSentences, totalWords };
};

const analyzeSeoScore = (data: BlogPostData, keywordsStr: string) => {
  const plain = stripHtml(data.content);
  const wordCount = plain.split(/\s+/).length;
  const h2Count = (data.content.match(/<h2[\s>]/gi) || []).length;
  const h3Count = (data.content.match(/<h3[\s>]/gi) || []).length;
  const hasLists = /<ul[\s>]/i.test(data.content) || /<ol[\s>]/i.test(data.content);
  const hasBlockquote = /<blockquote[\s>]/i.test(data.content);
  const hasBold = /<strong[\s>]/i.test(data.content) || /<b[\s>]/i.test(data.content);
  const paragraphs = data.content.match(/<p[\s>]/gi) || [];
  const sentencesPerPara = paragraphs.length > 0 ? Math.round(wordCount / paragraphs.length / 15) : 0;

  const checks = [
    { label: "Title length (50-60 chars)", pass: data.meta_title.length >= 40 && data.meta_title.length <= 60, weight: 10, fix: `Title is ${data.meta_title.length} chars. ${data.meta_title.length < 40 ? "Add more descriptive words to reach 50-60 characters." : "Shorten to under 60 characters to avoid truncation in search results."}` },
    { label: "Meta description (140-160 chars)", pass: data.meta_description.length >= 120 && data.meta_description.length <= 160, weight: 10, fix: `Description is ${data.meta_description.length} chars. ${data.meta_description.length < 120 ? "Expand with a call-to-action or benefit statement to reach 140-160 characters." : "Trim to under 160 characters so Google doesn't cut it off."}` },
    { label: "Word count (1200+ words)", pass: wordCount >= 1200, weight: 15, detail: `${wordCount} words`, fix: "Articles under 1200 words rank lower. Try regenerating with a broader topic or add more subtopics." },
    { label: "H2 headings (4-6 recommended)", pass: h2Count >= 3 && h2Count <= 8, weight: 10, detail: `${h2Count} found`, fix: h2Count < 3 ? "Add more H2 sections to break up content. Each H2 should cover a distinct subtopic." : "Too many H2s can dilute focus. Merge similar sections or convert some to H3." },
    { label: "H3 subheadings used", pass: h3Count >= 1, weight: 5, detail: `${h3Count} found`, fix: "Add H3 subheadings under your H2 sections to improve scannability and structure." },
    { label: "Lists for scannability", pass: hasLists, weight: 8, fix: "Add a bulleted or numbered list to make key points easy to scan. Lists also help win featured snippets." },
    { label: "Bold/emphasis used", pass: hasBold, weight: 5, fix: "Bold key phrases and important terms to help readers and search engines identify main concepts." },
    { label: "Blockquotes for depth", pass: hasBlockquote, weight: 3, fix: "Add a blockquote with an expert tip or inspiring quote to add credibility and visual variety." },
    { label: "Short paragraphs (readable)", pass: sentencesPerPara <= 4, weight: 7, fix: "Break long paragraphs into 2-3 sentences each. Wall-of-text paragraphs increase bounce rate." },
    { label: "Slug is concise (≤5 words)", pass: data.slug.split("-").length <= 6, weight: 5, detail: `${data.slug.split("-").length} words`, fix: "Shorten the URL slug to 3-5 key words. Remove filler words like 'the', 'and', 'for'." },
    { label: "Featured image included", pass: !!data.image_url, weight: 7, fix: "Upload a featured image or try regenerating — posts with images get 94% more views." },
    { label: "Excerpt provided", pass: data.excerpt.length >= 50, weight: 5, fix: "Write a compelling 50-160 character excerpt that summarizes the post and encourages clicks." },
  ];

  // Keyword-specific checks
  if (keywordsStr.trim()) {
    const primaryKw = keywordsStr.split(",")[0].trim().toLowerCase();
    checks.push(
      { label: `Primary keyword in title`, pass: data.title.toLowerCase().includes(primaryKw), weight: 10 },
    );
    const first100Words = plain.split(/\s+/).slice(0, 100).join(" ").toLowerCase();
    checks.push(
      { label: `Keyword in first 100 words`, pass: first100Words.includes(primaryKw), weight: 10 },
    );
  }

  const maxScore = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earned / maxScore) * 100);
  const grade: string = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
  const verdict = score >= 85 ? "Excellent — strong ranking potential!" : score >= 70 ? "Good — solid foundation, minor tweaks possible." : score >= 55 ? "Fair — consider regenerating for better results." : "Needs work — try a different topic or keywords.";

  return { score, grade, verdict, checks, wordCount };
};

const analyzeKeywordDensity = (content: string, title: string, metaDesc: string, keywordsStr: string) => {
  if (!keywordsStr.trim()) return [];
  const plainContent = stripHtml(content).toLowerCase();
  const fullText = `${title} ${metaDesc} ${plainContent}`.toLowerCase();
  const totalWords = fullText.split(/\s+/).length;

  return keywordsStr.split(",").map((kw) => kw.trim().toLowerCase()).filter(Boolean).map((keyword) => {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const contentMatches = (plainContent.match(regex) || []).length;
    const titleMatch = title.toLowerCase().includes(keyword);
    const metaMatch = metaDesc.toLowerCase().includes(keyword);
    const density = totalWords > 0 ? ((contentMatches / totalWords) * 100) : 0;
    const rating: "excellent" | "good" | "low" | "high" =
      density >= 0.5 && density <= 2.5 ? (density >= 1 && density <= 2 ? "excellent" : "good") : density > 2.5 ? "high" : "low";
    return { keyword, count: contentMatches, density: +density.toFixed(2), titleMatch, metaMatch, rating };
  });
};

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

            {/* SEO Score Card */}
            {(() => {
              const seo = analyzeSeoScore(generatedData, keywords);
              return (
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <p className="text-xs font-semibold text-foreground">SEO Performance Score</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${
                        seo.score >= 80 ? "text-accent" : seo.score >= 60 ? "text-foreground" : "text-destructive"
                      }`}>{seo.score}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        seo.score >= 80 ? "bg-accent/15 text-accent" : seo.score >= 60 ? "bg-muted text-foreground" : "bg-destructive/10 text-destructive"
                      }`}>{seo.grade}</span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        seo.score >= 80 ? "bg-accent" : seo.score >= 60 ? "bg-foreground/50" : "bg-destructive"
                      }`}
                      style={{ width: `${seo.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{seo.verdict}</p>

                  {/* Checklist */}
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {seo.checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span className={check.pass ? "text-accent" : "text-muted-foreground"}>
                          {check.pass ? "✓" : "✗"}
                        </span>
                        <span className={check.pass ? "text-foreground" : "text-muted-foreground"}>
                          {check.label}
                        </span>
                        {check.detail && (
                          <span className="text-muted-foreground ml-auto">({check.detail})</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground pt-1">
                    {seo.wordCount.toLocaleString()} words · Score based on {seo.checks.length} on-page SEO factors
                  </p>
                </div>
              );
            })()}

            {/* Readability Score */}
            {(() => {
              const r = analyzeReadability(generatedData.content);
              const colorClass = r.color === "accent" ? "text-accent" : r.color === "destructive" ? "text-destructive" : "text-foreground";
              const bgClass = r.color === "accent" ? "bg-accent/15 text-accent" : r.color === "destructive" ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground";
              const barClass = r.color === "accent" ? "bg-accent" : r.color === "destructive" ? "bg-destructive" : "bg-foreground/50";
              return (
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                      <p className="text-xs font-semibold text-foreground">Readability Score</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${colorClass}`}>{r.score}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bgClass}`}>
                        {r.level}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barClass}`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{r.description}</p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">{r.grade}</p>
                      <p className="text-[10px] text-muted-foreground">Grade Level</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">{r.avgWordsPerSentence}</p>
                      <p className="text-[10px] text-muted-foreground">Words/Sentence</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground">
                    {r.totalWords.toLocaleString()} words · {r.totalSentences} sentences · {r.avgSyllablesPerWord} syllables/word · Ideal: score 60-80 (Grade 6-8)
                  </p>
                </div>
              );
            })()}

            {/* Keyword Density Checker */}
            {keywords.trim() && (() => {
              const analysis = analyzeKeywordDensity(generatedData.content, generatedData.title, generatedData.meta_description, keywords);
              if (analysis.length === 0) return null;
              return (
                <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-accent" />
                    <p className="text-xs font-semibold text-foreground">Keyword Density Analysis</p>
                  </div>
                  <div className="space-y-2.5">
                    {analysis.map((kw) => (
                      <div key={kw.keyword} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium capitalize">"{kw.keyword}"</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            kw.rating === "excellent" ? "bg-accent/15 text-accent" :
                            kw.rating === "good" ? "bg-accent/10 text-accent" :
                            kw.rating === "high" ? "bg-destructive/10 text-destructive" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {kw.rating === "excellent" ? "Excellent" : kw.rating === "good" ? "Good" : kw.rating === "high" ? "Overused" : "Low"}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              kw.rating === "excellent" || kw.rating === "good" ? "bg-accent" :
                              kw.rating === "high" ? "bg-destructive" : "bg-muted-foreground/40"
                            }`}
                            style={{ width: `${Math.min((kw.density / 3) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span>{kw.count}× found</span>
                          <span>{kw.density}% density</span>
                          <span className={kw.titleMatch ? "text-accent" : ""}>
                            {kw.titleMatch ? "✓ In title" : "✗ Not in title"}
                          </span>
                          <span className={kw.metaMatch ? "text-accent" : ""}>
                            {kw.metaMatch ? "✓ In meta" : "✗ Not in meta"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-1.5 pt-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Ideal density: 1-2%. Below 0.5% may not rank; above 2.5% risks keyword stuffing penalties.
                    </p>
                  </div>
                </div>
              );
            })()}

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
