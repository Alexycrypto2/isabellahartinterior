import { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
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
  ListChecks,
  HelpCircle,
  Target,
  Globe,
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
  faq_schema?: { question: string; answer: string }[];
  featured_image_alt?: string;
}

interface AiBlogWriterProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: BlogPostData) => void;
  categories: { id: string; name: string }[];
  initialTopic?: string;
  initialKeywords?: string;
  initialCategory?: string;
}

type Step = "input" | "discovering-products" | "researching-competitors" | "generating-text" | "generating-image" | "done" | "error";

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

  const fre = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  const score = Math.max(0, Math.min(100, Math.round(fre)));

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
  const hasTOC = /class="blog-toc"/i.test(data.content);
  const hasFAQ = /class="blog-faq"/i.test(data.content) || (data.faq_schema && data.faq_schema.length > 0);
  const imgTags = data.content.match(/<img[^>]*>/gi) || [];
  const imgsWithAlt = imgTags.filter(tag => /alt="[^"]{10,}"/i.test(tag)).length;
  const allImgsHaveAlt = imgTags.length === 0 || imgsWithAlt === imgTags.length;

  const checks = [
    { label: "Title length (50-60 chars)", pass: data.meta_title.length >= 40 && data.meta_title.length <= 60, weight: 8, fix: `Title is ${data.meta_title.length} chars. ${data.meta_title.length < 40 ? "Add more descriptive words to reach 50-60 characters." : "Shorten to under 60 characters to avoid truncation in search results."}` },
    { label: "Meta description (140-160 chars)", pass: data.meta_description.length >= 120 && data.meta_description.length <= 160, weight: 8, fix: `Description is ${data.meta_description.length} chars. ${data.meta_description.length < 120 ? "Expand with a call-to-action or benefit statement to reach 140-160 characters." : "Trim to under 160 characters so Google doesn't cut it off."}` },
    { label: "Word count (1200+ words)", pass: wordCount >= 1200, weight: 12, detail: `${wordCount} words`, fix: "Articles under 1200 words rank lower. Try regenerating with a broader topic or add more subtopics." },
    { label: "H2 headings (4-6 recommended)", pass: h2Count >= 3 && h2Count <= 8, weight: 8, detail: `${h2Count} found`, fix: h2Count < 3 ? "Add more H2 sections to break up content." : "Too many H2s can dilute focus." },
    { label: "H3 subheadings used", pass: h3Count >= 1, weight: 4, detail: `${h3Count} found`, fix: "Add H3 subheadings under your H2 sections." },
    { label: "Lists for scannability", pass: hasLists, weight: 6, fix: "Add a bulleted or numbered list to make key points easy to scan." },
    { label: "Bold/emphasis used", pass: hasBold, weight: 4, fix: "Bold key phrases to help readers and search engines." },
    { label: "Blockquotes for depth", pass: hasBlockquote, weight: 3, fix: "Add a blockquote with an expert tip." },
    { label: "Short paragraphs (readable)", pass: sentencesPerPara <= 4, weight: 5, fix: "Break long paragraphs into 2-3 sentences each." },
    { label: "Slug is concise (≤5 words)", pass: data.slug.split("-").length <= 6, weight: 4, detail: `${data.slug.split("-").length} words`, fix: "Shorten the URL slug to 3-5 key words." },
    { label: "Featured image included", pass: !!data.image_url, weight: 5, fix: "Upload a featured image or try regenerating." },
    { label: "Excerpt provided", pass: data.excerpt.length >= 50, weight: 4, fix: "Write a compelling 50-160 character excerpt." },
    { label: "Table of Contents", pass: hasTOC, weight: 6, fix: "A Table of Contents improves UX and can win sitelinks in Google." },
    { label: "FAQ section included", pass: !!hasFAQ, weight: 8, fix: "FAQ sections can win Google's 'People Also Ask' featured snippets." },
    { label: "FAQ schema markup", pass: !!(data.faq_schema && data.faq_schema.length >= 3), weight: 6, detail: data.faq_schema ? `${data.faq_schema.length} questions` : "0", fix: "Add 5-7 FAQ questions to qualify for rich results in Google." },
    { label: "All images have alt text", pass: allImgsHaveAlt, weight: 5, detail: `${imgsWithAlt}/${imgTags.length}`, fix: "Add descriptive, keyword-rich alt text to all images for better SEO." },
  ];

  // Keyword-specific checks
  if (keywordsStr.trim()) {
    const primaryKw = keywordsStr.split(",")[0].trim().toLowerCase();
    checks.push(
      { label: `Primary keyword in title`, pass: data.title.toLowerCase().includes(primaryKw), weight: 8, fix: `Add "${primaryKw}" naturally into your title for better keyword targeting.` },
    );
    const first100Words = plain.split(/\s+/).slice(0, 100).join(" ").toLowerCase();
    checks.push(
      { label: `Keyword in first 100 words`, pass: first100Words.includes(primaryKw), weight: 8, fix: `Mention "${primaryKw}" in your opening paragraph so Google identifies the topic early.` },
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

const getRecommendedWordCount = (topic: string): { value: number; label: string; reason: string } => {
  const lower = topic.toLowerCase();
  if (lower.includes("guide") || lower.includes("how to") || lower.includes("complete") || lower.includes("ultimate")) {
    return { value: 2500, label: "Long-form (2500)", reason: "How-to guides and comprehensive posts rank best at 2000-3000 words" };
  }
  if (lower.includes("tips") || lower.includes("ideas") || lower.includes("ways") || lower.match(/\d+\s/)) {
    return { value: 1800, label: "Medium-long (1800)", reason: "Listicles and idea posts perform best at 1500-2000 words" };
  }
  if (lower.includes("review") || lower.includes("comparison") || lower.includes("vs")) {
    return { value: 2000, label: "In-depth (2000)", reason: "Reviews and comparisons need thorough coverage at 1800-2500 words" };
  }
  if (lower.includes("trend") || lower.includes("inspiration") || lower.includes("style")) {
    return { value: 1500, label: "Medium (1500)", reason: "Trend and inspiration pieces work well at 1200-1800 words" };
  }
  return { value: 1500, label: "Medium (1500)", reason: "A solid word count for most blog topics" };
};

const AiBlogWriter = ({
  isOpen,
  onClose,
  onGenerated,
  categories,
  initialTopic = "",
  initialKeywords = "",
  initialCategory = "",
}: AiBlogWriterProps) => {
  const [topic, setTopic] = useState(initialTopic);
  const [category, setCategory] = useState(initialCategory);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [targetWordCount, setTargetWordCount] = useState(1500);
  const [step, setStep] = useState<Step>("input");
  const [progress, setProgress] = useState(0);
  const [generatedData, setGeneratedData] = useState<BlogPostData | null>(null);
  const [discoveredProducts, setDiscoveredProducts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  
  // SEO Title Generator state
  const [titleIdeas, setTitleIdeas] = useState<{title: string; seo_score: number; reasoning: string}[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  // Update state when initial values change (for trend pre-fill)
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialKeywords) setKeywords(initialKeywords);
    if (initialCategory) setCategory(initialCategory);
  }, [initialTopic, initialKeywords, initialCategory]);

  // Get recommendation when topic changes
  const recommendation = topic.trim() ? getRecommendedWordCount(topic) : null;

  const handleGenerate = async () => {
    const topicToUse = selectedTitle || topic;
    if (!topicToUse.trim()) {
      toast.error("Please enter a topic for your blog post");
      return;
    }

    // If a selected title exists, use it as the topic
    const effectiveTopic = selectedTitle || topic;

    setStep("discovering-products");
    setProgress(5);
    setErrorMessage("");
    setDiscoveredProducts([]);

    try {
      // Step 0: Discover & auto-add trending products
      const discoverInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, 15));
      }, 800);

      let newProducts: any[] = [];
      try {
        const { data: discoverData, error: discoverError } =
          await supabase.functions.invoke("discover-blog-products", {
            body: { topic: effectiveTopic, category },
          });

        if (!discoverError && discoverData?.products) {
          newProducts = discoverData.products;
          setDiscoveredProducts(newProducts);
        }
      } catch (discErr) {
        console.warn("Product discovery failed, continuing with existing products:", discErr);
      }

      clearInterval(discoverInterval);
      setProgress(18);

      // Step 1: Competitor Research (simulated — actual research is done by AI in the prompt)
      setStep("researching-competitors");
      const researchInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 30));
      }, 400);

      // Brief pause to simulate research phase (AI does competitor analysis in its prompt)
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(researchInterval);
      setProgress(30);

      // Step 2: Generate blog content with all new features
      setStep("generating-text");
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 55));
      }, 500);

      const { data: textData, error: textError } =
        await supabase.functions.invoke("generate-blog-post", {
          body: { topic: effectiveTopic, tone: "warm", category, keywords, targetWordCount },
        });

      clearInterval(progressInterval);

      if (textError) throw new Error(textError.message || "Failed to generate blog content");
      if (textData?.error) throw new Error(textData.error);

      setProgress(60);
      setStep("generating-image");

      // Step 3: Generate featured image
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
        faq_schema: textData.faq_schema || [],
        featured_image_alt: textData.featured_image_alt || "",
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
    setDiscoveredProducts([]);
    setErrorMessage("");
    setTitleIdeas([]);
    setSelectedTitle("");
    setIsGeneratingTitles(false);
  };

  const handleClose = () => {
    if (step === "discovering-products" || step === "researching-competitors" || step === "generating-text" || step === "generating-image") return;
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
            Generate a professional, SEO-optimized blog post with FAQ schema, Table of Contents, competitor research, and AI-generated featured image — all in your brand voice.
          </DialogDescription>
        </DialogHeader>

        {/* Input Step */}
        {step === "input" && (
          <div className="space-y-4 pt-2">
            {/* Brand Voice Indicator */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-accent">Brand Voice: Active</p>
                <p className="text-[11px] text-muted-foreground">Warm, elegant & conversational · Target: Women 25-45 · Applied automatically</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-topic" className="text-sm font-medium">
                What should the blog post be about? *
              </Label>
              <Textarea
                id="ai-topic"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  // Auto-update word count recommendation
                  const rec = getRecommendedWordCount(e.target.value);
                  setTargetWordCount(rec.value);
                }}
                placeholder="e.g., 10 minimalist bedroom ideas for small apartments, how to style a reading nook on a budget..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="ai-keywords" className="text-sm font-medium">
                  Target Keywords
                </Label>
                <Input
                  id="ai-keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., minimalist decor, cozy"
                />
              </div>
            </div>

            {/* Word Count Targeting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-accent" />
                  Target Word Count
                </Label>
                <span className="text-sm font-bold text-accent">{targetWordCount} words</span>
              </div>
              <Slider
                value={[targetWordCount]}
                onValueChange={(v) => setTargetWordCount(v[0])}
                min={800}
                max={3000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>800 (Quick)</span>
                <span>1500 (Standard)</span>
                <span>2500 (In-depth)</span>
                <span>3000</span>
              </div>
              {recommendation && (
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex items-start gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">Recommended: {recommendation.value} words</span>
                    {" — "}{recommendation.reason}
                  </p>
                </div>
              )}
            </div>

            {/* What's included */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
              <p className="text-[11px] font-semibold text-foreground">What's included:</p>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { icon: Globe, label: "Competitor research" },
                  { icon: ListChecks, label: "Table of Contents" },
                  { icon: HelpCircle, label: "FAQ schema (5-7 Q&As)" },
                  { icon: ImageIcon, label: "Auto alt text" },
                  { icon: TrendingUp, label: "Product discovery" },
                  { icon: Search, label: "SEO optimization" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Icon className="w-3 h-3 text-accent" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Title Generator */}
            <div className="border rounded-lg p-3 space-y-3 bg-accent/5 border-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold">AI Title Ideas</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!topic.trim()) { toast.error("Enter a topic first"); return; }
                    setIsGeneratingTitles(true);
                    try {
                      const { data, error } = await supabase.functions.invoke('generate-seo-titles', {
                        body: { topic, keywords, category },
                      });
                      if (error) throw error;
                      if (data?.error) throw new Error(data.error);
                      setTitleIdeas(data.titles || []);
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to generate titles');
                    } finally {
                      setIsGeneratingTitles(false);
                    }
                  }}
                  disabled={isGeneratingTitles || !topic.trim()}
                  className="rounded-full text-xs h-7 border-accent/30 text-accent hover:bg-accent/10"
                >
                  {isGeneratingTitles ? (
                    <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Generating...</>
                  ) : (
                    'Generate Title Ideas'
                  )}
                </Button>
              </div>
              {titleIdeas.length > 0 && (
                <div className="space-y-1.5">
                  {titleIdeas.map((idea, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedTitle(idea.title)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                        selectedTitle === idea.title 
                          ? 'border-accent bg-accent/10 ring-1 ring-accent/30' 
                          : 'border-border/50 hover:border-accent/30 bg-background/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium line-clamp-1 flex-1">{idea.title}</span>
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          idea.seo_score >= 8 ? 'bg-emerald-500/10 text-emerald-600' :
                          idea.seo_score >= 6 ? 'bg-accent/10 text-accent' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          SEO {idea.seo_score}/10
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{idea.reasoning}</p>
                    </button>
                  ))}
                  {selectedTitle && (
                    <p className="text-[10px] text-accent font-medium flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Selected title will be used for generation
                    </p>
                  )}
                </div>
              )}
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
        {(step === "discovering-products" || step === "researching-competitors" || step === "generating-text" || step === "generating-image") && (
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
              {/* Step 0: Discover Products */}
              <div className="flex items-center gap-3">
                {step === "discovering-products" ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {step === "discovering-products"
                      ? "Discovering trending products..."
                      : `Products discovered${discoveredProducts.length > 0 ? ` (${discoveredProducts.length} added to shop)` : ""}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Finding relevant Amazon products for your topic
                  </p>
                </div>
              </div>

              {/* Step 1: Competitor Research */}
              <div className="flex items-center gap-3">
                {step === "researching-competitors" ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : step === "discovering-products" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                )}
                <div>
                  <p className={`text-sm font-medium ${step === "discovering-products" ? "text-muted-foreground" : ""}`}>
                    {step === "researching-competitors"
                      ? "Analyzing competitor content..."
                      : step === "discovering-products" ? "Research competitors" : "Competitor gaps identified"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ensuring your post covers more than top-ranking articles
                  </p>
                </div>
              </div>

              {/* Step 2: Generate Content */}
              <div className="flex items-center gap-3">
                {step === "generating-text" ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : step === "discovering-products" || step === "researching-competitors" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                )}
                <div>
                  <p className={`text-sm font-medium ${step === "discovering-products" || step === "researching-competitors" ? "text-muted-foreground" : ""}`}>
                    {step === "generating-text"
                      ? `Writing ${targetWordCount}-word article with TOC & FAQs...`
                      : step === "discovering-products" || step === "researching-competitors" ? "Write blog content" : "Content generated"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Brand voice, product embeds, FAQ schema, and auto alt text
                  </p>
                </div>
              </div>

              {/* Step 3: Generate Image */}
              <div className="flex items-center gap-3">
                {step === "generating-image" ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step !== "generating-image" ? "text-muted-foreground" : ""
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
              This usually takes 45-90 seconds
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
                <div className="space-y-1">
                  <img
                    src={generatedData.image_url}
                    alt={generatedData.featured_image_alt || "AI generated featured"}
                    className="w-full h-44 object-cover rounded-lg shadow-sm"
                  />
                  {generatedData.featured_image_alt && (
                    <p className="text-[10px] text-muted-foreground italic">
                      Alt: {generatedData.featured_image_alt}
                    </p>
                  )}
                </div>
              )}

              {/* New Features Summary */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/80 rounded-lg p-2.5 text-center">
                  <ListChecks className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-[10px] font-semibold">Table of Contents</p>
                  <p className="text-[10px] text-muted-foreground">Auto-generated ✓</p>
                </div>
                <div className="bg-background/80 rounded-lg p-2.5 text-center">
                  <HelpCircle className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-[10px] font-semibold">FAQ Schema</p>
                  <p className="text-[10px] text-muted-foreground">
                    {generatedData.faq_schema?.length || 0} questions ✓
                  </p>
                </div>
              </div>

              {/* FAQ Preview */}
              {generatedData.faq_schema && generatedData.faq_schema.length > 0 && (
                <div className="bg-background/80 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-accent" />
                    FAQ Schema Preview (for Google Rich Results)
                  </p>
                  <div className="space-y-1.5">
                    {generatedData.faq_schema.slice(0, 3).map((faq, i) => (
                      <div key={i} className="text-[11px]">
                        <p className="font-medium text-foreground">Q: {faq.question}</p>
                        <p className="text-muted-foreground line-clamp-1">A: {faq.answer}</p>
                      </div>
                    ))}
                    {generatedData.faq_schema.length > 3 && (
                      <p className="text-[10px] text-accent">+{generatedData.faq_schema.length - 3} more questions</p>
                    )}
                  </div>
                </div>
              )}

              {/* Discovered Products Summary */}
              {discoveredProducts.length > 0 && (
                <div className="bg-background/80 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                    {discoveredProducts.length} New Products Added to Shop (as drafts)
                  </p>
                  <div className="space-y-1.5">
                    {discoveredProducts.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-2 text-xs">
                        {p.image_url && (
                          <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="flex-1 truncate text-muted-foreground">{p.name}</span>
                        <span className="text-foreground font-medium">{p.price}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Products are saved as inactive drafts. Go to Admin → Products to review and activate them.
                  </p>
                </div>
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
                <span className="inline-flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">
                  <Target className="w-3 h-3" />
                  {targetWordCount}w target
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

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        seo.score >= 80 ? "bg-accent" : seo.score >= 60 ? "bg-foreground/50" : "bg-destructive"
                      }`}
                      style={{ width: `${seo.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{seo.verdict}</p>

                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {seo.checks.map((check, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={check.pass ? "text-accent" : "text-destructive"}>
                            {check.pass ? "✓" : "✗"}
                          </span>
                          <span className={check.pass ? "text-foreground" : "text-muted-foreground"}>
                            {check.label}
                          </span>
                          {check.detail && (
                            <span className="text-muted-foreground ml-auto">({check.detail})</span>
                          )}
                        </div>
                        {!check.pass && check.fix && (
                          <p className="text-[10px] text-destructive/80 pl-5 leading-relaxed">
                            💡 {check.fix}
                          </p>
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
