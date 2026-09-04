ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS room TEXT,
  ADD COLUMN IF NOT EXISTS style TEXT,
  ADD COLUMN IF NOT EXISTS pinterest_title TEXT,
  ADD COLUMN IF NOT EXISTS pinterest_description TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_cta TEXT;

CREATE INDEX IF NOT EXISTS blog_posts_room_idx ON public.blog_posts (room);
CREATE INDEX IF NOT EXISTS blog_posts_style_idx ON public.blog_posts (style);
CREATE INDEX IF NOT EXISTS blog_posts_published_room_idx ON public.blog_posts (published, room);
CREATE INDEX IF NOT EXISTS blog_posts_published_style_idx ON public.blog_posts (published, style);