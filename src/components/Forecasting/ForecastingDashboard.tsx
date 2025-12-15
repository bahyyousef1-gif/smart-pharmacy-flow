import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import SalesHistoryImport from "./SalesHistoryImport";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Package, BarChart3, Filter, DollarSign, AlertTriangle, CheckCircle2, Loader2, Brain, ShoppingCart } from "lucide-react";

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

interface ForecastResult {
  predictions: ProductForecast[];
  overallInsights: string;
  seasonalPatterns: string;
  riskAnalysis: string;
  timestamp: string;
}

const chartConfig = {
  actual: {
    label: "Actual Sales",
    color: "hsl(var(--primary))",
  },
  predicted: {
    label: "Predicted Demand", 
    color: "hsl(var(--accent))",
  },
  low: {
    label: "Low Estimate",
    color: "hsl(var(--muted-foreground))",
  },
  high: {
    label: "High Estimate",
    color: "hsl(var(--warning))",
  },
};

const externalFactors = [
  { factor: 'Seasonal Flu', impact: 'High', change: '+24%', trend: 'up' },
  { factor: 'Economic Index', impact: 'Medium', change: '-8%', trend: 'down' },
  { factor: 'Weather Patterns', impact: 'Medium', change: '+12%', trend: 'up' },
  { factor: 'Holiday Season', impact: 'Low', change: '+5%', trend: 'up' }
];

const ForecastingDashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [drugs, setDrugs] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<number>(50000);
  const [budgetPeriod, setBudgetPeriod] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [generatingForecast, setGeneratingForecast] = useState(false);
  const [forecastHorizon, setForecastHorizon] = useState(90);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [drugsResult, salesResult] = await Promise.all([
        supabase.from('Drugs dataset').select('*'),
        supabase.from('sales_history').select('*').order('sale_date', { ascending: false }).limit(1000)
      ]);
      
      if (drugsResult.error) throw drugsResult.error;
      if (salesResult.error) throw salesResult.error;
      
      setDrugs(drugsResult.data || []);
      setSalesHistory(salesResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error fetching data",
        description: "Unable to load data for forecasting.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    try {
      setGeneratingForecast(true);
      toast({
        title: "Generating AI Forecast",
        description: "Analyzing your sales history with AI...",
      });

      const { data, error } = await supabase.functions.invoke('generate-forecast', {
        body: {
          forecastHorizon,
          topProducts: 20
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setForecastResult(data);
      toast({
        title: "Forecast Generated",
        description: `AI analyzed ${data.predictions?.length || 0} products successfully`,
      });
    } catch (error: any) {
      console.error('Error generating forecast:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate forecast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingForecast(false);
    }
  };

  // Aggregate sales data for charts
  const getSalesChartData = () => {
    const monthlyData: Record<string, { actual: number; count: number }> = {};
    
    salesHistory.forEach(sale => {
      if (!sale.sale_date) return;
      const month = new Date(sale.sale_date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) {
        monthlyData[month] = { actual: 0, count: 0 };
      }
      monthlyData[month].actual += sale.total_revenue || 0;
      monthlyData[month].count += 1;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        actual: Math.round(data.actual),
        predicted: Math.round(data.actual * (0.9 + Math.random() * 0.2)) // Simulated prediction for historical
      }))
      .slice(-12);
  };

  // Get product distribution from sales
  const getProductDistribution = () => {
    const distribution: Record<string, number> = {};
    
    salesHistory.forEach(sale => {
      const name = sale.drug_name || 'Unknown';
      distribution[name] = (distribution[name] || 0) + (sale.quantity_sold || 0);
    });

    const sorted = Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = sorted.reduce((sum, [, value]) => sum + value, 0);
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--muted-foreground))'
    ];

    return sorted.map(([name, value], index) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[index]
    }));
  };

  const getDrugCategories = () => {
    const categories = drugs.map(drug => {
      const name = drug.name?.toLowerCase() || '';
      if (name.includes('antibiotic') || name.includes('amoxicillin')) return 'Antibiotics';
      if (name.includes('pain') || name.includes('ibuprofen') || name.includes('acetaminophen')) return 'Pain Relief';
      if (name.includes('vitamin')) return 'Vitamins';
      if (name.includes('allergy') || name.includes('antihistamine')) return 'Allergy';
      return 'Other';
    });
    return [...new Set(categories)];
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  // Budget allocation using AI predictions
  const calculateBudgetAllocation = () => {
    if (!forecastResult?.predictions?.length) {
      return { withinBudget: [], excluded: [], essentialCovered: true, remainingBudget: budget };
    }

    const sorted = [...forecastResult.predictions].sort((a, b) => {
      // Prioritize items with low daysUntilStockout
      if (a.daysUntilStockout < 14 && b.daysUntilStockout >= 14) return -1;
      if (b.daysUntilStockout < 14 && a.daysUntilStockout >= 14) return 1;
      return b.predictedDemand.medium - a.predictedDemand.medium;
    });

    let remainingBudget = budget;
    const withinBudget: any[] = [];
    const excluded: any[] = [];
    let essentialCovered = true;

    sorted.forEach(item => {
      const unitPrice = drugs.find(d => d.name?.toLowerCase() === item.drugName?.toLowerCase())?.price_EGP || 50;
      const totalCost = unitPrice * item.suggestedOrderQty;
      const isEssential = item.daysUntilStockout < 14;

      if (remainingBudget >= totalCost) {
        withinBudget.push({
          ...item,
          unitPrice,
          totalCost,
          priority: isEssential ? 'essential' : 'optional'
        });
        remainingBudget -= totalCost;
      } else {
        excluded.push({ ...item, unitPrice, totalCost, priority: isEssential ? 'essential' : 'optional' });
        if (isEssential) essentialCovered = false;
      }
    });

    return { withinBudget, excluded, essentialCovered, remainingBudget };
  };

  const budgetAllocation = calculateBudgetAllocation();
  const salesChartData = getSalesChartData();
  const productDistribution = getProductDistribution();

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <span className="h-4 w-4 text-muted-foreground">→</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Demand Forecasting
          </h1>
          <p className="text-muted-foreground">
            Real AI-powered demand predictions based on your transaction history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={forecastHorizon.toString()} onValueChange={(v) => setForecastHorizon(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateForecast} 
            disabled={generatingForecast || salesHistory.length === 0}
            size="lg"
            className="gap-2"
          >
            {generatingForecast ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate AI Forecast
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sales History Import */}
      <SalesHistoryImport />

      {/* Data Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transaction Records</p>
                <p className="text-2xl font-bold text-primary">{salesHistory.length.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drugs in Inventory</p>
                <p className="text-2xl font-bold text-accent">{drugs.length.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Forecast Horizon</p>
                <p className="text-2xl font-bold text-success">{forecastHorizon} days</p>
              </div>
              <Calendar className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Forecast Results */}
      {forecastResult && forecastResult.predictions?.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Forecast Predictions ({forecastResult.predictions.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">Overall Insights</h4>
                <p className="text-sm text-muted-foreground">{forecastResult.overallInsights || 'Analysis completed based on historical data.'}</p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">Seasonal Patterns</h4>
                <p className="text-sm text-muted-foreground">{forecastResult.seasonalPatterns || 'Seasonal analysis based on sales trends.'}</p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">Risk Analysis</h4>
                <p className="text-sm text-muted-foreground">{forecastResult.riskAnalysis || 'Monitor stock levels for timely reordering.'}</p>
              </div>
            </div>

            {/* Product Predictions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Current Stock</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Predicted Demand</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Trend</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Confidence</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Days to Stockout</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Suggested Order</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastResult.predictions.slice(0, 10).map((prediction, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground capitalize">{prediction.drugName}</td>
                      <td className="p-3 text-center text-foreground">{prediction.currentStock}</td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-primary">{prediction.predictedDemand.medium}</span>
                          <span className="text-xs text-muted-foreground">
                            ({prediction.predictedDemand.low} - {prediction.predictedDemand.high})
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(prediction.trend)}
                          <span className="capitalize text-muted-foreground">{prediction.trend}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={prediction.confidence >= 0.8 ? "default" : "secondary"}>
                          {(prediction.confidence * 100).toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge 
                          variant={prediction.daysUntilStockout < 14 ? "destructive" : prediction.daysUntilStockout < 30 ? "secondary" : "outline"}
                        >
                          {prediction.daysUntilStockout} days
                        </Badge>
                      </td>
                      <td className="p-3 text-center font-semibold text-accent">{prediction.suggestedOrderQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Forecasting Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget-Constrained Ordering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Budget Period
                </label>
                <Select value={budgetPeriod} onValueChange={(value: any) => setBudgetPeriod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Available Budget: {formatCurrency(budget)}
                </label>
                <Input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mb-3"
                  min={0}
                  step={1000}
                />
                <Slider 
                  value={[budget]}
                  onValueChange={([value]) => setBudget(value)}
                  min={10000}
                  max={200000}
                  step={5000}
                  className="w-full"
                />
              </div>
            </div>

            {/* Budget Status */}
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Total Allocated</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(budget - budgetAllocation.remainingBudget)}
                </p>
              </div>
              
              <div className="p-4 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Remaining Budget</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(budgetAllocation.remainingBudget)}
                </p>
              </div>

              {!budgetAllocation.essentialCovered && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Budget insufficient to cover items with low stock. Consider increasing budget.
                  </AlertDescription>
                </Alert>
              )}

              {budgetAllocation.essentialCovered && forecastResult && (
                <Alert className="border-success/50 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    All priority items covered within budget.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* AI-Recommended Purchase List */}
          {budgetAllocation.withinBudget.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  AI-Recommended Purchase List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {budgetAllocation.withinBudget.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={item.priority === 'essential' ? 'destructive' : 'secondary'}>
                          {item.priority === 'essential' ? 'Urgent' : 'Standard'}
                        </Badge>
                        <div>
                          <p className="font-medium text-foreground capitalize">{item.drugName}</p>
                          <p className="text-xs text-muted-foreground">
                            Order {item.suggestedOrderQty} units • {item.daysUntilStockout} days to stockout
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(item.totalCost)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)}/unit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Main Charts */}
      <Tabs defaultValue="demand" className="space-y-6">
        <TabsList>
          <TabsTrigger value="demand">Sales Trends</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
          <TabsTrigger value="factors">External Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Historical Sales Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Revenue"
                      stroke="var(--color-actual)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-actual)", r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>Import transaction history to see sales trends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {productDistribution.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-80">
                  <PieChart>
                    <Pie
                      data={productDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {productDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>Import transaction history to see product analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External Factor Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {externalFactors.map((factor) => (
                  <div key={factor.factor} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{factor.factor}</p>
                      <p className="text-sm text-muted-foreground">Impact: {factor.impact}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={factor.trend === 'up' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {factor.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {factor.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Generate Detailed Report</h3>
              <p className="text-sm text-muted-foreground">
                Export comprehensive forecasting analysis with AI recommendations
              </p>
            </div>
            <Button disabled={!forecastResult}>
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastingDashboard;
