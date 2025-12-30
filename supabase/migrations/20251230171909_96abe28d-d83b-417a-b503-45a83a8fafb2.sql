-- Drop the newsletter_subscribers table and its policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can check their own subscription" ON public.newsletter_subscribers;
DROP TABLE IF EXISTS public.newsletter_subscribers;