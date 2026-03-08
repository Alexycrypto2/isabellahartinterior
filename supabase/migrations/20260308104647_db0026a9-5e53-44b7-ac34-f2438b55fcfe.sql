
-- Fix contact_submissions: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND name <> '' AND
    email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    message IS NOT NULL AND message <> ''
  );

CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact submissions" ON public.contact_submissions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix customer_photo_submissions: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Anyone can submit photos" ON public.customer_photo_submissions;
DROP POLICY IF EXISTS "Anyone can view approved photos" ON public.customer_photo_submissions;
DROP POLICY IF EXISTS "Admins can view all photo submissions" ON public.customer_photo_submissions;
DROP POLICY IF EXISTS "Admins can update photo submissions" ON public.customer_photo_submissions;
DROP POLICY IF EXISTS "Admins can delete photo submissions" ON public.customer_photo_submissions;

CREATE POLICY "Anyone can submit photos" ON public.customer_photo_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND name <> '' AND
    email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    photo_url IS NOT NULL AND photo_url <> ''
  );

CREATE POLICY "Anyone can view approved photos" ON public.customer_photo_submissions
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all photo submissions" ON public.customer_photo_submissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update photo submissions" ON public.customer_photo_submissions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete photo submissions" ON public.customer_photo_submissions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
