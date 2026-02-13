-- Joy-Flower Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category VARCHAR(100),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),

  -- Buyer information
  buyer_name VARCHAR(100) NOT NULL,
  buyer_phone VARCHAR(50) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,

  -- Recipient information
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(50) NOT NULL,
  recipient_address TEXT NOT NULL,

  -- Delivery information
  delivery_type VARCHAR(50) NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_date DATE,
  delivery_time TIME,
  message_card TEXT,

  -- Payment information
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock history table
CREATE TABLE stock_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_stock_history_product_id ON stock_history(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can view active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Products: Authenticated users (admin) can manage
CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders: Users can view their own orders or orders without user_id
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Orders: Anyone can insert orders (for guest checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Order items: Users can view items of their orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- Order items: Anyone can insert (part of order creation)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Stock history: Only authenticated users can view/insert
CREATE POLICY "Authenticated users can manage stock history"
  ON stock_history FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO products (name, description, price, category, stock_quantity, is_active) VALUES
  ('Red Rose Bouquet', 'Beautiful dozen red roses', 49.99, 'Roses', 20, true),
  ('White Lily Arrangement', 'Elegant white lilies in a vase', 59.99, 'Lilies', 15, true),
  ('Mixed Seasonal Flowers', 'Colorful mix of seasonal blooms', 39.99, 'Mixed', 25, true),
  ('Orchid Plant', 'Purple orchid in decorative pot', 69.99, 'Plants', 10, true),
  ('Sunflower Bunch', 'Bright and cheerful sunflowers', 34.99, 'Sunflowers', 18, true);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE products IS 'Flower products catalog';
COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON TABLE order_items IS 'Line items for each order';
COMMENT ON TABLE stock_history IS 'Inventory tracking history';
