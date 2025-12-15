import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ForecastRequest {
  forecastHorizon?: number; // days
  topProducts?: number; // limit products to analyze
}

interface ProductForecast {
  drugName: string;
  currentStock: number;
  avgMonthlySales: number;
  predictedDemand: {
    low: number;
    medium: number;
    high: number;
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
  reorderPoint: number;
  suggestedOrderQty: number;
  daysUntilStockout: number;
}

interface ForecastResponse {
  predictions: ProductForecast[];
  overallInsights: string;
  seasonalPatterns: string;
  riskAnalysis: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let requestBody: ForecastRequest = {};
    try {
      requestBody = await req.json();
    } catch {
      // Use defaults if no body
    }

    const forecastHorizon = requestBody.forecastHorizon || 90;
    const topProducts = requestBody.topProducts || 20;

    console.log(`Generating forecast for ${forecastHorizon} days, top ${topProducts} products`);

    // Fetch sales history data
    const { data: salesHistory, error: salesError } = await supabase
      .from('sales_history')
      .select('*')
      .order('sale_date', { ascending: false });

    if (salesError) {
      console.error('Sales history error:', salesError);
      throw new Error('Failed to fetch sales history');
    }

    // Fetch current drug stock
    const { data: drugs, error: drugsError } = await supabase
      .from('Drugs dataset')
      .select('*');

    if (drugsError) {
      console.error('Drugs dataset error:', drugsError);
      throw new Error('Failed to fetch drug inventory');
    }

    console.log(`Fetched ${salesHistory?.length || 0} sales records and ${drugs?.length || 0} drugs`);

    // Aggregate sales data by drug
    const salesByDrug: Record<string, { totalQty: number; totalRevenue: number; dates: string[] }> = {};
    
    salesHistory?.forEach(sale => {
      const name = sale.drug_name?.toLowerCase().trim();
      if (!name) return;
      
      if (!salesByDrug[name]) {
        salesByDrug[name] = { totalQty: 0, totalRevenue: 0, dates: [] };
      }
      salesByDrug[name].totalQty += sale.quantity_sold || 0;
      salesByDrug[name].totalRevenue += sale.total_revenue || 0;
      if (sale.sale_date) {
        salesByDrug[name].dates.push(sale.sale_date);
      }
    });

    // Get top selling products
    const topSellingProducts = Object.entries(salesByDrug)
      .sort((a, b) => b[1].totalQty - a[1].totalQty)
      .slice(0, topProducts)
      .map(([name, data]) => {
        // Calculate date range and monthly average
        const dates = data.dates.sort();
        const firstDate = dates[0] ? new Date(dates[0]) : new Date();
        const lastDate = dates[dates.length - 1] ? new Date(dates[dates.length - 1]) : new Date();
        const monthsSpan = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        return {
          name,
          totalQtySold: data.totalQty,
          totalRevenue: data.totalRevenue,
          avgMonthlySales: Math.round(data.totalQty / monthsSpan),
          transactionCount: data.dates.length
        };
      });

    // Match with current stock
    const productSummary = topSellingProducts.map(product => {
      const matchingDrug = drugs?.find(d => 
        d.name?.toLowerCase().trim() === product.name ||
        d.name?.toLowerCase().includes(product.name) ||
        product.name.includes(d.name?.toLowerCase() || '')
      );
      
      return {
        ...product,
        currentStock: matchingDrug?.stock ? parseInt(matchingDrug.stock) || 0 : 0,
        price_EGP: matchingDrug?.price_EGP || 0
      };
    });

    // Prepare data for AI analysis
    const analysisData = {
      totalTransactions: salesHistory?.length || 0,
      dateRange: salesHistory?.length ? {
        from: salesHistory[salesHistory.length - 1]?.sale_date,
        to: salesHistory[0]?.sale_date
      } : null,
      topProducts: productSummary
    };

    console.log('Calling OpenAI API with structured tool calling...');

