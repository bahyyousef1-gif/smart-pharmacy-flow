import { useState } from "react";
import ProtectedRoute from "@/components/Layout/ProtectedRoute";
import AppHeader from "@/components/Layout/AppHeader";
import Sidebar from "@/components/Navigation/Sidebar";
import PharmacyInventory from "@/components/Pharmacy/PharmacyInventory";
import SmartOrdering from "@/components/Orders/SmartOrdering";
import DemandForecastDashboard from "@/components/Forecasting/DemandForecastDashboard";
import { Truck, HelpCircle } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return <PharmacyInventory />;
      case "orders":
        return <SmartOrdering />;
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
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
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
