import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Inbox, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

const OrderDashboard = () => {
  const [activeTab, setActiveTab] = useState("outgoing");

  // Mock order data
  const orderStats = {
    outgoing: { total: 15, pending: 8, accepted: 5, rejected: 2 },
    incoming: { total: 23, pending: 12, accepted: 9, rejected: 2 }
  };

  const outgoingOrders = [
    {
      id: "OUT001",
      toPharmacy: "MediCore Pharmacy",
      items: ["Metformin 1000mg x50", "Lisinopril 10mg x30"],
      status: "pending",
      timestamp: "2 hours ago",
      progress: 25,
      estimatedResponse: "Today 6:00 PM"
    },
    {
      id: "OUT002",
      toPharmacy: "Central Drug Store", 
      items: ["Amlodipine 5mg x100"],
      status: "accepted",
      timestamp: "1 day ago",
      progress: 75,
      estimatedDelivery: "Tomorrow 2:00 PM"
    },
    {
      id: "OUT003",
      toPharmacy: "HealthPlus Dispensary",
      items: ["Metformin 500mg x75", "Atorvastatin 20mg x40"],
      status: "delivered",
      timestamp: "3 days ago", 
      progress: 100,
      deliveredAt: "Yesterday 4:30 PM"
    }
  ];

  const incomingOrders = [
    {
      id: "INC001",
      fromPharmacy: "Downtown Pharmacy",
      items: ["Omeprazole 20mg x60", "Gabapentin 300mg x90"],
      status: "pending",
      timestamp: "1 hour ago",
      urgency: "normal"
    },
    {
      id: "INC002",
      fromPharmacy: "City Health Pharmacy",
      items: ["Insulin Glargine x5"],
      status: "accepted",
      timestamp: "4 hours ago",
      urgency: "urgent"
    },
    {
      id: "INC003",
      fromPharmacy: "Wellness Drug Store",
      items: ["Levothyroxine 50mcg x30"],
      status: "delivered",
      timestamp: "2 days ago",
      urgency: "emergency"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-success-light text-success border-success/20";
      case "rejected": return "bg-destructive-light text-destructive border-destructive/20";
      case "delivered": return "bg-primary-light text-primary border-primary/20";
      default: return "bg-warning-light text-warning border-warning/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "delivered": return <Truck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-destructive-light text-destructive border-destructive/20";
      case "urgent": return "bg-warning-light text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground border-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Order Dashboard</h2>
        <p className="text-muted-foreground">Track and manage your P2P orders</p>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outgoing Orders</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.outgoing.total}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incoming Orders</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.incoming.total}</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-accent" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">87%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Average fulfillment rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.outgoing.pending + orderStats.incoming.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Awaiting response
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="outgoing" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Outgoing Orders
            <Badge variant="outline">{orderStats.outgoing.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Incoming Orders
            <Badge variant="outline">{orderStats.incoming.total}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outgoing" className="space-y-4">
          {outgoingOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">To: {order.toPharmacy}</p>
                    <p className="text-xs text-muted-foreground">{order.timestamp}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      <Package className="h-3 w-3 mr-1" />
                      {order.items.length} items
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Items:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Package className="h-3 w-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                    
                    {order.estimatedResponse && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected response: {order.estimatedResponse}
                      </p>
                    )}
                    {order.estimatedDelivery && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated delivery: {order.estimatedDelivery}
                      </p>
                    )}
                    {order.deliveredAt && (
                      <p className="text-xs text-success mt-1">
                        Delivered: {order.deliveredAt}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          {incomingOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">Request #{order.id}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <Badge className={getUrgencyColor(order.urgency)}>
                        {order.urgency}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">From: {order.fromPharmacy}</p>
                    <p className="text-xs text-muted-foreground">{order.timestamp}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      <Package className="h-3 w-3 mr-1" />
                      {order.items.length} items
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Requested Items:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Package className="h-3 w-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderDashboard;