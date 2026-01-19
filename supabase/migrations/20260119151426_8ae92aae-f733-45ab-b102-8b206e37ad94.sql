-- Create daily_forecasts table for demand forecasting
CREATE TABLE public.daily_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code BIGINT NOT NULL,
  product_name TEXT NOT NULL,
  predicted_qty INTEGER NOT NULL DEFAULT 0,
  suggested_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OK' CHECK (status IN ('CRITICAL', 'LOW', 'OK')),
  trend_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add price column to Inventory_2023 if needed for cost calculations
ALTER TABLE public."Inventory_2023" 
ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 100;

-- Enable RLS for daily_forecasts
ALTER TABLE public.daily_forecasts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to daily_forecasts"
ON public.daily_forecasts
FOR SELECT
USING (true);

-- Allow public insert for forecast generation
CREATE POLICY "Allow public insert to daily_forecasts"
ON public.daily_forecasts
FOR INSERT
WITH CHECK (true);

-- Allow public update for editing suggested orders
CREATE POLICY "Allow public update to daily_forecasts"
ON public.daily_forecasts
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_daily_forecasts_product_code ON public.daily_forecasts(product_code);
CREATE INDEX idx_daily_forecasts_status ON public.daily_forecasts(status);

-- Insert sample forecast data based on existing inventory
INSERT INTO public.daily_forecasts (product_code, product_name, predicted_qty, suggested_order, status, trend_data)
SELECT 
  i.product_code,
  i.name,
  FLOOR(RANDOM() * 100 + 20)::INTEGER as predicted_qty,
  CASE 
    WHEN i.stock_quantity < 20 THEN FLOOR(RANDOM() * 50 + 30)::INTEGER
    WHEN i.stock_quantity < 50 THEN FLOOR(RANDOM() * 30 + 10)::INTEGER
    ELSE 0
  END as suggested_order,
  CASE 
    WHEN i.stock_quantity < 20 THEN 'CRITICAL'
    WHEN i.stock_quantity < 50 THEN 'LOW'
    ELSE 'OK'
  END as status,
  jsonb_build_array(
    FLOOR(RANDOM() * 30 + 10),
    FLOOR(RANDOM() * 30 + 15),
    FLOOR(RANDOM() * 30 + 20),
    FLOOR(RANDOM() * 30 + 25),
    FLOOR(RANDOM() * 30 + 20),
    FLOOR(RANDOM() * 30 + 30)
  ) as trend_data
FROM public."Inventory_2023" i
WHERE i.product_code IS NOT NULL
LIMIT 100;