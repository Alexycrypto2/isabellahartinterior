
-- Add description and cover_image_url to product_categories
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Create junction table for multi-category assignments
CREATE TABLE IF NOT EXISTS product_category_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_slug)
);

ALTER TABLE product_category_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view assignments" ON product_category_assignments FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage assignments" ON product_category_assignments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert multi-room assignments for existing products based on old category
-- Lighting → Living Room + Bedroom
INSERT INTO product_category_assignments (product_id, category_slug)
SELECT id, 'living-room' FROM products WHERE lower(category) IN ('lighting', 'decor', 'decor-accents', 'decor & accents', 'furniture', 'storage')
ON CONFLICT DO NOTHING;

INSERT INTO product_category_assignments (product_id, category_slug)
SELECT id, 'bedroom' FROM products WHERE lower(category) IN ('lighting', 'textiles', 'furniture')
ON CONFLICT DO NOTHING;

-- Textiles also go to Living Room
INSERT INTO product_category_assignments (product_id, category_slug)
SELECT id, 'living-room' FROM products WHERE lower(category) = 'textiles'
ON CONFLICT DO NOTHING;

-- Storage goes to multiple rooms
INSERT INTO product_category_assignments (product_id, category_slug)
SELECT id, 'bedroom' FROM products WHERE lower(category) = 'storage'
ON CONFLICT DO NOTHING;

INSERT INTO product_category_assignments (product_id, category_slug)
SELECT id, 'home-office' FROM products WHERE lower(category) = 'storage'
ON CONFLICT DO NOTHING;

-- Update primary category on products table
UPDATE products SET category = 'living-room' WHERE lower(category) IN ('lighting', 'decor', 'decor-accents', 'decor & accents', 'furniture', 'storage');
UPDATE products SET category = 'bedroom' WHERE lower(category) = 'textiles';

-- Delete old product categories and insert new room-based ones
DELETE FROM product_categories;

INSERT INTO product_categories (name, slug, icon, display_order, description) VALUES
('Living Room', 'living-room', '🛋️', 1, 'Curated Amazon finds for your perfect living room'),
('Bedroom', 'bedroom', '🛏️', 2, 'Beautiful bedroom decor and Amazon finds for your dream bedroom'),
('Bathroom', 'bathroom', '🚿', 3, 'Luxury bathroom upgrades and accessories from Amazon'),
('Kitchen', 'kitchen', '🍳', 4, 'Aesthetic kitchen finds and organization from Amazon'),
('Home Office', 'home-office', '💻', 5, 'Stylish home office decor and organization finds'),
('Entryway', 'entryway', '🚪', 6, 'Make a stunning first impression with these Amazon finds'),
('Outdoor & Patio', 'outdoor-patio', '🌿', 7, 'Beautiful outdoor living spaces with Amazon finds'),
('All Rooms', 'all-rooms', '✨', 8, 'Browse all curated Amazon home decor finds');
