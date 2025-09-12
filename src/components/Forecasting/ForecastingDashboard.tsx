import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Package, BarChart3, Filter } from "lucide-react";

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
  const { toast } = useToast();

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
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={generateForecastData()}>
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
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--color-actual)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-actual)", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="var(--color-predicted)"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "var(--color-predicted)", r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
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