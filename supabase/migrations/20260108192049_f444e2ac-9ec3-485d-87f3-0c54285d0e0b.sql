-- Fix overly permissive RLS policies

-- 1. Drop and recreate analytics_events INSERT policy with basic validation
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
TO public 
WITH CHECK (
  -- Only allow inserting with a valid visitor_id (non-empty string)
  visitor_id IS NOT NULL AND 
  visitor_id != '' AND
  event_type IS NOT NULL AND
  event_type != ''
);

-- 2. Drop and recreate newsletter_subscribers INSERT policy with email validation
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
TO public 
WITH CHECK (
  -- Validate email format (basic check) and ensure it's provided
  email IS NOT NULL AND 
  email != '' AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 3. Ensure newsletter_subscribers has no public SELECT (prevent email harvesting)
-- The existing "Admins can manage subscribers" policy handles admin access
-- No additional SELECT policy needed for public - this is correct