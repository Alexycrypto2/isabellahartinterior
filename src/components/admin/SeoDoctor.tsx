import { useMemo, useState } from "react";
import { Stethoscope, Loader2, CheckCircle2, AlertTriangle, XCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SeoDoctorInput {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  slug: string;
  targetKeywords: string;
  imageUrl: string;
}

export interface SeoDoctorTreatment {
  title?: string;
  meta_title?: string;
  meta_description?: string;
  excerpt?: string;
  content?: string;
}

type Severity = "critical" | "warning";
interface Check {
  id: string;
  group: string;
  label: string;
  ok: boolean;
  severity: Severity;
  fix: string;
  weight: number;
}

export function diagnoseSeo(p: SeoDoctorInput): Check[] {
  const main = p.targetKeywords.split(",")[0]?.trim().toLowerCase() || "";
  const t = p.metaTitle || p.title;
  const d = p.metaDescription || p.excerpt;
  const html = p.content || "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(" ").length : 0;
  const h2s = (html.match(/<h2/gi) || []).length;
  const h2Text = (html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []).join(" ").toLowerCase();
  const imgs = html.match(/<img[^>]*>/gi) || [];
  const imgsNoAlt = imgs.filter((i) => !/alt="[^"]+"/i.test(i)).length;
  const internal = (html.match(/href="(\/|https?:\/\/(www\.)?isabell[a-z]*hart)[^"]*"/gi) || []).length;
  const density = main && words ? ((lower.split(main).length - 1) * main.split(" ").length / words) * 100 : 0;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentence = sentences.length ? words / sentences.length : 0;
  const hasFaq = /faq/i.test(html);
  const amazon = /amazon\.|amzn\./i.test(html);

  return [
    { id: "kw", group: "Keywords", label: "A main target keyword is set", ok: !!main, severity: "critical", weight: 3, fix: "Add a main keyword in the Target Keywords box, e.g. “cozy bedroom ideas”." },
    { id: "t-len", group: "Title", label: "Search title is 30–60 characters", ok: t.length >= 30 && t.length <= 60, severity: "critical", weight: 3, fix: `Your title is ${t.length} characters. Aim for 30–60 so Google doesn't cut it off.` },
    { id: "t-kw", group: "Title", label: "Main keyword appears in the title", ok: !!main && t.toLowerCase().includes(main), severity: "critical", weight: 3, fix: "Put your main keyword near the start of the search title." },
    { id: "d-len", group: "Description", label: "Description is 120–160 characters", ok: d.length >= 120 && d.length <= 160, severity: "warning", weight: 2, fix: `Your description is ${d.length} characters. Aim for 120–160.` },
    { id: "d-kw", group: "Description", label: "Main keyword appears in the description", ok: !!main && d.toLowerCase().includes(main), severity: "warning", weight: 2, fix: "Mention the main keyword naturally in the description." },
    { id: "slug", group: "Address", label: "Short, keyword-rich web address", ok: !!p.slug && p.slug.split("-").length <= 8 && (!main || main.split(" ").some((w) => p.slug.includes(w))), severity: "warning", weight: 1, fix: "Keep the web address short (under 8 words) and include the keyword." },
    { id: "open", group: "Content", label: "Keyword in the first paragraph", ok: !!main && lower.slice(0, 600).includes(main), severity: "warning", weight: 2, fix: "Use the main keyword in the first 100 words." },
    { id: "len", group: "Content", label: "At least 1,200 words", ok: words >= 1200, severity: "critical", weight: 3, fix: `This article has ${words} words. Ranking guides usually run 1,200–2,500.` },
    { id: "h2", group: "Structure", label: "At least 4 section headings", ok: h2s >= 4, severity: "warning", weight: 2, fix: `Found ${h2s} section headings. Break the article into 4+ clear sections.` },
    { id: "h2kw", group: "Structure", label: "Keyword appears in a section heading", ok: !!main && main.split(" ").some((w) => w.length > 3 && h2Text.includes(w)), severity: "warning", weight: 1, fix: "Use the keyword (or a close variation) in at least one section heading." },
    { id: "density", group: "Keywords", label: "Keyword density 0.5–2.5%", ok: density >= 0.5 && density <= 2.5, severity: "warning", weight: 2, fix: `Density is ${density.toFixed(1)}%. Below 0.5% is weak; above 2.5% looks like stuffing.` },
    { id: "links", group: "Links", label: "At least 2 links to other pages on the site", ok: internal >= 2, severity: "warning", weight: 2, fix: `Found ${internal}. Link to related Rooms, Style Guides or articles.` },
    { id: "img", group: "Images", label: "Has a featured image", ok: !!p.imageUrl, severity: "critical", weight: 2, fix: "Add a featured image (1200×630)." },
    { id: "alt", group: "Images", label: "All images have descriptions (alt text)", ok: imgsNoAlt === 0, severity: "warning", weight: 1, fix: `${imgsNoAlt} image(s) have no description for Google.` },
    { id: "read", group: "Readability", label: "Easy-to-read sentences (under 22 words)", ok: avgSentence > 0 && avgSentence <= 22, severity: "warning", weight: 1, fix: `Average sentence is ${avgSentence.toFixed(0)} words. Shorter reads better on phones.` },
    { id: "faq", group: "Rich results", label: "Includes an FAQ section", ok: hasFaq, severity: "warning", weight: 1, fix: "Add 3–5 reader questions at the end. They often match what people search." },
    { id: "editorial", group: "Trust", label: "Editorial, not shop-heavy", ok: !amazon, severity: "warning", weight: 1, fix: "Shop links inside the article text can weaken trust. Keep products in the Get the Look area." },
  ];
}

interface Props {
  input: SeoDoctorInput;
  onTreat: (t: SeoDoctorTreatment) => void;
}

const SeoDoctor = ({ input, onTreat }: Props) => {
  const [treating, setTreating] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const checks = useMemo(() => diagnoseSeo(input), [input]);
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const score = Math.round((checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0) / total) * 100);
  const failed = checks.filter((c) => !c.ok);
  const critical = failed.filter((c) => c.severity === "critical");
  const status = score >= 80 ? "Healthy" : score >= 55 ? "Needs care" : "Critical";

  const treat = async () => {
    if (!input.content.trim()) return toast.error("Write or generate the article first.");
    setTreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("fix-seo-issues", {
        body: {
          blogData: {
            title: input.title,
            meta_title: input.metaTitle || input.title,
            meta_description: input.metaDescription || input.excerpt,
            excerpt: input.excerpt,
            content: input.content,
            slug: input.slug,
          },
          failedChecks: failed.map((c) => ({ label: c.label, fix: c.fix })),
          mode: "fix",
          keywords: input.targetKeywords,
        },
      });
      if (error) {
        const s = (error as any)?.context?.status;
        throw new Error(s === 429 ? "The AI is busy. Try again in a minute." : s === 402 ? "AI credits have run out." : error.message);
      }
      if (data?.error) throw new Error(data.error);
      onTreat({
        title: data.title,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        excerpt: data.excerpt,
        content: data.content,
      });
      setNotes(data.fixes_applied || []);
      toast.success("Treatment applied. Review the changes, then save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Treatment failed");
    } finally {
      setTreating(false);
    }
  };

  const ringColor = score >= 80 ? "text-accent" : score >= 55 ? "text-muted-foreground" : "text-destructive";

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-muted" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${score} 100`} strokeLinecap="round" className={ringColor} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-2xl">{score}</span>
        </div>
        <div className="flex-1 min-w-[180px]">
          <p className="flex items-center gap-2 text-label text-accent"><Stethoscope className="h-4 w-4" /> SEO Doctor</p>
          <p className="font-display text-2xl">{status}</p>
          <p className="text-sm text-muted-foreground">{critical.length} critical · {failed.length - critical.length} to improve · {checks.length - failed.length} passing</p>
        </div>
        <Button onClick={treat} disabled={treating || failed.length === 0} className="rounded-full">
          {treating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Treating…</> : <><Wand2 className="mr-2 h-4 w-4" />Treat with AI</>}
        </Button>
      </div>

      {failed.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Prescription</p>
          {failed.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1)).map((c) => (
            <div key={c.id} className="flex gap-3 rounded-md border border-border bg-background p-3">
              {c.severity === "critical" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">{c.label} <span className="ml-1 text-xs font-normal text-muted-foreground">· {c.group}</span></p>
                <p className="text-xs text-muted-foreground">{c.fix}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground">Passing checks ({checks.length - failed.length})</summary>
        <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {checks.filter((c) => c.ok).map((c) => (
            <li key={c.id} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-accent" />{c.label}</li>
          ))}
        </ul>
      </details>

      {notes.length > 0 && (
        <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
          <p className="mb-1 text-sm font-medium">Treatment notes</p>
          <ul className="list-disc pl-5 text-xs text-muted-foreground">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      )}
      <p className="text-xs text-muted-foreground">The Doctor checks proven ranking basics. It can't see live Google rankings, so results also depend on competition and time.</p>
    </div>
  );
};

export default SeoDoctor;
