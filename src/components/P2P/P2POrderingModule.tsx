import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
  MapPin,
  Search,
  Send,
  BarChart3,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import PharmacyLocator from "./PharmacyLocator";
import DrugSearch from "./DrugSearch";
import OrderWorkflow from "./OrderWorkflow";
import OrderDashboard from "./OrderDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const P2POrderingModule = () => {
  const [activeTab, setActiveTab] = useState("locator");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [orders, setOrders] = useState([]);

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

  // Handle new order placed
  const handleOrderPlaced = (order) => {
    setOrders(prev => [order, ...prev]);
    toast({
      title: "New Order Request",
      description: `Order for ${order.quantity} x ${order.drug} placed to ${order.pharmacy.name}.`,
    });
  };

  // Accept/Reject order actions
  const handleOrderAction = (orderId, action) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: action }
          : order
      )
    );
    toast({
      title: `Order ${action === "accepted" ? "Accepted" : "Rejected"}`,
      description: `Order has been ${action}.`,
      variant: action === "accepted" ? "default" : "destructive"
    });
  };

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
            <Badge variant="outline">{orders.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locator">
          <PharmacyLocator
            onOrderPlaced={handleOrderPlaced}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
          />
        </TabsContent>

        <TabsContent value="search">
          <DrugSearch />
        </TabsContent>

        <TabsContent value="workflow">
          {/* Live Timeline/Dashboard */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Live Order Timeline</h2>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center text-muted-foreground py-8">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-red-300 animate-pulse" />
                  No orders placed yet in this region.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders
                  .filter(order => !selectedRegion || order.pharmacy.region === selectedRegion)
                  .map(order => (
                  <Card key={order.id} className="rounded-xl bg-red-50/60 border-red-100 transition-all">
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <div className="font-semibold text-red-700">{order.drug}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {order.quantity} &bull; Urgency: <Badge variant="outline">{order.urgency}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          To: {order.pharmacy.name} ({order.pharmacy.address})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Placed: {order.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
                              onClick={() => handleOrderAction(order.id, "accepted")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg border-red-300 text-red-600 transition"
                              onClick={() => handleOrderAction(order.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {order.status === "accepted" && (
                          <Badge className="bg-green-100 text-green-700 rounded-lg">Accepted</Badge>
                        )}
                        {order.status === "rejected" && (
                          <Badge className="bg-red-100 text-red-700 rounded-lg">Rejected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <OrderDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default P2POrderingModule;