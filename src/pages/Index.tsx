import { useState } from "react";
import ProtectedRoute from "@/components/Layout/ProtectedRoute";
import AppHeader from "@/components/Layout/AppHeader";
import PharmacyInventory from "@/components/Pharmacy/PharmacyInventory";
import DemandForecastDashboard from "@/components/Forecasting/DemandForecastDashboard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  TrendingUp, 
  Truck, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type TabType = "inventory" | "demand-forecast" | "suppliers" | "help";

const navigation: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "demand-forecast", label: "Demand Forecast", icon: TrendingUp },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "help", label: "Help", icon: HelpCircle },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("inventory");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return <PharmacyInventory />;
      case "demand-forecast":
        return <DemandForecastDashboard />;
      case "suppliers":
        return <SuppliersView />;
      case "help":
        return <HelpView />;
      default:
        return <PharmacyInventory />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex">
          {/* Sidebar */}
          <aside 
            className={cn(
              "border-r bg-card transition-all duration-300 flex flex-col",
              sidebarCollapsed ? "w-16" : "w-56"
            )}
          >
            <nav className="flex-1 p-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Button>
                );
              })}
            </nav>
            
            {/* Collapse Button */}
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <span>Collapse</span>
                  </>
                )}
              </Button>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const SuppliersView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Supplier Management</h2>
    <div className="rounded-lg border bg-card p-12 text-center">
      <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Supplier comparison and management coming soon...</p>
      <p className="text-sm text-muted-foreground mt-2">
        This module will help you compare prices and manage supplier relationships.
      </p>
    </div>
  </div>
);

const HelpView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Help & Support</h2>
    <div className="rounded-lg border bg-card p-12 text-center">
      <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">User manual and help resources coming soon...</p>
      <p className="text-sm text-muted-foreground mt-2">
        Find guides, FAQs, and contact support here.
      </p>
    </div>
  </div>
);

export default Index;
