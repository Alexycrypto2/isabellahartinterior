
-- Tighten update policy for chat_conversations
DROP POLICY "Anyone can update own conversation" ON public.chat_conversations;
CREATE POLICY "Anyone can update own conversation" ON public.chat_conversations FOR UPDATE TO public USING (true) WITH CHECK (status IN ('active', 'closed'));

-- Tighten insert policy for chat_messages
DROP POLICY "Anyone can insert messages" ON public.chat_messages;
CREATE POLICY "Anyone can insert messages" ON public.chat_messages FOR INSERT TO public WITH CHECK (
  content IS NOT NULL AND content <> '' AND length(content) <= 4000 AND role IN ('user', 'assistant', 'admin')
);

-- Tighten insert policy for chat_conversations
DROP POLICY "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT TO public WITH CHECK (
  visitor_id IS NOT NULL AND visitor_id <> ''
);
