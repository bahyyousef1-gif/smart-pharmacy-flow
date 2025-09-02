import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Search, 
  Send, 
  BarChart3, 
  AlertTriangle,
  Users
} from "lucide-react";
import PharmacyLocator from "./PharmacyLocator";
import DrugSearch from "./DrugSearch";
import OrderWorkflow from "./OrderWorkflow";
import OrderDashboard from "./OrderDashboard";

const P2POrderingModule = () => {
  const [activeTab, setActiveTab] = useState("locator");

  // Mock alert data
  const alerts = [
    {
      type: "warning",
      message: "3 pending order requests require response within 2 hours"
    },
    {
      type: "info", 
      message: "New pharmacy 'QuickMed Dispensary' joined your network"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pharmacy-to-Pharmacy Orders</h1>
          <p className="text-muted-foreground">Connect with nearby pharmacies to share inventory and fulfill orders</p>
        </div>
        <Badge className="bg-primary-light text-primary border-primary/20">
          <Users className="h-4 w-4 mr-1" />
          Network Active
        </Badge>
      </div>

      {/* Alert Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} className={alert.type === "warning" ? "border-warning/50 bg-warning/5" : "border-accent/50 bg-accent/5"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="locator" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Pharmacy Locator
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Drug Search
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Order Requests
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
            <Badge variant="outline">3</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locator">
          <PharmacyLocator />
        </TabsContent>

        <TabsContent value="search">
          <DrugSearch />
        </TabsContent>

        <TabsContent value="workflow">
          <OrderWorkflow />
        </TabsContent>

        <TabsContent value="dashboard">
          <OrderDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default P2POrderingModule;