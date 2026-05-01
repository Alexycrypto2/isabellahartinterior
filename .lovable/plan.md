## Goal

Make your own API keys the **default and persistent** AI provider so:
1. When built-in Lovable credits run out, the app keeps working using your keys (no waiting).
2. You can always reach **Admin → Settings → AI API** to add or change keys, even when built-in credits are exhausted.

## What's already in place (good news)

- The `priority` toggle ("My API" vs "Built-in") already exists in `AdminSettings.tsx`.
- All AI edge functions (`generate-blog-post`, `home-decor-chat`, `generate-pin-image`, etc.) already check `priority === "custom"` first and use your custom key before touching `LOVABLE_API_KEY` when "My API" is selected.
- Saving settings is a plain database upsert (`useUpsertSiteSetting`) — it does **not** consume any AI credits.

## What's wrong / what we'll change

### 1. Force "My API" to be the persistent default

- On a fresh project, the `ai_api` row in `site_settings` doesn't exist yet, so the toggle falls back to `'custom'` in code — but it's never written to the database. If anything ever writes `'lovable'`, it becomes sticky.
- Fix: on first load of the AI tab, if no `ai_api.priority` is saved, **automatically upsert `priority: 'custom'`** so it's persisted server-side. Edge functions then always read `'custom'` from the DB, even if the page hasn't been opened.
- Also auto-seed `priority: 'custom'` via a one-time migration so the default is locked in immediately.

### 2. Make sure the AI Settings page never breaks when credits are out

- Currently `testBuiltInCredits` is a manual button — that's fine, no auto-run on mount. Confirmed safe.
- We'll add a **prominent banner at the top of the AI tab** that detects "credits exhausted" status and tells you: "Built-in credits exhausted — your custom keys are now serving all AI traffic." This reassures you nothing is broken.
- Add a **"Quick add API key"** card at the very top of the AI tab (before any other section) so you can paste a key and save in one click without scrolling — useful in an emergency.

### 3. Harden edge-function fallback logic

- A few functions return a generic 402 error if the custom key is missing. We'll improve the error message to: **"No custom AI key configured. Go to Admin → Settings → AI API and add your OpenAI/Google/Anthropic key."** so it's actionable.
- Add explicit handling so a 402 from Lovable AI **automatically** falls through to your custom key without throwing — already mostly in place, will audit each AI function and patch any gaps (`generate-pin-image`, `generate-pin-description`, `home-decor-chat`, `dev-chat`, `ai-admin-actions`).

### 4. Visual confirmation in admin

- The existing **AI Status Indicator** card on the admin dashboard will now also show a **"Active source: My API key (OpenAI/Google/etc.)"** label when running on your key, so you have one-glance confidence.

## Files to change

- `src/pages/AdminSettings.tsx` — auto-persist `priority: 'custom'` on first load if not set; add status banner; add "Quick add" card at top of AI tab.
- `src/components/AdminLayout.tsx` or dashboard AI status card — surface active source.
- `supabase/functions/generate-pin-image/index.ts`, `generate-pin-description/index.ts`, `home-decor-chat/index.ts`, `dev-chat/index.ts`, `ai-admin-actions/index.ts`, `generate-blog-image/index.ts` — audit & ensure custom-key fallback on 402; improve error messages.
- New migration: upsert `site_settings` row `key='ai_api'` with `value={"priority":"custom"}` if missing.

## What you need to do after I ship this

1. Open **Admin → Settings → AI API**.
2. Paste your **OpenAI / Google Gemini / Anthropic** API key in the Text AI (and optionally Image AI) section. Click **Test** then **Save**.
3. From that moment on, all AI features (blog writer, chatbot, pin generator, dev assistant, recommendations) use **your key first**. Built-in credits are only used as a backup if your key fails.

## Out of scope

- Adding entirely new providers beyond OpenAI / Google / Anthropic / custom-OpenAI-compatible (already supported).
- Per-feature provider selection (currently one text key + one image key applies to all features — same as today).
