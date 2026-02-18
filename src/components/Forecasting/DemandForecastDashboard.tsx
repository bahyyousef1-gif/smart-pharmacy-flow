import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  BarChart3,
  Brain,
  Loader2,
  Shield,
  DollarSign,
  ShoppingCart,
  Clock,
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

interface SKUForecast {
  product_code: number;
  product_name: string;
  generic_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  supplier: string | null;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  purchase_price: number;
  selling_price: number;
  margin: number;
  avg_daily_demand: number;
  forecast_30_day: number;
  safety_stock: number;
  reorder_point: number;
  recommended_order_qty: number;
  abc_class: "A" | "B" | "C";
  stock_speed: "Fast" | "Slow" | "Dead";
  stockout_probability: number;
  days_until_stockout: number;
  expiry_risk: boolean;
  expiry_risk_reason: string;
  expiry_date: string | null;
  status: "CRITICAL" | "LOW" | "OK";
  trend_direction: "increasing" | "stable" | "decreasing";
  monthly_trend: number[];
  cash_flow: { total_cost: number; total_margin: number };
  total_revenue: number;
  total_sales_qty: number;
  data_points: number;
  sigma: number;
}

interface OptimizationResult {
  optimized_purchases: {
    id: number;
    name: string;
    optimized_qty: number;
    cost: number;
    margin_contribution: number;
    priority: "essential" | "recommended" | "optional";
  }[];
  total_cost: number;
  remaining_budget: number;
  total_margin: number;
  items_count: number;
}

interface ForecastResponse {
  success: boolean;
  results: SKUForecast[];
  optimization: OptimizationResult | null;
  summary: {
    total_products: number;
    critical_items: number;
    low_stock_items: number;
    ok_items: number;
    expiry_risk_items: number;
    abc_distribution: { A: number; B: number; C: number };
    total_revenue: number;
    total_data_points: number;
  };
}

const chartConfig = {
  value: { label: "Value", color: "hsl(var(--primary))" },
};

// Mini sparkline
const Sparkline = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
};

