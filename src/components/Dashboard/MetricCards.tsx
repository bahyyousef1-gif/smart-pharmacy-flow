import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  DollarSign,
  ShoppingCart
} from "lucide-react";

const MetricCards = () => {
  const metrics = [
    {
      title: "Total Stock Value",
      value: "$284,320",
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      description: "Inventory worth"
    },
    {
      title: "Low Stock Items", 
      value: "23",
      change: "+3 today",
      changeType: "warning",
      icon: AlertTriangle,
      description: "Need reordering"
    },
    {
      title: "Pending Orders",
      value: "8",
      change: "2 urgent",
      changeType: "info",
      icon: ShoppingCart,
      description: "Awaiting delivery"
    },
    {
      title: "Expiring Soon",
      value: "12",
      change: "Next 30 days",
      changeType: "warning",
      icon: Clock,
      description: "Items to rotate"
    },
    {
      title: "Monthly Sales",
      value: "$89,240",
      change: "+18.2%",
      changeType: "positive",
      icon: TrendingUp,
      description: "vs last month"
    },
    {
      title: "Total SKUs",
      value: "1,247",
      change: "+24 new",
      changeType: "info",
      icon: Package,
      description: "Active products"
    }
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case "positive": return "text-success";
      case "warning": return "text-warning";
      case "negative": return "text-destructive";
      default: return "text-accent";
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "positive": return "bg-success-light text-success border-success/20";
      case "warning": return "bg-warning-light text-warning border-warning/20";
      case "negative": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-accent-light text-accent border-accent/20";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-all duration-200 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getBadgeVariant(metric.changeType)}`}
                >
                  {metric.change}
                </Badge>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricCards;