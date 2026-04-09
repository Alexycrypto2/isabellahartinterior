

## Understanding the Request

You want your in-app AI Engineer to **automatically make changes** to your site (like Lovable does) — not just give you instructions or show code. You want this as a backup when your Lovable credits run out.

## What's Realistically Possible

The AI Engineer lives inside your deployed website. It **cannot edit your source code files** — only Lovable has access to the project repository. However, most of what makes your site work (products, blog posts, categories, settings, banners, etc.) lives in **the database**. The AI CAN directly create, update, and delete database records.

This means the AI Engineer can automatically:
- Create new products with all details
- Write and publish blog posts  
- Add/edit room categories
- Update site settings (hero text, contact info, colors, etc.)
- Manage seasonal banners
- Create newsletter campaigns
- Moderate comments
- Assign products to categories

What it **cannot** do (only Lovable can):
- Add new pages or routes
- Create new React components
- Change the visual layout/design code

## Plan

### 1. Create an "AI Actions" edge function
A new edge function `ai-admin-actions` that can execute database operations. The AI will decide which action to take based on the user's request and call the appropriate Supabase query. Supported actions:
- **create_product** — insert a new product with name, description, price, affiliate URL, category assignments
- **update_product** — edit existing product fields
- **create_blog_post** — write and save a full blog post (with AI-generated content)
- **update_setting** — change any site setting (hero text, colors, contact info, etc.)
- **create_category** — add a new room category
- **list_products / list_posts** — read current data to understand what exists

### 2. Upgrade the dev-chat edge function
Update the system prompt and add tool-calling. Instead of just chatting, the AI will:
- Analyze the user's request
- Decide which action(s) to take
- Execute them via Supabase client calls within the edge function
- Report back: "Done! I created a new product called X and assigned it to Living Room and Bedroom."

### 3. Update the DevAIChat UI
- Show a confirmation step: "I'm about to create a product called 'Rattan Mirror' — shall I proceed?" with Confirm/Cancel buttons
- Show success feedback with links: "Product created! [View Product] [Edit in Admin]"
- Add an "actions taken" indicator so the user sees what was changed
- Keep the chat history working as-is

### 4. Add action confirmation flow
Before the AI executes any change, it will propose the action and wait for user confirmation. This prevents accidental changes. The flow:
1. User: "Add a new rattan mirror product for $45"
2. AI: "I'll create this product: **Rattan Mirror** - $45 - Categories: Living Room, Bedroom. Confirm?"
3. User clicks Confirm
4. AI executes and reports: "Done! Product created."

## Technical Approach
- The dev-chat edge function will use Supabase admin client internally to perform CRUD operations
- Tool-calling will be used to structure the AI's actions (create_product, update_setting, etc.)
- The frontend will detect "action proposals" in the AI response and render confirm/cancel buttons
- All changes go through the same database the admin panel uses, so everything stays in sync

