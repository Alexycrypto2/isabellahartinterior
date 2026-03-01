
-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.product_reviews
FOR SELECT
USING (true);

-- Anyone can submit a review (with validation)
CREATE POLICY "Anyone can submit reviews"
ON public.product_reviews
FOR INSERT
WITH CHECK (
  reviewer_name IS NOT NULL AND
  reviewer_name <> '' AND
  length(reviewer_name) <= 100 AND
  rating >= 1 AND rating <= 5 AND
  (review_text IS NULL OR length(review_text) <= 500)
);

-- Admins can manage reviews
CREATE POLICY "Admins can manage reviews"
ON public.product_reviews
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
