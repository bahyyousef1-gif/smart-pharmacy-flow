-- Enable RLS and add read policy for Inventory_2023
ALTER TABLE public."Inventory_2023" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read inventory data
CREATE POLICY "Allow public read access to Inventory_2023"
ON public."Inventory_2023"
FOR SELECT
USING (true);

-- Also add policy for sales_history_2023
ALTER TABLE public.sales_history_2023 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sales_history_2023"
ON public.sales_history_2023
FOR SELECT
USING (true);