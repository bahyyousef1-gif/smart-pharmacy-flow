import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Package, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrderWorkflow = () => {
  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [orderItems, setOrderItems] = useState([
    { drugName: "", strength: "", quantity: "", urgency: "normal" }
  ]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  // Mock pharmacy data
  const pharmacies = [
    { id: "ph001", name: "MediCore Pharmacy", distance: "0.8 km" },
    { id: "ph002", name: "Central Drug Store", distance: "1.2 km" },
    { id: "ph003", name: "HealthPlus Dispensary", distance: "2.1 km" }
  ];

  // Mock recent requests
  const recentRequests = [
    {
      id: "req001",
      toPharmacy: "MediCore Pharmacy",
      drugs: ["Metformin 1000mg x50", "Lisinopril 10mg x30"],
      status: "pending",
      timestamp: "2 hours ago"
    },
    {
      id: "req002", 
      toPharmacy: "Central Drug Store",
      drugs: ["Amlodipine 5mg x100"],
      status: "accepted",
      timestamp: "1 day ago"
    },
    {
      id: "req003",
      toPharmacy: "HealthPlus Dispensary",
      drugs: ["Metformin 500mg x75"],
      status: "rejected",
      timestamp: "2 days ago"
    }
  ];

  const addOrderItem = () => {
    setOrderItems([...orderItems, { drugName: "", strength: "", quantity: "", urgency: "normal" }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: string) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleSendRequest = () => {
    toast({
      title: "Order Request Sent",
      description: "Your request has been sent to the selected pharmacy.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-success-light text-success border-success/20";
      case "rejected": return "bg-destructive-light text-destructive border-destructive/20";
      default: return "bg-warning-light text-warning border-warning/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create Order Request</h2>
        <p className="text-muted-foreground">Send drug requests to nearby pharmacies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              New Order Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pharmacy Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Select Pharmacy</label>
              <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pharmacy" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((pharmacy) => (
                    <SelectItem key={pharmacy.id} value={pharmacy.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{pharmacy.name}</span>
                        <Badge variant="outline" className="ml-2">{pharmacy.distance}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Order Items</label>
                <Button size="sm" variant="outline" onClick={addOrderItem}>
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Drug name"
                        value={item.drugName}
                        onChange={(e) => updateOrderItem(index, "drugName", e.target.value)}
                      />
                      <Input
                        placeholder="Strength"
                        value={item.strength}
                        onChange={(e) => updateOrderItem(index, "strength", e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, "quantity", e.target.value)}
                      />
                      <Select
                        value={item.urgency}
                        onValueChange={(value) => updateOrderItem(index, "urgency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {orderItems.length > 1 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeOrderItem(index)}
                      >
                        Remove Item
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Additional Notes</label>
              <Textarea
                placeholder="Any special instructions or requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSendRequest} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{request.toPharmacy}</h4>
                      <p className="text-sm text-muted-foreground">{request.timestamp}</p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Package className="h-3 w-3" />
                      <span>Items: {request.drugs.length}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs">
                      {request.drugs.map((drug, index) => (
                        <li key={index}>{drug}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderWorkflow;