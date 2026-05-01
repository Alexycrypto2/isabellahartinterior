import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getCustomTextConfig() {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("site_settings").select("value").eq("key", "ai_api").single();
    if (!data) return null;
    const v = data.value as Record<string, any>;
    const key = v.text_api_key || v.api_key;
    return {
      priority: v.priority || "custom",
      api_key: key || null,
      provider: v.text_provider || v.provider || "openai",
      model: v.text_model || v.model || "",
      endpoint: v.text_endpoint || "",
    };
  } catch (_e) { return null; }
}

// OpenAI-style chat call (also works for OpenAI-compatible custom endpoints).
async function callOpenAIStyle(cfg: any, payload: Record<string, any>): Promise<Response | null> {
  if (!cfg?.api_key) return null;
  const provider = cfg.provider || "openai";
  // Tool calling is reliable on OpenAI / OpenAI-compatible. For other providers we still try.
  const url = (provider === "custom" && cfg.endpoint) ? cfg.endpoint : "https://api.openai.com/v1/chat/completions";
  const model = cfg.model || (provider === "openai" ? "gpt-4o-mini" : payload.model);
  return await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, model }),
  });
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_product",
      description: "Create a new product in the shop. Use this when the user asks to add a product.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Product name" },
          description: { type: "string", description: "Product description (2-3 sentences)" },
          price: { type: "string", description: "Price like '$29.99'" },
          original_price: { type: "string", description: "Original price if on sale" },
          category: { type: "string", description: "Primary category slug" },
          categories: { type: "array", items: { type: "string" }, description: "Room category slugs: living-room, bedroom, bathroom, kitchen, home-office, entryway, outdoor-patio" },
          badge: { type: "string", description: "Badge text like 'New', 'Best Seller', 'Sale'" },
          is_active: { type: "boolean", description: "Whether product is visible on site. Default false (draft)." },
          is_featured: { type: "boolean", description: "Whether product is featured on homepage" },
        },
        required: ["name", "description", "price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "Update an existing product's fields",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Product slug to identify which product to update" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "string" },
          badge: { type: "string" },
          is_active: { type: "boolean" },
          is_featured: { type: "boolean" },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_blog_post",
      description: "Create a new blog post. Generate full HTML content with headings, paragraphs, and lists.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string", description: "Full blog post HTML content with h2/h3/p/ul/li tags" },
          excerpt: { type: "string", description: "Short excerpt (1-2 sentences)" },
          category: { type: "string" },
          author: { type: "string", description: "Default: Isabella Hart" },
          published: { type: "boolean", description: "Whether to publish immediately. Default false (draft)." },
          meta_title: { type: "string" },
          meta_description: { type: "string" },
        },
        required: ["title", "content", "excerpt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_blog_post",
      description: "Update an existing blog post",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          published: { type: "boolean" },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_category",
      description: "Create a new room category for the shop",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          icon: { type: "string", description: "Emoji icon" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_setting",
      description: "Update a site setting (hero text, contact info, etc.)",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Setting key like 'hero', 'contact', 'footer', 'about', 'shop'" },
          value: { type: "object", description: "Setting value as JSON object" },
        },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_banner",
      description: "Create a seasonal/promotional banner",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          badge_text: { type: "string" },
          cta_text: { type: "string" },
          cta_link: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "List current products in the shop to see what exists",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "list_blog_posts",
      description: "List current blog posts",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "list_categories",
      description: "List room categories",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_settings",
      description: "List all site settings",
      parameters: { type: "object", properties: {} },
    },
  },
];

const systemPrompt = `You are **Isabella Hart Interior's AI Engineer** — you can directly make changes to the website database.

## YOUR CAPABILITIES
You have tools to CREATE, UPDATE, and LIST:
- **Products** — add new items to the shop with categories, pricing, badges
- **Blog Posts** — write and publish full blog articles with HTML content
- **Room Categories** — add new room categories to organize products
- **Site Settings** — change hero text, contact info, footer, etc.
- **Banners** — create seasonal/promotional banners

## CRITICAL RULES

1. **USE YOUR TOOLS** — When the user asks to add, create, or change something, USE the appropriate tool. Do NOT just give instructions.

2. **ASK BEFORE ACTING** — For destructive or large changes, briefly confirm with the user first. For simple additions, go ahead.

3. **READ FIRST** — If you need to understand what exists, use list_products, list_blog_posts, list_categories, or list_settings first.

4. **BLOG CONTENT** — When creating blog posts, write REAL, full HTML content (1000+ words) with proper h2, h3, p, ul, li tags. Write like a professional interior design blogger.

5. **PRODUCT DETAILS** — When creating products:
   - Generate a good description
   - Set appropriate price
   - Assign to relevant room categories (living-room, bedroom, bathroom, kitchen, home-office, entryway, outdoor-patio)
   - Default to is_active: false (draft) unless user says to publish
   - Amazon affiliate URL is auto-generated

6. **BE CONVERSATIONAL** — After taking action, summarize what you did clearly.

7. **What you CANNOT do**: Add new pages, change UI components, modify design/layout code. For those, explain that the user needs Lovable.

## Response Style
- Brief, clear, professional
- Use **bold** for emphasis
- ✅ for completed actions, ⚠️ for warnings
- After creating something, tell the user where to find it (e.g. "View in Admin > Products")`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    if (body.healthCheck) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle action execution from frontend
    if (body.executeAction) {
      const { action, params } = body.executeAction;
      const actionsUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-admin-actions`;
      const resp = await fetch(actionsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
        body: JSON.stringify({ action, params }),
      });
      const result = await resp.json();
      return new Response(JSON.stringify(result), {
        status: resp.ok ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const customCfg = await getCustomTextConfig();
    const priority = customCfg?.priority || "custom";
    const hasCustomKey = !!customCfg?.api_key;
    // Tool-calling fallback is reliable on OpenAI and OpenAI-compatible providers.
    const customSupportsTools = hasCustomKey && (customCfg.provider === "openai" || customCfg.provider === "custom");

    const callLovable = async (msgs: any[], withTools = true) => {
      if (!LOVABLE_API_KEY) return null;
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: msgs,
          ...(withTools ? { tools: TOOLS } : {}),
          stream: false,
        }),
      });
      if (r.status === 429) throw Object.assign(new Error("Rate limited. Please try again in a moment."), { status: 429 });
      if (r.status === 402) { console.log("Lovable credits exhausted in dev-chat"); return null; }
      if (!r.ok) { console.error("AI gateway error:", r.status, await r.text()); return null; }
      return r;
    };

    const callCustom = async (msgs: any[], withTools = true) => {
      const payload: Record<string, any> = { messages: msgs, stream: false };
      if (withTools && customSupportsTools) payload.tools = TOOLS;
      return await callOpenAIStyle(customCfg, payload);
    };

    const initialMessages = [{ role: "system", content: systemPrompt }, ...messages];
    let response: Response | null = null;
    try {
      if (priority === "custom" && hasCustomKey) {
        response = await callCustom(initialMessages);
        if (!response || !response.ok) response = await callLovable(initialMessages);
      } else {
        response = await callLovable(initialMessages);
        if (!response && hasCustomKey) response = await callCustom(initialMessages);
      }
    } catch (e: any) {
      if (e?.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw e;
    }

    if (!response || !response.ok) {
      return new Response(JSON.stringify({
        error: hasCustomKey
          ? "AI service unavailable. Both built-in credits and your custom key failed."
          : "AI credits exhausted. Add your own API key in Admin → Settings → AI API to keep using the dev assistant.",
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    if (!choice) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const msg = choice.message;
    
    // Check if AI wants to call tools
    if (msg.tool_calls?.length) {
      // Execute all tool calls via ai-admin-actions
      const actionsUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-admin-actions`;
      const toolResults = [];
      
      for (const toolCall of msg.tool_calls) {
        const action = toolCall.function.name;
        let params = {};
        try {
          params = JSON.parse(toolCall.function.arguments);
        } catch {}
        
        const resp = await fetch(actionsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
          body: JSON.stringify({ action, params }),
        });
        const result = await resp.json();
        toolResults.push({
          tool_call_id: toolCall.id,
          action,
          params,
          result,
          success: resp.ok,
        });
      }

      // Get a follow-up response from AI with the tool results
      const followUpMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        msg,
        ...toolResults.map(tr => ({
          role: "tool" as const,
          tool_call_id: tr.tool_call_id,
          content: JSON.stringify(tr.result),
        })),
      ];

      // Use the same priority for the follow-up summarization (no tools needed)
      let followUp: Response | null = null;
      try {
        if (priority === "custom" && hasCustomKey) {
          followUp = await callCustom(followUpMessages, false);
          if (!followUp || !followUp.ok) followUp = await callLovable(followUpMessages, false);
        } else {
          followUp = await callLovable(followUpMessages, false);
          if ((!followUp || !followUp.ok) && hasCustomKey) followUp = await callCustom(followUpMessages, false);
        }
      } catch (_e) { /* no-op, will fall through */ }
      let followUpContent = "Action completed.";
      if (followUp && followUp.ok) {
        const followUpData = await followUp.json();
        followUpContent = followUpData.choices?.[0]?.message?.content || followUpContent;
      }

      return new Response(JSON.stringify({
        content: followUpContent,
        actions_taken: toolResults.map(tr => ({
          action: tr.action,
          success: tr.success,
          message: tr.result.message || tr.result.error,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular text response (no tool calls)
    return new Response(JSON.stringify({
      content: msg.content || "I'm not sure how to help with that.",
      actions_taken: [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("dev-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
