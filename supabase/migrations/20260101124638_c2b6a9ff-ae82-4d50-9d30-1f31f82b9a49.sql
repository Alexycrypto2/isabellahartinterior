-- Create blog_categories table
CREATE TABLE public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view categories"
ON public.blog_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.blog_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.blog_categories (name, slug) VALUES
('BEDROOM', 'bedroom'),
('LIVING ROOM', 'living-room'),
('ORGANIZATION', 'organization'),
('KITCHEN', 'kitchen'),
('BATHROOM', 'bathroom'),
('OUTDOOR', 'outdoor');