import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SalesAggregation {
  Item_Code: number;
  Item_Name: string;
  total_sales: number;
  avg_daily_sales: number;
  sales_days: number;
  sales_variance: number;
  unit_price: number;
}

interface MonthlyTrend {
  Item_Code: number;
  month: number;
  monthly_sales: number;
}

interface ProductForecast {
  product_code: number;
  product_name: string;
  predicted_qty: number;
  suggested_order: number;
  status: "CRITICAL" | "LOW" | "OK";
  trend_data: number[];
  confidence: number;
  trend_direction: string;
  days_until_stockout: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { horizon_days = 30, top_products = 50 } = await req.json();

    console.log("Starting AI demand forecast with horizon:", horizon_days, "days");

    // Step 1: Aggregate sales data from sales_history_2023
    const { data: salesData, error: salesError } = await supabase
      .from("sales_history_2023")
      .select("Item_Code, Item_Name, Net_Daily_Sales, Unit_Price, Date");

    if (salesError) {
      console.error("Sales data fetch error:", salesError);
      throw new Error("Failed to fetch sales history: " + salesError.message);
    }

    if (!salesData || salesData.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No sales history data found. Please import transaction history first.",
          predictions: [] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetched ${salesData.length} sales records`);

    // Step 2: Calculate aggregations per product
    const productAggregations = new Map<number, SalesAggregation>();
    const monthlyData = new Map<number, Map<number, number>>();

    for (const record of salesData) {
      const code = record.Item_Code;
      const sales = record.Net_Daily_Sales || 0;
      const price = record.Unit_Price || 0;
      
      // Parse date to get month - handle YYYY-MM-DD format (database format)
      let month = 1;
      try {
        const dateStr = record.Date || '';
        // Try YYYY-MM-DD format first (database format)
        if (dateStr.includes('-')) {
          const dateParts = dateStr.split('-');
          if (dateParts.length >= 2) {
            month = parseInt(dateParts[1]) || 1; // YYYY-MM-DD: month is second part
          }
        } else if (dateStr.includes('/')) {
          // Fallback to MM/DD/YYYY format
          const dateParts = dateStr.split('/');
          if (dateParts.length >= 2) {
            month = parseInt(dateParts[0]) || 1;
          }
        }
      } catch {
        month = 1;
      }

      // Aggregate product data
      if (!productAggregations.has(code)) {
        productAggregations.set(code, {
          Item_Code: code,
          Item_Name: record.Item_Name,
          total_sales: 0,
          avg_daily_sales: 0,
          sales_days: 0,
          sales_variance: 0,
          unit_price: price,
        });
      }

      const agg = productAggregations.get(code)!;
      agg.total_sales += sales;
      agg.sales_days += 1;
      if (price > 0) agg.unit_price = price;

      // Monthly aggregation
      if (!monthlyData.has(code)) {
        monthlyData.set(code, new Map());
      }
      const monthMap = monthlyData.get(code)!;
      monthMap.set(month, (monthMap.get(month) || 0) + sales);
    }

    // Calculate averages and variance
    const salesByProduct = new Map<number, number[]>();
    for (const record of salesData) {
      const code = record.Item_Code;
      if (!salesByProduct.has(code)) {
        salesByProduct.set(code, []);
      }
      salesByProduct.get(code)!.push(record.Net_Daily_Sales || 0);
    }

    for (const [code, agg] of productAggregations) {
      agg.avg_daily_sales = agg.sales_days > 0 ? agg.total_sales / agg.sales_days : 0;
      
      // Calculate variance
      const salesValues = salesByProduct.get(code) || [];
      if (salesValues.length > 1) {
        const mean = agg.avg_daily_sales;
        const squaredDiffs = salesValues.map(v => Math.pow(v - mean, 2));
        agg.sales_variance = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / salesValues.length);
      }
    }

    // Step 3: Get current inventory levels
    const { data: inventoryData, error: invError } = await supabase
      .from("Inventory_2023")
      .select("product_code, name, stock_quantity, min_stock, max_stock, price");

    if (invError) {
      console.error("Inventory fetch error:", invError);
    }

    const inventoryMap = new Map(
      (inventoryData || []).map((item) => [item.product_code, item])
    );

    // Step 4: Get top products by total sales
    const sortedProducts = Array.from(productAggregations.values())
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, top_products);

    console.log(`Analyzing top ${sortedProducts.length} products`);

    // Step 5: Prepare context for AI
    const productContexts = sortedProducts.map((product) => {
      const inventory = inventoryMap.get(product.Item_Code);
      const monthlyTrends = monthlyData.get(product.Item_Code);
      
      // Build monthly pattern array
      const monthlyPattern: number[] = [];
      for (let m = 1; m <= 12; m++) {
        monthlyPattern.push(Math.round(monthlyTrends?.get(m) || 0));
      }

      // Calculate coefficient of variation (consistency metric)
      const cv = product.avg_daily_sales > 0 
        ? (product.sales_variance / product.avg_daily_sales) 
        : 1;

      return {
        code: product.Item_Code,
        name: product.Item_Name,
        avg_daily_sales: Math.round(product.avg_daily_sales * 100) / 100,
        total_annual_sales: Math.round(product.total_sales),
        active_days: product.sales_days,
        consistency: cv < 0.5 ? "high" : cv < 1 ? "medium" : "low",
        monthly_pattern: monthlyPattern,
        current_stock: inventory?.stock_quantity || 0,
        min_stock: inventory?.min_stock || 10,
        max_stock: inventory?.max_stock || 100,
        unit_price: product.unit_price || inventory?.price || 0,
      };
    });

    // Step 6: Call Lovable AI with structured tool calling
    const systemPrompt = `You are an expert pharmaceutical demand forecasting AI. You have been trained on historical pharmacy sales data and understand seasonal patterns, drug consumption trends, and inventory management best practices.

Your task is to analyze the provided product sales history and generate accurate demand forecasts for the next ${horizon_days} days.

Consider:
1. Historical sales velocity (average daily sales)
2. Monthly seasonality patterns  
3. Sales consistency (high/medium/low variance)
4. Current stock levels vs typical demand
5. Safety stock requirements

For each product, predict:
- Expected demand for the forecast period
- Suggested reorder quantity
- Stock status (CRITICAL if current stock < 7 days demand, LOW if < 14 days, OK otherwise)
- Confidence level based on data consistency
- Trend direction based on monthly pattern analysis`;

    const userPrompt = `Analyze these ${productContexts.length} pharmaceutical products and generate demand forecasts:

${JSON.stringify(productContexts, null, 2)}

Generate forecasts for the next ${horizon_days} days. For each product, calculate:
1. Predicted quantity needed
2. Suggested order quantity (predicted demand - current stock + safety buffer)
3. Status based on current stock vs predicted demand
4. 12-month trend data for visualization
5. Confidence score and trend direction`;

    console.log("Calling Lovable AI for forecast generation...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_forecasts",
              description: "Generate demand forecasts for pharmaceutical products",
              parameters: {
                type: "object",
                properties: {
                  forecasts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_code: { type: "number", description: "Product code" },
                        product_name: { type: "string", description: "Product name" },
                        predicted_qty: { type: "number", description: "Predicted demand quantity for the forecast period" },
                        suggested_order: { type: "number", description: "Suggested order quantity" },
                        status: { type: "string", enum: ["CRITICAL", "LOW", "OK"], description: "Stock status" },
                        confidence: { type: "number", description: "Confidence score 0-100" },
                        trend_direction: { type: "string", enum: ["increasing", "stable", "decreasing"], description: "Demand trend" },
                        days_until_stockout: { type: "number", description: "Estimated days until stockout" },
                        monthly_trend: { 
                          type: "array", 
                          items: { type: "number" },
                          description: "12 monthly values showing seasonal pattern" 
                        }
                      },
                      required: ["product_code", "product_name", "predicted_qty", "suggested_order", "status", "confidence", "trend_direction", "days_until_stockout", "monthly_trend"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["forecasts"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_forecasts" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few moments." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract forecasts from tool call
    let forecasts: ProductForecast[] = [];
    
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        forecasts = parsed.forecasts.map((f: any) => ({
          product_code: f.product_code,
          product_name: f.product_name,
          predicted_qty: Math.max(0, Math.round(f.predicted_qty)),
          suggested_order: Math.max(0, Math.round(f.suggested_order)),
          status: f.status,
          trend_data: f.monthly_trend || [],
          confidence: f.confidence,
          trend_direction: f.trend_direction,
          days_until_stockout: f.days_until_stockout,
        }));
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        throw new Error("Failed to parse AI forecast response");
      }
    }

    if (forecasts.length === 0) {
      console.error("No forecasts generated from AI");
      throw new Error("AI did not generate any forecasts");
    }

    console.log(`Generated ${forecasts.length} forecasts`);

    // Step 7: Store forecasts in daily_forecasts table
    // First, clear existing forecasts
    const { error: deleteError } = await supabase
      .from("daily_forecasts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.error("Failed to clear old forecasts:", deleteError);
    }

    // Insert new forecasts
    const forecastRecords = forecasts.map((f) => ({
      product_code: f.product_code,
      product_name: f.product_name,
      predicted_qty: f.predicted_qty,
      suggested_order: f.suggested_order,
      status: f.status,
      trend_data: f.trend_data,
    }));

    const { error: insertError } = await supabase
      .from("daily_forecasts")
      .insert(forecastRecords);

    if (insertError) {
      console.error("Failed to insert forecasts:", insertError);
      throw new Error("Failed to save forecasts: " + insertError.message);
    }

    console.log("Forecasts saved to database");

    // Calculate summary metrics
    const criticalCount = forecasts.filter((f) => f.status === "CRITICAL").length;
    const lowCount = forecasts.filter((f) => f.status === "LOW").length;
    const totalPredictedDemand = forecasts.reduce((sum, f) => sum + f.predicted_qty, 0);

    return new Response(
      JSON.stringify({
        success: true,
        predictions: forecasts,
        summary: {
          total_products: forecasts.length,
          critical_items: criticalCount,
          low_stock_items: lowCount,
          total_predicted_demand: totalPredictedDemand,
          forecast_horizon_days: horizon_days,
          data_source: {
            total_records: salesData.length,
            unique_products: productAggregations.size,
          }
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Demand Forecast error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        predictions: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
