-- Create sales_history table to store transaction data for AI forecasting
CREATE TABLE public.sales_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_name TEXT NOT NULL,
    quantity_sold INTEGER NOT NULL,
    unit_price DOUBLE PRECISION NOT NULL,
    total_revenue DOUBLE PRECISION NOT NULL,
    sale_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster date-based queries
CREATE INDEX idx_sales_history_date ON public.sales_history(sale_date);
CREATE INDEX idx_sales_history_drug ON public.sales_history(drug_name);

-- Enable Row Level Security
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;

-- Create policies for read/insert access
CREATE POLICY "Enable read access for all users" 
ON public.sales_history 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.sales_history 
FOR INSERT 
WITH CHECK (true);

-- Create forecast_results table to store AI predictions
CREATE TABLE public.forecast_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_name TEXT NOT NULL,
    predicted_demand INTEGER NOT NULL,
    confidence_low INTEGER NOT NULL,
    confidence_high INTEGER NOT NULL,
    trend TEXT NOT NULL CHECK (trend IN ('increasing', 'stable', 'decreasing')),
    reorder_point INTEGER,
    suggested_order_qty INTEGER,
    forecast_horizon_days INTEGER NOT NULL DEFAULT 30,
    accuracy_score DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forecast_results
ALTER TABLE public.forecast_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for forecast results" 
ON public.forecast_results 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for forecast results" 
ON public.forecast_results 
FOR INSERT 
WITH CHECK (true);