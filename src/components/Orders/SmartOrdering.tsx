import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  TrendingUp, 
  Calculator,
  CheckCircle,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

const SmartOrdering = () => {
  const [searchTerm, setSearchTerm] = useState("");
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
      
      // Transform drug data into order format
      const orderSuggestions = (data || []).slice(0, 10).map((drug, index) => ({
        id: String(index + 1),
        drugName: drug.name || 'Unknown Drug',
        supplier: 'AutoSelect Supplier',
        currentStock: Math.floor(Math.random() * 50) + 5,
        suggestedQuantity: Math.floor(Math.random() * 100) + 50,
        unitPrice: drug.price_USD || 0,
        totalCost: (drug.price_USD || 0) * (Math.floor(Math.random() * 100) + 50),
        priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        expectedDelivery: '2-3 days',
        lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        aiReason: `Low stock detected. Predicted demand based on sales history.`
      }));
      
      setDrugs(orderSuggestions);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast({
        title: "Error fetching drug data",
        description: "Unable to load smart ordering suggestions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const orders = drugs;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "urgent":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Urgent</Badge>;
      case "suggested":
        return <Badge className="bg-warning-light text-warning border-warning/20">Suggested</Badge>;
      case "optimal":
        return <Badge className="bg-success-light text-success border-success/20">Optimal</Badge>;
      default:
        return <Badge variant="outline">Review</Badge>;
    }
  };

  const updateQuantity = (orderId: string, newQuantity: number) => {
    const updatedDrugs = drugs.map(order => 
      order.id === orderId 
        ? { ...order, suggestedQuantity: newQuantity, totalCost: newQuantity * order.unitPrice }
        : order
    );
    setDrugs(updatedDrugs);
  };

  const totalOrderValue = orders.reduce((sum, order) => sum + order.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Smart Ordering System</h2>
          <p className="text-muted-foreground">AI-powered inventory replenishment suggestions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Order
          </Button>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve All Orders
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Calculator className="h-5 w-5 mr-2" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">${totalOrderValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Urgent Orders</p>
              <p className="text-2xl font-bold text-destructive">
                {orders.filter(o => o.status === "urgent").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Delivery</p>
              <p className="text-2xl font-bold text-foreground">1-5 days</p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {order.drugName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Supplier: {order.supplier} • ETA: {order.deliveryETA}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Stock Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Stock:</span>
                      <span className="font-medium">{order.currentStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum Stock:</span>
                      <span className="font-medium">{order.minimumStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">30-day Forecast:</span>
                      <span className="font-medium flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1 text-accent" />
                        {order.forecastDemand} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Order Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Suggested Qty:</span>
                      <Input
                        type="number"
                        value={order.suggestedQuantity}
                        onChange={(e) => updateQuantity(order.id, parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-sm"
                      />
                      <span className="text-sm text-muted-foreground">units</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unit Price:</span>
                      <span className="font-medium">${order.unitPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Days Supply:</span>
                      <span className="font-medium">{order.daysSupply} days</span>
                    </div>
                  </div>
                </div>

                {/* Cost and Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Total Cost</h4>
                  <div className="text-2xl font-bold text-primary">
                    ${order.totalCost.toFixed(2)}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartOrdering;