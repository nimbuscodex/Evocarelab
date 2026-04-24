-- ==========================================
-- ESQUEMA AVANZADO DE E-COMMERCE PARA SUPABASE
-- ==========================================

-- 1. Actualizar la tabla de productos para incluir Stock
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 100;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Crear tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL, -- Almacenará: calle, ciudad, código postal, país
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  stripe_session_id TEXT UNIQUE, -- Para verificar el pago con Stripe u otra pasarela
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Crear tabla de Detalles del Pedido (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC NOT NULL, -- Precio en el momento de la compra (por si el precio del producto cambia luego)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Función y Trigger para descontar el stock automáticamente al confirmarse el pago (opcional, o se hace desde el backend)
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo descontar stock cuando el pedido pasa a estado 'paid'
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    UPDATE products
    SET stock = stock - order_items.quantity
    FROM order_items
    WHERE order_items.order_id = NEW.id AND products.id = order_items.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_paid
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION decrement_product_stock();

-- 5. Seguridad (Row Level Security)
-- Permitimos que el cliente anónimo inserte pedidos (cuando finaliza la compra)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política para que cualquier cliente pueda crear un pedido (Insert)
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to order_items" ON order_items FOR INSERT WITH CHECK (true);

-- (Nota: Para Leer/Actualizar los pedidos, deberías hacerlo a través de tu servidor seguro / Edge Functions, no dejarlo público).
