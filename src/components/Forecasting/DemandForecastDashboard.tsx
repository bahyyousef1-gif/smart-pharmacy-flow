import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Package,
  DollarSign,
  Brain,
  Loader2,
  Upload
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import DataIngestionPipeline from "@/components/DataIngestion/DataIngestionPipeline";

interface ForecastItem {
  id: string;
  product_code: number;
  product_name: string;
  predicted_qty: number;
  suggested_order: number;
  status: "CRITICAL" | "LOW" | "OK";
  trend_data: number[];
  current_stock?: number;
  price?: number;
}

interface OrderItem {
  product_code: number;
  product_name: string;
  suggested_order: number;
  price: number;
}

const DemandForecastDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"dashboard" | "upload">("dashboard");
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("CRITICAL");
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      
      // Fetch forecasts
      const { data: forecastData, error: forecastError } = await supabase
        .from("daily_forecasts")
        .select("*");

      if (forecastError) throw forecastError;

      // Fetch inventory for current stock and price
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("Inventory_2023")
        .select("product_code, stock_quantity, price");

      if (inventoryError) throw inventoryError;

      // Create a map for quick lookup
      const inventoryMap = new Map(
        inventoryData?.map((item) => [item.product_code, item]) || []
      );

      // Merge forecast with inventory data
      const mergedData: ForecastItem[] = (forecastData || []).map((forecast) => {
        const inventory = inventoryMap.get(forecast.product_code);
        return {
          id: forecast.id,
          product_code: forecast.product_code,
          product_name: forecast.product_name,
          predicted_qty: forecast.predicted_qty,
          suggested_order: forecast.suggested_order,
          status: forecast.status as "CRITICAL" | "LOW" | "OK",
          trend_data: Array.isArray(forecast.trend_data) 
            ? (forecast.trend_data as number[]) 
            : [],
          current_stock: inventory?.stock_quantity || 0,
          price: inventory?.price || Math.random() * 100 + 10, // Fallback price
        };
      });

      setForecasts(mergedData);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      toast({
        title: "Error",
        description: "Failed to load forecast data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    try {
      setGenerating(true);
      toast({
        title: "Generating AI Forecast",
        description: "Analyzing your sales_history_2023 data with Lovable AI...",
      });

      // Call the new AI demand forecast edge function
      const { data, error } = await supabase.functions.invoke('ai-demand-forecast', {
        body: { horizon_days: 30, top_products: 50 }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.predictions && data.predictions.length > 0) {
        const summary = data.summary;
        
        toast({
          title: "AI Forecast Complete",
          description: `Analyzed ${summary?.data_source?.total_records?.toLocaleString() || 0} sales records across ${data.predictions.length} products. Found ${summary?.critical_items || 0} critical items.`,
        });

        // Refresh the forecasts table (data is already saved by edge function)
        await fetchForecasts();
      } else {
        toast({
          title: "No Predictions",
          description: "The AI model did not return any predictions. Make sure you have transaction history data in sales_history_2023.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Forecast generation error:', error);
      
      // Handle specific error codes
      if (error.message?.includes('Rate limit')) {
        toast({
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes('credits')) {
        toast({
          title: "AI Credits Exhausted",
          description: "Please add more credits to your Lovable workspace.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Forecast Failed",
          description: error.message || "Failed to generate AI forecast",
          variant: "destructive",
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return <Badge variant="destructive">Critical</Badge>;
      case "LOW":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Low</Badge>;
      case "OK":
        return <Badge className="bg-green-500 hover:bg-green-600">OK</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleQuantityChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedQuantities((prev) => ({ ...prev, [id]: numValue }));
  };

  const getEffectiveQuantity = (item: ForecastItem) => {
    return editedQuantities[item.id] ?? item.suggested_order;
  };

  const addToOrderList = (item: ForecastItem) => {
    const quantity = getEffectiveQuantity(item);
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid order quantity",
        variant: "destructive",
      });
      return;
    }

    const existingIndex = orderList.findIndex(
      (o) => o.product_code === item.product_code
    );

    if (existingIndex >= 0) {
      const updated = [...orderList];
      updated[existingIndex].suggested_order = quantity;
      setOrderList(updated);
      toast({
        title: "Order Updated",
        description: `Updated ${item.product_name} quantity to ${quantity}`,
      });
    } else {
      setOrderList([
        ...orderList,
        {
          product_code: item.product_code,
          product_name: item.product_name,
          suggested_order: quantity,
          price: item.price || 0,
        },
      ]);
      toast({
        title: "Added to Order",
        description: `${item.product_name} added to order list`,
      });
    }
  };

  // Calculate metrics
  const itemsToOrder = forecasts.filter(
    (f) => f.status === "CRITICAL" || f.status === "LOW"
  ).length;

  const totalPredictedDemand = forecasts.reduce(
    (sum, f) => sum + f.predicted_qty,
    0
  );

  const urgentReplenishmentCost = forecasts
    .filter((f) => f.status === "CRITICAL" || f.status === "LOW")
    .reduce((sum, f) => sum + f.suggested_order * (f.price || 0), 0);

  // Filter forecasts
  const filteredForecasts = forecasts.filter((f) => {
    if (statusFilter === "ALL") return true;
    return f.status === statusFilter;
  });

  // Sort by status priority (CRITICAL first)
  const sortedForecasts = [...filteredForecasts].sort((a, b) => {
    const priority = { CRITICAL: 0, LOW: 1, OK: 2 };
    return priority[a.status] - priority[b.status];
  });

  const SparklineChart = ({ data }: { data: number[] }) => {
    const chartData = data.map((value, index) => ({ value, index }));
    return (
      <ResponsiveContainer width={60} height={24}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Demand Forecasting Dashboard
          </h1>
          <p className="text-muted-foreground">
            AI-powered inventory replenishment recommendations
          </p>
        </div>
        {orderList.length > 0 && (
          <Button className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            View Order List ({orderList.length})
          </Button>
        )}
      </div>

      {/* Tabs for Dashboard vs Upload */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "dashboard" | "upload")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard" className="gap-2">
            <Brain className="h-4 w-4" />
            Forecasts
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <DataIngestionPipeline />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          {/* Forecast Generation */}
          <div className="flex justify-end">
            <Button 
              onClick={generateForecast} 
              disabled={generating}
              className="gap-2 h-10"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate AI Forecast
                </>
              )}
            </Button>
          </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items to Order
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{itemsToOrder}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Critical & Low stock items
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predicted Demand
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalPredictedDemand.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total units (30-day forecast)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgent Replenishment Cost
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${urgentReplenishmentCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated order value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Replenishment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Smart Replenishment Table</CardTitle>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Items</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sortedForecasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p>No forecast data available</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Product Name</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Daily</TableHead>
                    <TableHead className="text-center">7-Day</TableHead>
                    <TableHead className="text-center">30-Day</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Suggested Order</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedForecasts.map((item) => {
                    const dailyForecast = Math.round(item.predicted_qty / 30);
                    const weeklyForecast = Math.round(item.predicted_qty / 30 * 7);
                    return (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold">
                        {item.product_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.current_stock?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {dailyForecast}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {weeklyForecast}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.predicted_qty}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.trend_data.length > 0 && (
                          <SparklineChart data={item.trend_data} />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          className="w-20 mx-auto text-center"
                          value={getEffectiveQuantity(item)}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToOrderList(item)}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add to Order
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order List Summary */}
      {orderList.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order List ({orderList.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orderList.map((item) => (
                <div
                  key={item.product_code}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <span className="font-medium">{item.product_name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Qty: {item.suggested_order}
                    </span>
                    <span className="font-semibold">
                      ${(item.suggested_order * item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-4 border-t mt-4">
                <span className="font-bold">Total Order Value:</span>
                <span className="font-bold text-lg">
                  $
                  {orderList
                    .reduce((sum, item) => sum + item.suggested_order * item.price, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DemandForecastDashboard;
