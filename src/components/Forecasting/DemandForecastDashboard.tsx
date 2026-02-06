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
      </div>

      {/* Data Ingestion Pipeline */}
      <DataIngestionPipeline />

    </div>
  );
};

export default DemandForecastDashboard;
