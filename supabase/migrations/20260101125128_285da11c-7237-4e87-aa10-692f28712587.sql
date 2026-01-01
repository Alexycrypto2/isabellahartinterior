-- Create product_categories table
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_categories
CREATE POLICY "Anyone can view product categories"
ON public.product_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage product categories"
ON public.product_categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    original_price TEXT,
    category TEXT NOT NULL,
    image_url TEXT,
    affiliate_url TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    reviews INT DEFAULT 0,
    badge TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for products
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create site_settings table for editable content
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for site_settings updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default product categories
INSERT INTO public.product_categories (name, slug, icon, display_order) VALUES
('All Products', 'all', '✨', 0),
('Lighting', 'lighting', '💡', 1),
('Decor & Accents', 'decor', '🌿', 2),
('Textiles', 'textiles', '🧶', 3),
('Furniture', 'furniture', '🪑', 4),
('Storage', 'storage', '📦', 5);

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
('hero', '{"title": "Curated Home Finds", "subtitle": "Transform your space with our handpicked collection of beautiful, affordable home décor pieces.", "image_url": null}'::jsonb),
('about', '{"title": "About Us", "description": "We are passionate about helping you create beautiful spaces.", "image_url": null}'::jsonb),
('contact', '{"email": "hello@example.com", "phone": "", "address": ""}'::jsonb),
('footer', '{"copyright": "© 2024 Your Brand. All rights reserved.", "social_links": {}}'::jsonb),
('shop_hero', '{"title": "Shop Our Collection", "subtitle": "Handpicked pieces to transform your space", "image_url": null}'::jsonb);