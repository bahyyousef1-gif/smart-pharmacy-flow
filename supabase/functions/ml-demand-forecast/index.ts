import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MLForecastRequest {
  budget_egp?: number;
  horizon_days?: number;
}

interface MLForecastItem {
  product_id: string;
  product_name: string;
  forecast_horizon_demand_packs: number;
  safety_stock_packs: number;
  suggested_order_packs: number;
  estimated_cost_egp: number;
  reason: string;
}

interface MLForecastResponse {
  settings: {
    budget_egp: number;
    horizon_days: number;
  };
  budget: {
    budget_used_egp: number;
    budget_remaining_egp: number;
  };
  items: MLForecastItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let requestBody: MLForecastRequest = {};
    try {
      requestBody = await req.json();
    } catch {
      // Use defaults if no body
    }

    const budget_egp = requestBody.budget_egp || 10000;
    const horizon_days = requestBody.horizon_days || 7;

    console.log(`Calling ML API with budget: ${budget_egp} EGP, horizon: ${horizon_days} days`);

    // Call the external ML API
    const mlResponse = await fetch('https://thcsixalwxttcibuahyl.supabase.co/functions/v1/reorder-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settings: {
          budget_egp,
          horizon_days
        }
      }),
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error('ML API error:', mlResponse.status, errorText);
      throw new Error(`ML API error: ${mlResponse.status} - ${errorText}`);
    }

    const mlData: MLForecastResponse = await mlResponse.json();
    console.log(`ML API returned ${mlData.items?.length || 0} items`);

    // Transform ML response to match existing frontend format
    const predictions = mlData.items?.map(item => ({
      drugName: item.product_name,
      productId: item.product_id,
      currentStock: 0, // ML API doesn't return current stock
      avgMonthlySales: 0,
      predictedDemand: {
        low: Math.round(item.forecast_horizon_demand_packs * 0.8),
        medium: Math.round(item.forecast_horizon_demand_packs),
        high: Math.round(item.forecast_horizon_demand_packs * 1.2),
      },
      trend: 'stable' as const,
      confidence: 0.85,
      reorderPoint: Math.round(item.safety_stock_packs),
      suggestedOrderQty: Math.round(item.suggested_order_packs),
      daysUntilStockout: horizon_days,
      safetyStock: item.safety_stock_packs,
      estimatedCost: item.estimated_cost_egp,
      reason: item.reason,
    })) || [];

    // Store forecast results in database
    const forecastRecords = predictions.map(p => ({
      drug_name: p.drugName,
      predicted_demand: p.predictedDemand.medium,
      confidence_low: p.predictedDemand.low,
      confidence_high: p.predictedDemand.high,
      trend: p.trend,
      reorder_point: p.reorderPoint,
      suggested_order_qty: p.suggestedOrderQty,
      forecast_horizon_days: horizon_days,
      accuracy_score: p.confidence
    }));

    if (forecastRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('forecast_results')
        .insert(forecastRecords);
      
      if (insertError) {
        console.error('Failed to store forecast results:', insertError);
      } else {
        console.log(`Stored ${forecastRecords.length} forecast records`);
      }
    }

    const result = {
      predictions,
      budget: mlData.budget,
      settings: mlData.settings,
      overallInsights: `ML model analyzed ${predictions.length} products within budget of ${budget_egp} EGP for ${horizon_days}-day forecast.`,
      seasonalPatterns: 'Demand predictions based on historical patterns and safety stock calculations.',
      riskAnalysis: mlData.budget.budget_remaining_egp < budget_egp * 0.1 
        ? 'Warning: Budget nearly exhausted. Some items may not be covered.' 
        : 'Budget allocation optimized for all recommended products.',
      timestamp: new Date().toISOString(),
    };

    console.log('ML forecast generated successfully');

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ml-demand-forecast function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        predictions: [],
        budget: null,
        settings: null,
        overallInsights: '',
        seasonalPatterns: '',
        riskAnalysis: ''
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
