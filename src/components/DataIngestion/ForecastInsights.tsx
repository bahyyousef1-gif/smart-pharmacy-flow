import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  Download,
  Lightbulb,
  BarChart3,
  ShoppingCart,
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

interface ForecastInsightsProps {
  summary: ForecastSummary;
  insights: ForecastInsight[];
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

export const ForecastInsights = ({
  summary,
  insights,
  onDownloadReport,
  onViewDetails,
}: ForecastInsightsProps) => {
  const highSeverityCount = insights.filter((i) => i.severity === "high").length;

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

      {/* Insights Card */}
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
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No significant insights detected</p>
              <p className="text-sm">Your inventory appears to be well-balanced</p>
            </div>
          ) : (
            insights.map((insight, idx) => {
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
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastInsights;
