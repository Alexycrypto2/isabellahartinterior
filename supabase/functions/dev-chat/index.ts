import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: TOOLS,
        stream: false, // Need non-streaming for tool calls
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

      const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: followUpMessages,
          stream: false,
        }),
      });

      const followUpData = await followUp.json();
      const followUpContent = followUpData.choices?.[0]?.message?.content || "Action completed.";

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
