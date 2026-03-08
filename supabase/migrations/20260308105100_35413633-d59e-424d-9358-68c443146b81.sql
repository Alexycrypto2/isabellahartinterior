
-- Commission payments table for revenue tracking
CREATE TABLE public.commission_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount decimal(10,2) NOT NULL,
  source text NOT NULL DEFAULT 'Amazon Associates',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage commission payments" ON public.commission_payments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add scheduled_for column to blog_posts for content calendar
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

-- Broken links tracking table
CREATE TABLE public.broken_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  source_type text NOT NULL, -- 'product' or 'blog_post'
  source_id uuid NOT NULL,
  source_name text,
  status_code integer,
  last_checked timestamptz NOT NULL DEFAULT now(),
  is_resolved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.broken_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage broken links" ON public.broken_links
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Exit intent popup tracking (use analytics_events with event_type = 'exit_intent_shown' and 'exit_intent_converted')
