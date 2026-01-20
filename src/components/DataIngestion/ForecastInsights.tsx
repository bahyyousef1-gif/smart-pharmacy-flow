import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  Calendar,
  Download,
  Lightbulb,
  BarChart3,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ForecastInsight {
  type: "stockout_risk" | "overorder_risk" | "demand_spike" | "seasonality" | "trend";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affectedProducts?: string[];
  recommendation?: string;
}

export interface ForecastSummary {
  totalProducts: number;
  criticalItems: number;
  lowStockItems: number;
  totalPredictedDemand: number;
  horizonDays: number;
  modelUsed: string;
  confidenceScore: number;
}

export interface ProductForecast {
  id: string;
  product_name: string;
  product_code: string | number;
  current_stock: number;
  predicted_qty: number;
  suggested_order: number;
  status: "CRITICAL" | "LOW" | "OK";
  trend: "up" | "down" | "stable";
  trend_data: number[];
}

interface ForecastInsightsProps {
  summary: ForecastSummary;
  insights: ForecastInsight[];
  products: ProductForecast[];
  onDownloadReport: () => void;
  onViewDetails: () => void;
}

const getSeverityColor = (severity: ForecastInsight["severity"]) => {
  switch (severity) {
    case "high":
      return "text-destructive bg-destructive/10 border-destructive/30";
    case "medium":
      return "text-warning bg-warning/10 border-warning/30";
    case "low":
      return "text-success bg-success/10 border-success/30";
  }
};

const getInsightIcon = (type: ForecastInsight["type"]) => {
  switch (type) {
    case "stockout_risk":
      return AlertTriangle;
    case "overorder_risk":
      return ShoppingCart;
    case "demand_spike":
      return TrendingUp;
    case "seasonality":
      return Calendar;
    case "trend":
      return BarChart3;
  }
};

const getStatusBadge = (status: ProductForecast["status"]) => {
  switch (status) {
    case "CRITICAL":
      return <Badge variant="destructive">Critical</Badge>;
    case "LOW":
      return <Badge className="bg-warning text-warning-foreground">Low</Badge>;
    case "OK":
      return <Badge variant="secondary">OK</Badge>;
  }
};

const getTrendIcon = (trend: ProductForecast["trend"]) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    case "stable":
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

// Mini sparkline component
const SparklineChart = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary"
      />
    </svg>
  );
};

export const ForecastInsights = ({
  summary,
  insights,
  products,
  onDownloadReport,
  onViewDetails,
}: ForecastInsightsProps) => {
  const highSeverityCount = insights.filter((i) => i.severity === "high").length;
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderList, setOrderList] = useState<ProductForecast[]>([]);

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities((prev) => ({ ...prev, [productId]: numValue }));
  };

  const getEffectiveQuantity = (product: ProductForecast) => {
    return quantities[product.id] !== undefined 
      ? quantities[product.id] 
      : product.suggested_order;
  };

  const addToOrderList = (product: ProductForecast) => {
    if (!orderList.find((p) => p.id === product.id)) {
      setOrderList((prev) => [...prev, product]);
    }
  };

  const filteredProducts = products.filter((p) =>
    statusFilter === "ALL" ? true : p.status === statusFilter
  );

  // Sort by status priority: CRITICAL > LOW > OK
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const statusOrder = { CRITICAL: 0, LOW: 1, OK: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Forecast Summary</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <Package className="h-3 w-3" />
              {summary.horizonDays}-day forecast
            </Badge>
          </div>
          <CardDescription>
            AI-powered demand predictions using {summary.modelUsed} model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">
                {summary.totalProducts}
              </p>
              <p className="text-sm text-muted-foreground">Products Analyzed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <p className="text-3xl font-bold text-destructive">
                {summary.criticalItems}
              </p>
              <p className="text-sm text-muted-foreground">Critical Items</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <p className="text-3xl font-bold text-warning">
                {summary.lowStockItems}
              </p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-3xl font-bold text-success">
                {summary.confidenceScore}%
              </p>
              <p className="text-sm text-muted-foreground">Confidence</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={onViewDetails} className="flex-1 gap-2">
              <TrendingUp className="h-4 w-4" />
              View Forecast Details
            </Button>
            <Button onClick={onDownloadReport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Smart Replenishment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Smart Replenishment Table</CardTitle>
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
          <CardDescription>
            All products from uploaded file with demand predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p>No products match the selected filter</p>
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
                  {sortedProducts.map((product) => {
                    const dailyForecast = Math.round(product.predicted_qty / 30);
                    const weeklyForecast = Math.round((product.predicted_qty / 30) * 7);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-bold">
                          {product.product_name}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.current_stock?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {dailyForecast}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {weeklyForecast}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {product.predicted_qty}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {product.trend_data && product.trend_data.length > 0 && (
                              <SparklineChart data={product.trend_data} />
                            )}
                            {getTrendIcon(product.trend)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(product.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min={0}
                            className="w-20 mx-auto text-center"
                            value={getEffectiveQuantity(product)}
                            onChange={(e) =>
                              handleQuantityChange(product.id, e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToOrderList(product)}
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Order List ({orderList.length} items)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {orderList.map((product) => (
                <Badge key={product.id} variant="secondary" className="gap-1">
                  {product.product_name} × {getEffectiveQuantity(product)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Card */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </div>
              {highSeverityCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {highSeverityCount} urgent
                </Badge>
              )}
            </div>
            <CardDescription>
              Plain-language analysis of your demand patterns and inventory risks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, idx) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-lg border",
                    getSeverityColor(insight.severity)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            insight.severity === "high" && "border-destructive text-destructive",
                            insight.severity === "medium" && "border-warning text-warning",
                            insight.severity === "low" && "border-success text-success"
                          )}
                        >
                          {insight.severity}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90">{insight.description}</p>
                      {insight.affectedProducts && insight.affectedProducts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {insight.affectedProducts.slice(0, 5).map((product, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                          {insight.affectedProducts.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{insight.affectedProducts.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                      {insight.recommendation && (
                        <div className="mt-3 p-2 rounded bg-background/50 text-sm">
                          <span className="font-medium">Recommendation: </span>
                          {insight.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForecastInsights;