    // Use tool calling for structured output
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert pharmaceutical demand forecasting AI. Analyze the sales history data and generate accurate demand predictions for each product.
            
Consider:
- Historical sales velocity and trends
- Seasonality patterns in pharmaceutical demand
- Stock levels vs demand rates
- Reorder points based on lead time assumptions (7 days)

For each product, predict demand for the next ${forecastHorizon} days with low/medium/high scenarios.`
          },
          {
            role: 'user',
            content: `Analyze this pharmacy sales data and generate demand forecasts:

${JSON.stringify(analysisData, null, 2)}

Generate predictions for each product including:
1. Predicted demand (low/medium/high scenarios) for ${forecastHorizon} days
2. Trend direction (increasing/stable/decreasing)
3. Confidence level (0-1)
4. Reorder point (when to reorder)
5. Suggested order quantity
6. Days until stockout at current rate`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_demand_forecast',
              description: 'Generate structured demand forecasts for pharmacy products',
              parameters: {
                type: 'object',
                properties: {
                  predictions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        drugName: { type: 'string' },
                        currentStock: { type: 'number' },
                        avgMonthlySales: { type: 'number' },
                        predictedDemand: {
                          type: 'object',
                          properties: {
                            low: { type: 'number' },
                            medium: { type: 'number' },
                            high: { type: 'number' }
                          },
                          required: ['low', 'medium', 'high']
                        },
                        trend: { 
                          type: 'string', 
                          enum: ['increasing', 'stable', 'decreasing'] 
                        },
                        confidence: { type: 'number' },
                        reorderPoint: { type: 'number' },
                        suggestedOrderQty: { type: 'number' },
                        daysUntilStockout: { type: 'number' }
                      },
                      required: ['drugName', 'currentStock', 'avgMonthlySales', 'predictedDemand', 'trend', 'confidence', 'reorderPoint', 'suggestedOrderQty', 'daysUntilStockout']
                    }
                  },
                  overallInsights: { type: 'string' },
                  seasonalPatterns: { type: 'string' },
                  riskAnalysis: { type: 'string' }
                },
                required: ['predictions', 'overallInsights', 'seasonalPatterns', 'riskAnalysis']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_demand_forecast' } },
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract structured forecast from tool call
    let forecastResult: ForecastResponse;
    
    if (data.choices[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      forecastResult = {
        predictions: args.predictions || [],
        overallInsights: args.overallInsights || '',
        seasonalPatterns: args.seasonalPatterns || '',
        riskAnalysis: args.riskAnalysis || '',
        timestamp: new Date().toISOString()
      };
    } else {
      // Fallback if tool calling fails - generate basic predictions from data
      console.log('Tool calling failed, using fallback predictions');
      forecastResult = {
        predictions: productSummary.map(product => ({
          drugName: product.name,
          currentStock: product.currentStock,
          avgMonthlySales: product.avgMonthlySales,
          predictedDemand: {
            low: Math.round(product.avgMonthlySales * (forecastHorizon / 30) * 0.8),
            medium: Math.round(product.avgMonthlySales * (forecastHorizon / 30)),
            high: Math.round(product.avgMonthlySales * (forecastHorizon / 30) * 1.2)
          },
          trend: 'stable' as const,
          confidence: 0.7,
          reorderPoint: Math.round(product.avgMonthlySales * 0.5),
          suggestedOrderQty: Math.round(product.avgMonthlySales * 2),
          daysUntilStockout: product.currentStock > 0 ? Math.round(product.currentStock / (product.avgMonthlySales / 30)) : 0
        })),
        overallInsights: 'Analysis based on historical sales patterns.',
        seasonalPatterns: 'Seasonal analysis requires more data points.',
        riskAnalysis: 'Monitor low-stock items for potential stockouts.',
        timestamp: new Date().toISOString()
      };
    }

    // Store forecast results in database
    const forecastRecords = forecastResult.predictions.map(p => ({
      drug_name: p.drugName,
      predicted_demand: p.predictedDemand.medium,
      confidence_low: p.predictedDemand.low,
      confidence_high: p.predictedDemand.high,
      trend: p.trend,
      reorder_point: p.reorderPoint,
      suggested_order_qty: p.suggestedOrderQty,
      forecast_horizon_days: forecastHorizon,
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

    console.log('Forecast generated successfully');

    return new Response(
      JSON.stringify(forecastResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-forecast function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        predictions: [],
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
