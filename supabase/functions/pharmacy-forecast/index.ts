import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== Inventory Intelligence (from inventory.py) ==========
function calculateInventoryMetrics(
  forecastNext30Days: number[],
  leadTime: number,
  sigma: number,
  serviceLevel = 0.95
) {
  const avgDailyDemand = forecastNext30Days.reduce((a, b) => a + b, 0) / forecastNext30Days.length;

  // Z-score approximation for common service levels
  const zScoreMap: Record<number, number> = { 0.9: 1.28, 0.95: 1.645, 0.99: 2.326 };
  const zScore = zScoreMap[serviceLevel] || 1.645;

  // Safety Stock = Z * σ * √(Lead Time)
  const safetyStock = zScore * sigma * Math.sqrt(leadTime);

  // Reorder Point = (Avg Daily Demand × Lead Time) + Safety Stock
  const reorderPoint = avgDailyDemand * leadTime + safetyStock;

  // Recommended Order Quantity = sum of forecasted demand for 30 days
  const recommendedOrderQuantity = forecastNext30Days.reduce((a, b) => a + b, 0);

  return {
    safety_stock: Math.round(safetyStock * 100) / 100,
    reorder_point: Math.round(reorderPoint * 100) / 100,
    recommended_order_quantity: Math.round(recommendedOrderQuantity * 100) / 100,
    avg_daily_demand: Math.round(avgDailyDemand * 100) / 100,
  };
}

// ABC Classification (from inventory.py)
function classifySKU(revenue: number, totalRevenue: number): "A" | "B" | "C" {
  const revenueShare = totalRevenue !== 0 ? revenue / totalRevenue : 0;
  if (revenueShare >= 0.7) return "A";
  if (revenueShare >= 0.2) return "B";
  return "C";
}

// Cumulative ABC (sorted by revenue descending, accumulate %)
function classifyABC(products: { code: number; revenue: number }[]): Map<number, "A" | "B" | "C"> {
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sorted.reduce((s, p) => s + p.revenue, 0);
  const result = new Map<number, "A" | "B" | "C">();
  let cumulative = 0;
  for (const p of sorted) {
    cumulative += p.revenue;
    const pct = totalRevenue > 0 ? cumulative / totalRevenue : 1;
    if (pct <= 0.7) result.set(p.code, "A");
    else if (pct <= 0.9) result.set(p.code, "B");
    else result.set(p.code, "C");
  }
  return result;
}

// Expiry Risk Detection (from inventory.py)
function detectExpiryRisk(
  currentStock: number,
  expiryDate: string | null,
  forecastedDemand30Days: number
): { atRisk: boolean; reason: string } {
  // Check if expiry is within 90 days
  if (expiryDate) {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysToExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysToExpiry < 0) return { atRisk: true, reason: "Already expired" };
    if (daysToExpiry < 90 && currentStock > forecastedDemand30Days * (daysToExpiry / 30)) {
      return { atRisk: true, reason: `Expires in ${Math.round(daysToExpiry)} days, stock exceeds projected demand` };
    }
  }
  // If current stock > 3x monthly demand (from Python logic)
  if (currentStock > 3 * forecastedDemand30Days && forecastedDemand30Days > 0) {
    return { atRisk: true, reason: "Stock exceeds 3× monthly demand — risk of expiry" };
  }
  return { atRisk: false, reason: "" };
}

// ========== Business Intelligence (from bi.py) ==========
function calculateStockoutProbability(
  currentStock: number,
  forecastedDemand30Days: number,
  sigma: number
): number {
  if (currentStock <= 0) return 1.0;
  if (forecastedDemand30Days <= 0) return 0.0;
  if (currentStock < forecastedDemand30Days) return 1.0;
  // Simple probability based on how close stock is to demand
  const ratio = currentStock / forecastedDemand30Days;
  if (ratio > 2) return 0.0;
  return Math.max(0, Math.min(1, 1 - (ratio - 1)));
}

function classifyStockSpeed(totalSales30Days: number): "Fast" | "Slow" | "Dead" {
  if (totalSales30Days > 100) return "Fast";
  if (totalSales30Days > 10) return "Slow";
  return "Dead";
}

function calculateCashFlowImpact(purchaseQty: number, price: number, margin: number) {
  return {
    total_cost: Math.round(purchaseQty * price * 100) / 100,
    total_margin: Math.round(purchaseQty * margin * 100) / 100,
  };
}

