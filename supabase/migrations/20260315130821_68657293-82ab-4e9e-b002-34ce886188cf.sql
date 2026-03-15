
CREATE TABLE public.product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  display_order integer NOT NULL DEFAULT 0,
  alt_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product media"
  ON public.product_media
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage product media"
  ON public.product_media
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX idx_product_media_order ON public.product_media(product_id, display_order);
