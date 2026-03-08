
-- 1. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Blog comments table
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
  ON public.blog_comments FOR SELECT
  USING (is_approved = true);

-- Anyone can submit comments (with validation)
CREATE POLICY "Anyone can submit comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (
    author_name IS NOT NULL AND author_name <> '' AND length(author_name) <= 100
    AND author_email IS NOT NULL AND author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND content IS NOT NULL AND content <> '' AND length(content) <= 2000
  );

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments"
  ON public.blog_comments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
