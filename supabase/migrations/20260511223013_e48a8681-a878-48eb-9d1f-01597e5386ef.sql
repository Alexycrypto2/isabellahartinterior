
-- 1. blog_comments: hide author_email from public via a SECURITY INVOKER view
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;

CREATE OR REPLACE VIEW public.public_blog_comments
WITH (security_invoker = true) AS
SELECT id, blog_post_id, author_name, content, created_at
FROM public.blog_comments
WHERE is_approved = true;

-- Recreate a row policy so the view (running as invoker) can read approved rows
CREATE POLICY "Public can view approved comments via view"
ON public.blog_comments
FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- Restrict the email column at the column-grant layer
REVOKE SELECT ON public.blog_comments FROM anon, authenticated;
GRANT SELECT (id, blog_post_id, author_name, content, created_at, is_approved)
  ON public.blog_comments TO anon, authenticated;
-- Admins query via service-side / authenticated full-table access still works because
-- admin policies and the table owner retain full access; grant author_email to authenticated
-- so admin UI can read it (RLS still restricts rows to admins on non-approved scenarios).
GRANT SELECT (author_email) ON public.blog_comments TO authenticated;

GRANT SELECT ON public.public_blog_comments TO anon, authenticated;

-- 2. customer_photo_submissions: drop public SELECT (unused by public client)
DROP POLICY IF EXISTS "Anyone can view approved photos" ON public.customer_photo_submissions;

-- 3. chat_messages: restrict anonymous inserts to role='user' only
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;

CREATE POLICY "Anyone can insert user messages"
ON public.chat_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  content IS NOT NULL
  AND content <> ''
  AND length(content) <= 4000
  AND role = 'user'
);

CREATE POLICY "Admins can insert admin/assistant messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND content IS NOT NULL
  AND content <> ''
  AND length(content) <= 4000
  AND role = ANY (ARRAY['user','assistant','admin'])
);

-- 4. customer-photos storage: require uploads under submissions/ prefix
DROP POLICY IF EXISTS "Anyone can upload customer photos" ON storage.objects;

CREATE POLICY "Anyone can upload customer photos to submissions"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'customer-photos'
  AND (storage.foldername(name))[1] = 'submissions'
);

-- 5. avatars bucket: explicit public SELECT policy (bucket already public)
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');
