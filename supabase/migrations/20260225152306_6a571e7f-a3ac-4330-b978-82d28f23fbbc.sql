
-- Fix 1: Remove public read access from newsletter_subscribers
-- Drop the overly permissive INSERT policy and recreate with SELECT restriction
-- The "Anyone can subscribe" INSERT policy is fine, but we need to ensure no public SELECT exists

-- First check: newsletter_subscribers should only allow admin SELECT
-- The current "Anyone can subscribe to newsletter" is INSERT only, which is correct
-- But there's no explicit SELECT denial for non-admins, and the "Admins can manage subscribers" ALL policy
-- uses RESTRICTIVE mode. We need a PERMISSIVE SELECT policy for admins.

-- Drop the restrictive ALL policy and replace with granular permissive policies
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Admins can do everything
CREATE POLICY "Admins can select subscribers"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert subscribers"
ON public.newsletter_subscribers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subscribers"
ON public.newsletter_subscribers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscribers"
ON public.newsletter_subscribers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Anyone (including anon) can subscribe
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND email <> ''
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Fix 2: Remove public read access from activity_logs
-- Drop existing policies and recreate properly
DROP POLICY IF EXISTS "Admins can create activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;

CREATE POLICY "Admins can view activity logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create activity logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
