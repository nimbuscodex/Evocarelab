-- Run this SQL in your Supabase SQL Editor

-- Create the products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert the product
INSERT INTO products (id, name, description, price, image_url, category, badge)
VALUES (
  'triple-h-mask-1',
  'Triple Hyaluronic Acid Mask',
  'Nuestra fórmula magistral que combina colágeno biomimético de bajo peso molecular con un complejo de triple ácido hialurónico.',
  29.95,
  'https://www.kiyobeauty.com/cdn/shop/files/biodance-bio-collagen-real-deep-mask-1pc-PURESEOUL-UK-KBeauty-shop-2_1800x1800_0d187b16-fead-4418-b39a-2debfafbc0c3.webp?v=1756371372&width=1500',
  'Mascarillas',
  'Más Vendido'
);

-- Allow public read access to the products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access" ON products
  FOR SELECT USING (true);
