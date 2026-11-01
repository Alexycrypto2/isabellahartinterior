import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SerpCompetitor {
  title: string;
  domain: string;
  url?: string;
  word_count_estimate?: number;
  why_it_ranks?: string;
}

interface SerpAnalysis {
  rankability_score: number;
  verdict: string;
  is_indexed: boolean;
  summary: string;
  competitors: SerpCompetitor[];
  content_gaps: string[];
  recommendations: string[];
  as_of?: string;
}

function parseMaybeJson(text: string): SerpAnalysis | null {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isValidAnalysis(data: unknown): data is SerpAnalysis {
  const d = data as SerpAnalysis | null;
  return !!(
    d &&
    typeof d.rankability_score === "number" &&
    typeof d.verdict === "string" &&
    typeof d.is_indexed === "boolean" &&
    typeof d.summary === "string" &&
    Array.isArray(d.competitors) &&
    Array.isArray(d.content_gaps) &&
    Array.isArray(d.recommendations)
  );
}

const SYSTEM_PROMPT = `You are a live Google SERP intelligence analyst for an interior design blog (isabellehartinteriors.com).

You have LIVE Google Search access. Use it. Do not answer from memory — research the actual current Google results for the target keyword now.

Your job:
1. Search Google for the target keyword (and a close variation if useful).
2. Identify the top-ranking competitors (aim for 6-8). For each: exact result title, domain, estimated word count, and one sentence on why it ranks (authority, format, depth, freshness).
3. Determine what ALL the top results cover that readers expect — then identify what the user's article is MISSING (content gaps). Be specific and actionable.
4. Check whether the user's article URL appears anywhere in the live results for the keyword or a site: search — report if it is indexed and where.
5. Score the article's real ranking potential 0-100 based on the live competition: 80+ means a realistic shot at page 1 with the listed improvements; under 40 means the field is dominated by giants and a different angle is needed.
6. Give 3-6 prioritized recommendations that would most move the article up against these live competitors.

Respond with ONLY a JSON object, no markdown, in exactly this shape:
{
  "rankability_score": <number 0-100>,
  "verdict": "<short headline verdict, e.g. 'Tough field — needs deeper angles' >",
  "is_indexed": <boolean>,
  "summary": "<2-3 sentence honest summary of the live competition>",
  "competitors": [{"title": "...", "domain": "...", "url": "...", "word_count_estimate": <number>, "why_it_ranks": "..."}],
  "content_gaps": ["..."],
  "recommendations": ["..."],
  "as_of": "<today's date YYYY-MM-DD>"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const keyword = typeof body?.keyword === "string" ? body.keyword.trim() : "";
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const excerpt = typeof body?.excerpt === "string" ? body.excerpt.trim().slice(0, 600) : "";
    const wordCount = Number(body?.wordCount) || 0;

    if (keyword.length < 2 || keyword.length > 200) {
      return new Response(JSON.stringify({ error: "A target keyword (2-200 characters) is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!title || title.length > 300) {
      return new Response(JSON.stringify({ error: "A valid article title is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Built-in AI is not configured." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Analyze the live Google results for this article.

TARGET KEYWORD: ${keyword}
ARTICLE TITLE: ${title}
ARTICLE URL: ${url}
META DESCRIPTION / EXCERPT: ${excerpt || "(none)"}
ARTICLE WORD COUNT: ${wordCount}

Run the live searches now and return the JSON analysis.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "google_search" }],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "The AI is busy. Try again in a minute." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits have run out." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("check-live-serp AI error:", resp.status, errText);
      return new Response(JSON.stringify({ error: "Live SERP analysis failed. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = parseMaybeJson(typeof content === "string" ? content : "");
    if (!isValidAnalysis(parsed)) {
      console.error("check-live-serp: invalid analysis payload");
      return new Response(JSON.stringify({ error: "The live analysis came back incomplete. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis: SerpAnalysis = {
      ...parsed,
      rankability_score: Math.max(0, Math.min(100, Math.round(parsed.rankability_score))),
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("check-live-serp error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