const DemandForecastDashboard = () => {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [abcFilter, setAbcFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSKU, setSelectedSKU] = useState<SKUForecast | null>(null);

  // Optimization
  const [budget, setBudget] = useState(50000);
  const [optimizing, setOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);

  const runForecast = async () => {
    setLoading(true);
    try {
      toast({ title: "Running Forecast", description: "Analyzing sales history with pharmacy formulas..." });
      const { data, error } = await supabase.functions.invoke("pharmacy-forecast", {
        body: { action: "full_forecast", horizon_days: 30 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForecastData(data);
      setOptimization(data.optimization);
      toast({ title: "Forecast Complete", description: `Analyzed ${data.summary.total_products} SKUs` });
    } catch (err: any) {
      toast({ title: "Forecast Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("pharmacy-forecast", {
        body: { action: "optimize", horizon_days: 30, budget },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForecastData(data);
      setOptimization(data.optimization);
      toast({ title: "Optimization Complete", description: `Optimized for budget ${formatCurrency(budget)}` });
    } catch (err: any) {
      toast({ title: "Optimization Failed", description: err.message, variant: "destructive" });
    } finally {
      setOptimizing(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!forecastData?.results) return [];
    return forecastData.results.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (abcFilter !== "ALL" && r.abc_class !== abcFilter) return false;
      if (searchTerm && !r.product_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [forecastData, statusFilter, abcFilter, searchTerm]);

  const summary = forecastData?.summary;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CRITICAL": return <Badge variant="destructive">Critical</Badge>;
      case "LOW": return <Badge className="bg-warning text-warning-foreground">Low</Badge>;
      default: return <Badge variant="secondary">OK</Badge>;
    }
  };

  const getABCBadge = (abc: string) => {
    switch (abc) {
      case "A": return <Badge className="bg-primary text-primary-foreground">A</Badge>;
      case "B": return <Badge className="bg-accent text-accent-foreground">B</Badge>;
      default: return <Badge variant="outline">C</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="h-4 w-4 text-success" />;
      case "decreasing": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const abcChartData = summary ? [
    { name: "A (High Revenue)", value: summary.abc_distribution.A, fill: "hsl(var(--primary))" },
    { name: "B (Medium)", value: summary.abc_distribution.B, fill: "hsl(var(--accent))" },
    { name: "C (Low)", value: summary.abc_distribution.C, fill: "hsl(var(--muted-foreground))" },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demand Forecasting Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered inventory intelligence with Safety Stock, Reorder Points & ABC Analysis
          </p>
        </div>
        <Button onClick={runForecast} disabled={loading} size="lg" className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {loading ? "Analyzing..." : "Run Forecast"}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{summary.total_products}</p>
              <p className="text-xs text-muted-foreground">Total SKUs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{summary.critical_items}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-warning">{summary.low_stock_items}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{summary.expiry_risk_items}</p>
              <p className="text-xs text-muted-foreground">Expiry Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{summary.total_data_points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Data Points</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      {forecastData && (
        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList>
            <TabsTrigger value="forecast" className="gap-1"><Package className="h-4 w-4" /> SKU Forecast</TabsTrigger>
            <TabsTrigger value="bi" className="gap-1"><BarChart3 className="h-4 w-4" /> Business Intelligence</TabsTrigger>
            <TabsTrigger value="optimize" className="gap-1"><DollarSign className="h-4 w-4" /> Purchase Optimization</TabsTrigger>
          </TabsList>

          {/* ===== SKU Forecast Tab ===== */}
          <TabsContent value="forecast" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="OK">OK</SelectItem>
                </SelectContent>
              </Select>
              <Select value={abcFilter} onValueChange={setAbcFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="ABC Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  <SelectItem value="A">Class A</SelectItem>
                  <SelectItem value="B">Class B</SelectItem>
                  <SelectItem value="C">Class C</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="self-center">
                {filteredResults.length} / {forecastData.results.length} SKUs
              </Badge>
            </div>

            {/* Forecast Table */}
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="font-semibold">Product</TableHead>
                          <TableHead className="text-center">Stock</TableHead>
                          <TableHead className="text-center">Price</TableHead>
                          <TableHead className="text-center">30-Day Forecast</TableHead>
                          <TableHead className="text-center">Safety Stock</TableHead>
                          <TableHead className="text-center">Reorder Pt</TableHead>
                          <TableHead className="text-center">Order Qty</TableHead>
                          <TableHead className="text-center">ABC</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Trend</TableHead>
                          <TableHead className="text-center">Flags</TableHead>
                          <TableHead className="text-center">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.map((r) => (
                          <TableRow key={r.product_code} className={cn(
                            r.status === "CRITICAL" && "bg-destructive/5",
                            r.expiry_risk && "border-l-2 border-l-warning"
                          )}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{r.product_name}</p>
                                <p className="text-xs text-muted-foreground">#{r.product_code}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{r.current_stock}</TableCell>
                            <TableCell className="text-center text-sm">{formatCurrency(r.selling_price)}</TableCell>
                            <TableCell className="text-center font-semibold text-primary">{r.forecast_30_day}</TableCell>
                            <TableCell className="text-center">{r.safety_stock}</TableCell>
                            <TableCell className="text-center">{r.reorder_point}</TableCell>
                            <TableCell className="text-center font-semibold text-accent">{r.recommended_order_qty}</TableCell>
                            <TableCell className="text-center">{getABCBadge(r.abc_class)}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(r.status)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Sparkline data={r.monthly_trend} />
                                {getTrendIcon(r.trend_direction)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-1 justify-center">
                                {r.expiry_risk && (
                                  <span title={r.expiry_risk_reason}>
                                    <Clock className="h-4 w-4 text-warning" />
                                  </span>
                                )}
                                {r.stockout_probability > 0.5 && (
                                  <span title={`Stockout prob: ${(r.stockout_probability * 100).toFixed(0)}%`}>
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedSKU(r)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== BI Tab ===== */}
          <TabsContent value="bi" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ABC Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    ABC Classification
                  </CardTitle>
                  <CardDescription>Revenue-based SKU prioritization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64">
                    <PieChart>
                      <Pie data={abcChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {abcChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-2 rounded bg-primary/10">
                      <p className="text-lg font-bold text-primary">{summary?.abc_distribution.A}</p>
                      <p className="text-xs text-muted-foreground">Class A (70% revenue)</p>
                    </div>
                    <div className="text-center p-2 rounded bg-accent/10">
                      <p className="text-lg font-bold text-accent">{summary?.abc_distribution.B}</p>
                      <p className="text-xs text-muted-foreground">Class B (20% revenue)</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted">
                      <p className="text-lg font-bold text-muted-foreground">{summary?.abc_distribution.C}</p>
                      <p className="text-xs text-muted-foreground">Class C (10% revenue)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    Risk Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Expiry Risks */}
                  {forecastData.results.filter((r) => r.expiry_risk).length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4 text-warning" /> Expiry Risks
                      </p>
                      {forecastData.results
                        .filter((r) => r.expiry_risk)
                        .slice(0, 5)
                        .map((r) => (
                          <div key={r.product_code} className="p-2 rounded bg-warning/10 border border-warning/20 text-sm">
                            <p className="font-medium">{r.product_name}</p>
                            <p className="text-xs text-muted-foreground">{r.expiry_risk_reason}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <Alert className="border-success/50">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <AlertDescription>No expiry risks detected</AlertDescription>
                    </Alert>
                  )}

                  {/* Stockout Risks */}
                  {forecastData.results.filter((r) => r.stockout_probability > 0.5).length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-destructive" /> High Stockout Probability
                      </p>
                      {forecastData.results
                        .filter((r) => r.stockout_probability > 0.5)
                        .slice(0, 5)
                        .map((r) => (
                          <div key={r.product_code} className="p-2 rounded bg-destructive/10 border border-destructive/20 text-sm">
                            <div className="flex justify-between">
                              <p className="font-medium">{r.product_name}</p>
                              <Badge variant="destructive">{(r.stockout_probability * 100).toFixed(0)}%</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ~{r.days_until_stockout} days until stockout • Stock: {r.current_stock}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Stock Speed */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Activity className="h-4 w-4 text-primary" /> Stock Speed
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded bg-success/10">
                        <p className="text-lg font-bold text-success">
                          {forecastData.results.filter((r) => r.stock_speed === "Fast").length}
                        </p>
                        <p className="text-xs text-muted-foreground">Fast Moving</p>
                      </div>
                      <div className="text-center p-2 rounded bg-warning/10">
                        <p className="text-lg font-bold text-warning">
                          {forecastData.results.filter((r) => r.stock_speed === "Slow").length}
                        </p>
                        <p className="text-xs text-muted-foreground">Slow Moving</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted">
                        <p className="text-lg font-bold text-muted-foreground">
                          {forecastData.results.filter((r) => r.stock_speed === "Dead").length}
                        </p>
                        <p className="text-xs text-muted-foreground">Dead Stock</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== Purchase Optimization Tab ===== */}
          <TabsContent value="optimize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Budget-Constrained Purchase Optimization
                </CardTitle>
                <CardDescription>
                  Maximizes profit margin while respecting budget constraints (based on your Python optimization logic)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-sm font-medium">
                      Total Budget: {formatCurrency(budget)}
                    </label>
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      min={0}
                      step={1000}
                    />
                    <Slider
                      value={[budget]}
                      onValueChange={([v]) => setBudget(v)}
                      min={5000}
                      max={500000}
                      step={5000}
                    />
                    <Button onClick={runOptimization} disabled={optimizing} className="w-full gap-2">
                      {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      {optimizing ? "Optimizing..." : "Optimize Purchases"}
                    </Button>
                  </div>

                  {optimization && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded bg-primary/10 text-center">
                          <p className="text-xl font-bold text-primary">{formatCurrency(optimization.total_cost)}</p>
                          <p className="text-xs text-muted-foreground">Total Cost</p>
                        </div>
                        <div className="p-3 rounded bg-success/10 text-center">
                          <p className="text-xl font-bold text-success">{formatCurrency(optimization.remaining_budget)}</p>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                        </div>
                        <div className="p-3 rounded bg-accent/10 text-center">
                          <p className="text-xl font-bold text-accent">{formatCurrency(optimization.total_margin)}</p>
                          <p className="text-xs text-muted-foreground">Expected Margin</p>
                        </div>
                        <div className="p-3 rounded bg-muted text-center">
                          <p className="text-xl font-bold">{optimization.items_count}</p>
                          <p className="text-xs text-muted-foreground">SKUs to Order</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optimized Purchase List */}
                {optimization && optimization.optimized_purchases.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Optimized Purchase List
                    </h4>
                    <ScrollArea className="max-h-96">
                      <div className="space-y-2">
                        {optimization.optimized_purchases.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Badge variant={
                                item.priority === "essential" ? "destructive" :
                                item.priority === "recommended" ? "default" : "secondary"
                              }>
                                {item.priority}
                              </Badge>
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Order {item.optimized_qty} units
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">{formatCurrency(item.cost)}</p>
                              <p className="text-xs text-success">+{formatCurrency(item.margin_contribution)} margin</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!forecastData && !loading && (
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Forecast Data</h3>
          <p className="text-muted-foreground mb-4">
            Click "Run Forecast" to analyze your sales history and generate demand predictions with Safety Stock, Reorder Points, and ABC Classification.
          </p>
          <Button onClick={runForecast} className="gap-2">
            <Brain className="h-4 w-4" /> Run Forecast
          </Button>
        </Card>
      )}

      {/* SKU Detail Dialog */}
      <Dialog open={!!selectedSKU} onOpenChange={() => setSelectedSKU(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSKU?.product_name}</DialogTitle>
          </DialogHeader>
          {selectedSKU && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Product Code:</span> <strong>#{selectedSKU.product_code}</strong></div>
                <div><span className="text-muted-foreground">Generic:</span> <strong>{selectedSKU.generic_name || "N/A"}</strong></div>
                <div><span className="text-muted-foreground">Dosage:</span> <strong>{selectedSKU.dosage_form || "N/A"}</strong></div>
                <div><span className="text-muted-foreground">Strength:</span> <strong>{selectedSKU.strength || "N/A"}</strong></div>
                <div><span className="text-muted-foreground">Supplier:</span> <strong>{selectedSKU.supplier || "N/A"}</strong></div>
                <div><span className="text-muted-foreground">Expiry:</span> <strong>{selectedSKU.expiry_date || "N/A"}</strong></div>
              </div>
              <hr />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded bg-muted text-center">
                  <p className="text-2xl font-bold">{selectedSKU.current_stock}</p>
                  <p className="text-xs text-muted-foreground">Current Stock</p>
                </div>
                <div className="p-3 rounded bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{selectedSKU.forecast_30_day}</p>
                  <p className="text-xs text-muted-foreground">30-Day Demand</p>
                </div>
                <div className="p-3 rounded bg-accent/10 text-center">
                  <p className="text-2xl font-bold text-accent">{selectedSKU.safety_stock}</p>
                  <p className="text-xs text-muted-foreground">Safety Stock</p>
                </div>
                <div className="p-3 rounded bg-success/10 text-center">
                  <p className="text-2xl font-bold text-success">{selectedSKU.reorder_point}</p>
                  <p className="text-xs text-muted-foreground">Reorder Point</p>
                </div>
              </div>
              <div className="p-3 rounded bg-muted text-center">
                <p className="text-3xl font-bold text-primary">{selectedSKU.recommended_order_qty}</p>
                <p className="text-sm text-muted-foreground">Recommended Order Quantity</p>
              </div>
              <div className="flex gap-2 justify-center">
                {getStatusBadge(selectedSKU.status)}
                {getABCBadge(selectedSKU.abc_class)}
                <Badge variant="outline">{selectedSKU.stock_speed}</Badge>
                {selectedSKU.expiry_risk && <Badge className="bg-warning text-warning-foreground">Expiry Risk</Badge>}
                {selectedSKU.stockout_probability > 0.5 && (
                  <Badge variant="destructive">Stockout {(selectedSKU.stockout_probability * 100).toFixed(0)}%</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Avg Daily: {selectedSKU.avg_daily_demand} • σ: {selectedSKU.sigma} • Days to Stockout: {selectedSKU.days_until_stockout} • Margin: {formatCurrency(selectedSKU.margin)}/unit
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemandForecastDashboard;