// ========== Purchase Optimization (from optimization.py) ==========
// Greedy knapsack approach (since we can't use LP solver in Deno)
function optimizePurchases(
  skusData: {
    id: number;
    name: string;
    forecastedDemand: number;
    price: number;
    margin: number;
    currentStock: number;
    minOrderQty: number;
    safetyStock: number;
    reorderPoint: number;
    stockoutProb: number;
  }[],
  budget: number,
  storageCapacity: number
) {
  // Calculate priority score: margin-to-cost ratio × urgency
  const withScore = skusData.map((sku) => {
    const needed = Math.max(0, sku.forecastedDemand + sku.safetyStock - sku.currentStock);
    const urgency = sku.stockoutProb > 0.5 ? 3 : sku.stockoutProb > 0 ? 2 : 1;
    const marginRatio = sku.price > 0 ? sku.margin / sku.price : 0;
    return { ...sku, needed, score: marginRatio * urgency, urgency };
  });

  // Sort by urgency first, then by score
  withScore.sort((a, b) => b.urgency - a.urgency || b.score - a.score);

  let remainingBudget = budget;
  let remainingCapacity = storageCapacity;
  const result: {
    id: number;
    name: string;
    optimized_qty: number;
    cost: number;
    margin_contribution: number;
    priority: "essential" | "recommended" | "optional";
  }[] = [];

  for (const sku of withScore) {
    if (sku.needed <= 0) continue;
    const qty = Math.min(
      sku.needed,
      Math.floor(remainingBudget / (sku.price || 1)),
      remainingCapacity
    );
    if (qty <= 0) continue;

    const cost = qty * sku.price;
    remainingBudget -= cost;
    remainingCapacity -= qty;

    result.push({
      id: sku.id,
      name: sku.name,
      optimized_qty: Math.round(qty),
      cost: Math.round(cost * 100) / 100,
      margin_contribution: Math.round(qty * sku.margin * 100) / 100,
      priority: sku.urgency >= 3 ? "essential" : sku.urgency >= 2 ? "recommended" : "optional",
    });
  }

  return {
    optimized_purchases: result,
    total_cost: Math.round((budget - remainingBudget) * 100) / 100,
    remaining_budget: Math.round(remainingBudget * 100) / 100,
    total_margin: Math.round(result.reduce((s, r) => s + r.margin_contribution, 0) * 100) / 100,
    items_count: result.length,
  };
}

