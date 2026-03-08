CREATE TABLE IF NOT EXISTS public.seasonal_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text DEFAULT 'Shop Now',
  cta_link text DEFAULT '/shop',
  badge_text text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.seasonal_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners" ON public.seasonal_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage banners" ON public.seasonal_banners
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));