-- Insert sample data for testing

-- Insert sample businesses (using gen_random_uuid() for proper UUID generation)
INSERT INTO public.businesses (name, type, description, phone, email, address, is_active) VALUES
('TrippleK Barbershop', 'triplek', 'Premium barbershop and grooming services', '+254712345678', 'info@triplek.com', '123 Main Street, Nairobi', true),
('Swan Water Distribution', 'swan', 'Fresh water delivery and sales', '+254723456789', 'info@swan.com', '456 Water Street, Nairobi', true)
ON CONFLICT DO NOTHING;

-- Get the business IDs for reference (we'll use them in subsequent inserts)
DO $$
DECLARE
  triplek_id uuid;
  swan_id uuid;
BEGIN
  SELECT id INTO triplek_id FROM public.businesses WHERE type = 'triplek' LIMIT 1;
  SELECT id INTO swan_id FROM public.businesses WHERE type = 'swan' LIMIT 1;

  -- Insert sample services for TrippleK
  INSERT INTO public.services (business_id, name, price, duration_minutes, description, category, requires_aftercare, is_active) VALUES
  (triplek_id, 'Haircut', 300, 30, 'Professional haircut with styling', 'Hair', false, true),
  (triplek_id, 'Shave', 150, 15, 'Clean shave with hot towel', 'Shaving', false, true),
  (triplek_id, 'Beard Trim', 200, 20, 'Beard shaping and trimming', 'Beard', false, true),
  (triplek_id, 'Styling', 250, 25, 'Hair styling and treatment', 'Hair', false, true),
  (triplek_id, 'Full Service', 600, 60, 'Haircut, shave, and styling package', 'Package', true, true)
  ON CONFLICT DO NOTHING;

  -- Insert sample products for Swan
  INSERT INTO public.products (business_id, name, size, price, stock_quantity, low_stock_threshold, critical_stock_threshold, description, is_active) VALUES
  (swan_id, '20L Water Bottle', '20L', 400, 150, 100, 50, 'Large water bottle for offices', true),
  (swan_id, '5L Water Bottle', '5L', 200, 300, 100, 50, 'Medium water bottle for homes', true),
  (swan_id, '1L Water Bottle', '1L', 80, 500, 100, 50, 'Small water bottle', true),
  (swan_id, '500ml Water Bottle', '500ml', 50, 800, 100, 50, 'Portable water bottle', true)
  ON CONFLICT DO NOTHING;
END $$;