// ========== Main Handler ==========
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      action = "full_forecast", // "full_forecast" | "single_sku" | "optimize"
      sku_code,
      horizon_days = 30,
      budget: inputBudget,
      storage_capacity = 10000,
      service_level = 0.95,
    } = await req.json();

    console.log(`Pharmacy Forecast: action=${action}, horizon=${horizon_days}`);

    // Fetch sales history
    const { data: salesData, error: salesError } = await supabase
      .from("sales_history_2023")
      .select("Item_Code, Item_Name, Net_Daily_Sales, Unit_Price, Daily_Revenue, Date");

    if (salesError) throw new Error("Failed to fetch sales history: " + salesError.message);
    if (!salesData || salesData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No sales data found. Import transaction history first.", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch inventory
    const { data: inventoryData, error: invError } = await supabase
      .from("Inventory_2023")
      .select("product_code, name, stock_quantity, min_stock, max_stock, purchase_price, selling_price, expiry_date, generic_name, dosage_form, strength, supplier");

    if (invError) console.error("Inventory fetch error:", invError);

    const inventoryMap = new Map(
      (inventoryData || []).map((item) => [item.product_code, item])
    );

    // Aggregate sales per product
    const productSales = new Map<number, {
      code: number;
      name: string;
      dailySales: number[];
      totalRevenue: number;
      unitPrice: number;
      dates: string[];
    }>();

    for (const record of salesData) {
      const code = record.Item_Code;
      if (sku_code && code !== sku_code) continue; // Filter for single SKU

      if (!productSales.has(code)) {
        productSales.set(code, {
          code,
          name: record.Item_Name,
          dailySales: [],
          totalRevenue: 0,
          unitPrice: record.Unit_Price || 0,
          dates: [],
        });
      }
      const ps = productSales.get(code)!;
      ps.dailySales.push(record.Net_Daily_Sales || 0);
      ps.totalRevenue += record.Daily_Revenue || 0;
      if (record.Unit_Price > 0) ps.unitPrice = record.Unit_Price;
      ps.dates.push(record.Date);
    }

    // Calculate total revenue for ABC
    const totalRevenue = Array.from(productSales.values()).reduce((s, p) => s + p.totalRevenue, 0);
    const abcMap = classifyABC(
      Array.from(productSales.values()).map((p) => ({ code: p.code, revenue: p.totalRevenue }))
    );

    // Build results for each product
    const results = [];

    for (const [code, ps] of productSales) {
      const inv = inventoryMap.get(code);
      const currentStock = inv?.stock_quantity || 0;
      const purchasePrice = inv?.purchase_price || ps.unitPrice;
      const sellingPrice = inv?.selling_price || ps.unitPrice;
      const margin = sellingPrice - purchasePrice;
      const leadTime = 3; // Default lead time in days

      // Statistics
      const mean = ps.dailySales.reduce((a, b) => a + b, 0) / ps.dailySales.length;
      const sigma = Math.sqrt(
        ps.dailySales.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / ps.dailySales.length
      );

      // Generate 30-day forecast (simple: use avg daily as baseline)
      const forecast30 = Array.from({ length: 30 }, () => Math.max(0, mean));
      const totalForecast30 = forecast30.reduce((a, b) => a + b, 0);

      // Inventory metrics (from inventory.py formulas)
      const metrics = calculateInventoryMetrics(forecast30, leadTime, sigma, service_level);

      // BI metrics
      const stockoutProb = calculateStockoutProbability(currentStock, totalForecast30, sigma);
      const stockSpeed = classifyStockSpeed(ps.dailySales.reduce((a, b) => a + b, 0));
      const expiryRisk = detectExpiryRisk(currentStock, inv?.expiry_date || null, totalForecast30);
      const cashFlow = calculateCashFlowImpact(metrics.recommended_order_quantity, purchasePrice, margin);
      const abcClass = abcMap.get(code) || "C";

      // Days until stockout
      const daysUntilStockout = mean > 0 ? Math.round(currentStock / mean) : 999;

      // Status
      let status: "CRITICAL" | "LOW" | "OK" = "OK";
      if (daysUntilStockout < 7) status = "CRITICAL";
      else if (daysUntilStockout < 14 || currentStock < metrics.reorder_point) status = "LOW";

      // Trend from recent vs older sales
      const recentHalf = ps.dailySales.slice(-Math.floor(ps.dailySales.length / 2));
      const olderHalf = ps.dailySales.slice(0, Math.floor(ps.dailySales.length / 2));
      const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / (recentHalf.length || 1);
      const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / (olderHalf.length || 1);
      const trendDirection = recentAvg > olderAvg * 1.1 ? "increasing" : recentAvg < olderAvg * 0.9 ? "decreasing" : "stable";

      // Monthly trend data for sparkline
      const monthlyMap = new Map<number, number>();
      for (let i = 0; i < ps.dates.length; i++) {
        const d = ps.dates[i];
        let month = 1;
        if (d.includes("-")) month = parseInt(d.split("-")[1]) || 1;
        else if (d.includes("/")) month = parseInt(d.split("/")[0]) || 1;
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + ps.dailySales[i]);
      }
      const monthlyTrend = Array.from({ length: 12 }, (_, i) => Math.round(monthlyMap.get(i + 1) || 0));

      results.push({
        product_code: code,
        product_name: ps.name,
        generic_name: inv?.generic_name || null,
        dosage_form: inv?.dosage_form || null,
        strength: inv?.strength || null,
        supplier: inv?.supplier || null,
        current_stock: currentStock,
        min_stock: inv?.min_stock || 10,
        max_stock: inv?.max_stock || 100,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        margin,
        // Forecast
        avg_daily_demand: metrics.avg_daily_demand,
        forecast_30_day: Math.round(totalForecast30),
        safety_stock: metrics.safety_stock,
        reorder_point: metrics.reorder_point,
        recommended_order_qty: metrics.recommended_order_quantity,
        // BI
        abc_class: abcClass,
        stock_speed: stockSpeed,
        stockout_probability: Math.round(stockoutProb * 100) / 100,
        days_until_stockout: daysUntilStockout,
        expiry_risk: expiryRisk.atRisk,
        expiry_risk_reason: expiryRisk.reason,
        expiry_date: inv?.expiry_date || null,
        status,
        trend_direction: trendDirection,
        monthly_trend: monthlyTrend,
        cash_flow: cashFlow,
        // Raw
        total_revenue: Math.round(ps.totalRevenue),
        total_sales_qty: Math.round(ps.dailySales.reduce((a, b) => a + b, 0)),
        data_points: ps.dailySales.length,
        sigma: Math.round(sigma * 100) / 100,
      });
    }

    // Sort by status priority
    const statusOrder = { CRITICAL: 0, LOW: 1, OK: 2 };
    results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // Handle optimize action
    let optimization = null;
    if (action === "optimize" && inputBudget) {
      optimization = optimizePurchases(
        results.map((r) => ({
          id: r.product_code,
          name: r.product_name,
          forecastedDemand: r.forecast_30_day,
          price: r.purchase_price,
          margin: r.margin,
          currentStock: r.current_stock,
          minOrderQty: 1,
          safetyStock: r.safety_stock,
          reorderPoint: r.reorder_point,
          stockoutProb: r.stockout_probability,
        })),
        inputBudget,
        storage_capacity
      );
    }

    // Summary
    const criticalCount = results.filter((r) => r.status === "CRITICAL").length;
    const lowCount = results.filter((r) => r.status === "LOW").length;
    const expiryRiskCount = results.filter((r) => r.expiry_risk).length;
    const abcA = results.filter((r) => r.abc_class === "A").length;
    const abcB = results.filter((r) => r.abc_class === "B").length;
    const abcC = results.filter((r) => r.abc_class === "C").length;

    return new Response(
      JSON.stringify({
        success: true,
        results,
        optimization,
        summary: {
          total_products: results.length,
          critical_items: criticalCount,
          low_stock_items: lowCount,
          ok_items: results.length - criticalCount - lowCount,
          expiry_risk_items: expiryRiskCount,
          abc_distribution: { A: abcA, B: abcB, C: abcC },
          total_revenue: totalRevenue,
          total_data_points: salesData.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pharmacy Forecast error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", results: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
