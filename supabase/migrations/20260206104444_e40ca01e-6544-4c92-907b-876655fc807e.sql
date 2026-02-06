-- Add new columns to Inventory_2023 table for pharmacy inventory management
ALTER TABLE public."Inventory_2023" 
ADD COLUMN IF NOT EXISTS generic_name text,
ADD COLUMN IF NOT EXISTS dosage_form text DEFAULT 'tablet',
ADD COLUMN IF NOT EXISTS strength text,
ADD COLUMN IF NOT EXISTS expiry_date date,
ADD COLUMN IF NOT EXISTS supplier text,
ADD COLUMN IF NOT EXISTS purchase_price double precision DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Rename price to selling_price for clarity
ALTER TABLE public."Inventory_2023" 
RENAME COLUMN price TO selling_price;

-- Enable INSERT, UPDATE, DELETE policies for authenticated users
CREATE POLICY "Authenticated users can insert inventory" 
ON public."Inventory_2023" 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their inventory" 
ON public."Inventory_2023" 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their inventory" 
ON public."Inventory_2023" 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing select policy and create new one for authenticated users
DROP POLICY IF EXISTS "Allow public read access to Inventory_2023" ON public."Inventory_2023";

CREATE POLICY "Users can read their own inventory" 
ON public."Inventory_2023" 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);