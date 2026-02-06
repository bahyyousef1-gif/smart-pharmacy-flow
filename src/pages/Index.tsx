import { useState } from "react";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Navigation/Sidebar";
import MetricCards from "@/components/Dashboard/MetricCards";
import InventoryGrid from "@/components/Inventory/InventoryGrid";
import InventoryUpload from "@/components/Inventory/InventoryUpload";
import SmartOrdering from "@/components/Orders/SmartOrdering";
import InsuranceModule from "@/components/Insurance/InsuranceModule";
import P2POrderingModule from "@/components/P2P/P2POrderingModule";
import ForecastingDashboard from "@/components/Forecasting/ForecastingDashboard";
import DemandForecastDashboard from "@/components/Forecasting/DemandForecastDashboard";
import DrugsTable from "@/components/Database/DrugsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return <InventoryGrid />;
      case "orders":
        return <SmartOrdering />;
      case "insurance":
        return <InsuranceModule />;
      case "p2p-orders":
        return <P2POrderingModule />;
      case "forecasting":
        return <ForecastingDashboard />;
      case "demand-forecast":
        return <DemandForecastDashboard />;
      case "suppliers":
        return <SuppliersView />;
      case "alerts":
        return <AlertsView />;
      case "help":
        return <HelpView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </CurrencyProvider>
  );
};

const DashboardView = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your pharmacy overview.</p>
      </div>
      <Badge className="bg-success-light text-success border-success/20">
        System Online
      </Badge>
    </div>
    
    <MetricCards />
    
    {/* Inventory Upload */}
    <InventoryUpload />
    
    {/* Drugs Database */}
    <DrugsTable />
    
    {/* Quick Actions & Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            AI Demand Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Next 7 days predicted demand:</div>
            {["Metformin 1000mg", "Lisinopril 10mg", "Amlodipine 5mg"].map((drug, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">{drug}</span>
                <Badge variant="outline" className="bg-accent-light text-accent">
                  +{15 + index * 5}% demand
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View Full Forecast
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
            Priority Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { message: "5 items critically low stock", type: "urgent", icon: AlertTriangle },
              { message: "12 items expiring in 30 days", type: "warning", icon: Clock },
              { message: "8 pending orders awaiting approval", type: "info", icon: CheckCircle }
            ].map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Icon className={`h-4 w-4 ${
                    alert.type === 'urgent' ? 'text-destructive' : 
                    alert.type === 'warning' ? 'text-warning' : 'text-accent'
                  }`} />
                  <span className="flex-1 text-sm">{alert.message}</span>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SuppliersView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Supplier Management</h2>
    <Card>
      <CardContent className="p-12 text-center">
        <p className="text-muted-foreground">Supplier comparison and management coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

const AlertsView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Alerts & Notifications</h2>
    <Card>
      <CardContent className="p-12 text-center">
        <p className="text-muted-foreground">Alert management system coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

const HelpView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Help & Manual</h2>
    <Card>
      <CardContent className="p-12 text-center">
        <p className="text-muted-foreground">User manual and help resources coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

export default Index;