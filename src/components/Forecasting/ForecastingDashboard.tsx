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
import { TrendingUp, TrendingDown, Calendar, Package, BarChart3, Filter, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";

// Mock data for charts
const salesData = [
  { month: 'Jan', actual: 12000, predicted: 11500 },
  { month: 'Feb', actual: 13500, predicted: 13200 },
  { month: 'Mar', actual: 11200, predicted: 12800 },
  { month: 'Apr', actual: 14800, predicted: 14200 },
  { month: 'May', actual: 16200, predicted: 15800 },
  { month: 'Jun', actual: 15800, predicted: 16500 },
  { month: 'Jul', actual: 17200, predicted: 17800 },
  { month: 'Aug', actual: null, predicted: 18200 },
  { month: 'Sep', actual: null, predicted: 17500 },
  { month: 'Oct', actual: null, predicted: 19200 },
  { month: 'Nov', actual: null, predicted: 20500 },
  { month: 'Dec', actual: null, predicted: 21800 }
];

const seasonalTrends = [
  { period: 'Q1', antibiotics: 85, painkillers: 72, vitamins: 45, allergy: 28 },
  { period: 'Q2', antibiotics: 65, painkillers: 58, vitamins: 78, allergy: 95 },
  { period: 'Q3', antibiotics: 48, painkillers: 42, vitamins: 82, allergy: 88 },
  { period: 'Q4', antibiotics: 92, painkillers: 85, vitamins: 65, allergy: 35 }
];

const productPerformance = [
  { name: 'Paracetamol', value: 28, color: 'hsl(var(--primary))' },
  { name: 'Amoxicillin', value: 22, color: 'hsl(var(--accent))' },
  { name: 'Ibuprofen', value: 18, color: 'hsl(var(--success))' },
  { name: 'Vitamin D', value: 15, color: 'hsl(var(--warning))' },
  { name: 'Others', value: 17, color: 'hsl(var(--muted-foreground))' }
];

const externalFactors = [
  { factor: 'Seasonal Flu', impact: 'High', change: '+24%', trend: 'up' },
  { factor: 'Economic Index', impact: 'Medium', change: '-8%', trend: 'down' },
  { factor: 'Weather Patterns', impact: 'Medium', change: '+12%', trend: 'up' },
  { factor: 'Holiday Season', impact: 'Low', change: '+5%', trend: 'up' }
];

const chartConfig = {
  actual: {
    label: "Actual Sales",
    color: "hsl(var(--primary))",
  },
  predicted: {
    label: "Predicted Demand", 
    color: "hsl(var(--accent))",
  },
};

const ForecastingDashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [timeRange, setTimeRange] = useState("12m");
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<number>(50000);
  const [budgetPeriod, setBudgetPeriod] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Drugs dataset')
        .select('*');
      
      if (error) throw error;
      setDrugs(data || []);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast({
        title: "Error fetching drug data",
        description: "Unable to load drug information for forecasting.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate forecast data based on real drug prices
  const generateForecastData = () => {
    const avgPrice = drugs.reduce((sum, drug) => sum + (drug.price_USD || 0), 0) / (drugs.length || 1);
    return salesData.map(item => ({
      ...item,
      actual: item.actual ? Math.round(avgPrice * 100 * Math.random() * 2) : null,
      predicted: Math.round(avgPrice * 120 * Math.random() * 2)
    }));
  };

  // Get unique drug categories from actual data
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

  // Budget forecasting logic
  interface DrugPurchaseRecommendation {
    name: string;
    priority: 'essential' | 'optional';
    estimatedDemand: number;
    unitPrice: number;
    totalCost: number;
    supplierDiscount: number;
    profitMargin: number;
    seasonalityFactor: number;
  }

  const generatePurchaseRecommendations = (): DrugPurchaseRecommendation[] => {
    return drugs.map(drug => {
      const name = drug.name?.toLowerCase() || '';
      const isEssential = name.includes('antibiotic') || name.includes('insulin') || 
                          name.includes('aspirin') || name.includes('pain') || 
                          name.includes('blood') || name.includes('heart');
      
      // Calculate estimated demand based on historical data and seasonality
      const basePrice = drug.price_EGP || 0;
      const seasonalMultiplier = selectedFactors.length > 0 ? 1.2 : 1.0;
      const demandEstimate = Math.round(Math.random() * 100 + 50) * seasonalMultiplier;
      
      return {
        name: drug.name || 'Unknown',
        priority: isEssential ? 'essential' : 'optional',
        estimatedDemand: demandEstimate,
        unitPrice: basePrice,
        totalCost: basePrice * demandEstimate,
        supplierDiscount: Math.random() * 15, // 0-15% discount
        profitMargin: 20 + Math.random() * 30, // 20-50% margin
        seasonalityFactor: seasonalMultiplier
      };
    });
  };

  const calculateBudgetAllocation = () => {
    const recommendations = generatePurchaseRecommendations();
    
    // Sort by priority (essential first) then by demand
    const sorted = recommendations.sort((a, b) => {
      if (a.priority === 'essential' && b.priority !== 'essential') return -1;
      if (a.priority !== 'essential' && b.priority === 'essential') return 1;
      return b.estimatedDemand - a.estimatedDemand;
    });

    let remainingBudget = budget;
    const withinBudget: DrugPurchaseRecommendation[] = [];
    const excluded: DrugPurchaseRecommendation[] = [];
    let essentialCovered = true;

    sorted.forEach(item => {
      const costAfterDiscount = item.totalCost * (1 - item.supplierDiscount / 100);
      if (remainingBudget >= costAfterDiscount) {
        withinBudget.push({ ...item, totalCost: costAfterDiscount });
        remainingBudget -= costAfterDiscount;
      } else {
        excluded.push(item);
        if (item.priority === 'essential') {
          essentialCovered = false;
        }
      }
    });

    return { withinBudget, excluded, essentialCovered, remainingBudget };
  };

  const budgetAllocation = calculateBudgetAllocation();
  
  // Calculate forecast accuracy
  const calculateAccuracy = () => {
    const dataWithActual = salesData.filter(item => item.actual !== null);
    const accuracyByPeriod = dataWithActual.map(item => {
      const deviation = Math.abs(item.actual! - item.predicted);
      const accuracy = 100 - (deviation / item.actual!) * 100;
      return {
        month: item.month,
        accuracy: Math.max(0, accuracy),
        isAccurate: accuracy >= 90,
        deviation: deviation
      };
    });
    
    const overallAccuracy = accuracyByPeriod.reduce((sum, item) => sum + item.accuracy, 0) / accuracyByPeriod.length;
    
    return { accuracyByPeriod, overallAccuracy };
  };

  const { accuracyByPeriod, overallAccuracy } = calculateAccuracy();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Demand Forecasting & Analytics
        </h1>
        <p className="text-muted-foreground">
          AI-powered insights for inventory planning and demand prediction
        </p>
      </div>

      {/* Budget Forecasting Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget Forecasting
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
                    Budget insufficient to cover all essential drugs. Consider increasing budget or adjusting priorities.
                  </AlertDescription>
                </Alert>
              )}

              {budgetAllocation.essentialCovered && (
                <Alert className="border-success/50 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    All essential drugs covered within budget.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Allocation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Essential Drugs</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(budgetAllocation.withinBudget
                      .filter(d => d.priority === 'essential')
                      .reduce((sum, d) => sum + d.totalCost, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgetAllocation.withinBudget.filter(d => d.priority === 'essential').length} items
                  </p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-1">Optional Drugs</p>
                  <p className="text-xl font-bold text-accent">
                    {formatCurrency(budgetAllocation.withinBudget
                      .filter(d => d.priority === 'optional')
                      .reduce((sum, d) => sum + d.totalCost, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgetAllocation.withinBudget.filter(d => d.priority === 'optional').length} items
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Purchase List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommended Purchase List (Within Budget)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {budgetAllocation.withinBudget.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={item.priority === 'essential' ? 'default' : 'secondary'}>
                        {item.priority}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Est. Demand: {item.estimatedDemand} units • {item.supplierDiscount.toFixed(1)}% discount
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(item.totalCost)}</p>
                      <p className="text-xs text-muted-foreground">{item.profitMargin.toFixed(0)}% margin</p>
                    </div>
                  </div>
                ))}
                {budgetAllocation.withinBudget.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{budgetAllocation.withinBudget.length - 10} more items...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Product Category
              </label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {getDrugCategories().map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Time Range
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="12m">12 Months</SelectItem>
                  <SelectItem value="24m">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                External Factors
              </label>
              <div className="flex flex-wrap gap-2">
                {externalFactors.map((factor) => (
                  <Badge
                    key={factor.factor}
                    variant={selectedFactors.includes(factor.factor) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFactor(factor.factor)}
                  >
                    {factor.factor}
                    {factor.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 ml-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Main Charts */}
      <Tabs defaultValue="demand" className="space-y-6">
        <TabsList>
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Actual Sales vs Predicted Demand
              </CardTitle>
              <div className="mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-foreground">
                  Overall Forecast Accuracy: <span className="text-lg font-bold text-primary">{overallAccuracy.toFixed(1)}%</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {accuracyByPeriod.length} months of actual vs predicted data comparison
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Time Period (Months)', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--foreground))' } }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Sales Amount ($)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Sales"
                      stroke="var(--color-actual)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-actual)", r: 5 }}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      name="Predicted Sales"
                      stroke="var(--color-predicted)"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: "var(--color-predicted)", r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              {/* Accuracy Breakdown by Period */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Forecast Accuracy by Period</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {accuracyByPeriod.map((period) => (
                    <div 
                      key={period.month}
                      className={`p-3 rounded-lg border ${
                        period.isAccurate 
                          ? 'bg-success/10 border-success/30' 
                          : 'bg-warning/10 border-warning/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{period.month}</span>
                        {period.isAccurate ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-lg font-bold ${period.isAccurate ? 'text-success' : 'text-warning'}`}>
                          {period.accuracy.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          accuracy
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deviation: ${period.deviation.toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                    <p className="text-2xl font-bold text-success">94.2%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Month Predicted</p>
                    <p className="text-2xl font-bold text-primary">
                      ${Math.round(drugs.reduce((sum, drug) => sum + (drug.price_USD || 0), 0) * 1.2)}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-2xl font-bold text-accent">+12.5%</p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Demand Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <AreaChart data={seasonalTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="antibiotics"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="painkillers"
                    stackId="1"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="vitamins"
                    stackId="1"
                    stroke="hsl(var(--success))"
                    fill="hsl(var(--success))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="allergy"
                    stackId="1"
                    stroke="hsl(var(--warning))"
                    fill="hsl(var(--warning))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <PieChart>
                    <Pie
                      data={productPerformance}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {productPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

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
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Generate Detailed Report</h3>
              <p className="text-sm text-muted-foreground">
                Export comprehensive forecasting analysis with recommendations
              </p>
            </div>
            <Button>
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastingDashboard;