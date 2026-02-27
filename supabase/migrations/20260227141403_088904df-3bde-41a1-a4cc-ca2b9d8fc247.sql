
-- Create storage bucket for customer photo submissions
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-photos', 'customer-photos', true);

-- Storage policies: anyone can upload, admins can manage
CREATE POLICY "Anyone can upload customer photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'customer-photos');

CREATE POLICY "Anyone can view customer photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-photos');

CREATE POLICY "Admins can delete customer photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'customer-photos' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));

-- Table to track submissions with moderation
CREATE TABLE public.customer_photo_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram_handle TEXT,
  caption TEXT,
  photo_url TEXT NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'living-room',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_photo_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit photos"
ON public.customer_photo_submissions FOR INSERT
WITH CHECK (
  name IS NOT NULL AND name <> '' AND
  email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  photo_url IS NOT NULL AND photo_url <> ''
);

-- Anyone can view approved photos
CREATE POLICY "Anyone can view approved photos"
ON public.customer_photo_submissions FOR SELECT
USING (is_approved = true);

-- Admins can view all
CREATE POLICY "Admins can view all photo submissions"
ON public.customer_photo_submissions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update (approve/reject)
CREATE POLICY "Admins can update photo submissions"
ON public.customer_photo_submissions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete photo submissions"
ON public.customer_photo_submissions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
