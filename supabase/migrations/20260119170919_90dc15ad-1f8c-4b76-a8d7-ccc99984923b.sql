-- Enable RLS on sales_history_2023 (if not already enabled)
ALTER TABLE public.sales_history_2023 ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to sales_history_2023"
ON public.sales_history_2023
FOR SELECT
USING (true);

-- Allow public insert access for importing transaction history
CREATE POLICY "Allow public insert to sales_history_2023"
ON public.sales_history_2023
FOR INSERT
WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update to sales_history_2023"
ON public.sales_history_2023
FOR UPDATE
USING (true);

-- Allow public delete access (for clearing old data before reimport)
CREATE POLICY "Allow public delete from sales_history_2023"
ON public.sales_history_2023
FOR DELETE
USING (true);