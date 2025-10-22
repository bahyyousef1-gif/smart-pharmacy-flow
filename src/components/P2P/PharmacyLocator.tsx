import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Star, Map } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const mockRegions = [
  { id: "downtown", name: "Downtown" },
  { id: "central", name: "Central" },
  { id: "westside", name: "Westside" },
];

const mockDrugs = [
  { id: "d001", name: "Paracetamol 500mg" },
  { id: "d002", name: "Amoxicillin 250mg" },
  { id: "d003", name: "Ibuprofen 200mg" },
];

const PharmacyLocator = ({ onOrderPlaced, selectedRegion, setSelectedRegion }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orderModal, setOrderModal] = useState(false);
  const [orderPharmacy, setOrderPharmacy] = useState(null);

  // Order form state
  const [selectedDrug, setSelectedDrug] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState("normal");

  // Mock pharmacy data
  const nearbyPharmacies = [
    {
      id: "ph001",
      name: "MediCore Pharmacy",
      address: "123 Health Street, Downtown",
      distance: "0.8 km",
      phone: "+1 234-567-8901",
      rating: 4.8,
      isOpen: true,
      stockItems: 1250,
      region: "downtown"
    },
    {
      id: "ph002", 
      name: "Central Drug Store",
      address: "456 Medicine Ave, Central",
      distance: "1.2 km",
      phone: "+1 234-567-8902",
      rating: 4.6,
      isOpen: true,
      stockItems: 980,
      region: "central"
    },
    {
      id: "ph003",
      name: "HealthPlus Dispensary",
      address: "789 Wellness Blvd, Westside",
      distance: "2.1 km", 
      phone: "+1 234-567-8903",
      rating: 4.9,
      isOpen: false,
      stockItems: 1450,
      region: "westside"
    }
  ];

  // Filter by region
  const filteredPharmacies = selectedRegion
    ? nearbyPharmacies.filter(ph => ph.region === selectedRegion)
    : nearbyPharmacies;

  // Handle order placement
  const handlePlaceOrder = () => {
    if (!selectedDrug || !quantity || !urgency) return;
    onOrderPlaced({
      id: Date.now().toString(),
      pharmacy: orderPharmacy,
      drug: mockDrugs.find(d => d.id === selectedDrug)?.name,
      quantity,
      urgency,
      status: "pending",
      createdAt: new Date(),
    });
    setOrderModal(false);
    setSelectedDrug("");
    setQuantity(1);
    setUrgency("normal");
    toast({
      title: "Order Placed",
      description: `Order for ${quantity} x ${mockDrugs.find(d => d.id === selectedDrug)?.name} sent to ${orderPharmacy.name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Nearby Pharmacies</h2>
          <p className="text-muted-foreground">Find and connect with pharmacies in your area</p>
        </div>
        <Button variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          Auto-Detect Location
        </Button>
      </div>

      {/* Region Selector & Map */}
      <Card className="rounded-xl bg-red-50/40 border-red-100 transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-red-400" />
            Select Region
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48 rounded-lg border-red-200">
                <SelectValue placeholder="Choose region..." />
              </SelectTrigger>
              <SelectContent>
                {mockRegions.map(region => (
                  <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1">
              {/* Mock map: replace with real map integration */}
              <div className="h-32 rounded-lg bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center text-red-500 font-semibold shadow-inner transition-all">
                [Interactive Map Placeholder]
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by city or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pharmacy List */}
      <div className="grid gap-4">
        {filteredPharmacies.map((pharmacy) => (
          <Card key={pharmacy.id} className="hover:shadow-md transition-shadow rounded-xl bg-white/80">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{pharmacy.name}</h3>
                    <Badge variant={pharmacy.isOpen ? "default" : "secondary"}>
                      <Clock className="h-3 w-3 mr-1" />
                      {pharmacy.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{pharmacy.address}</span>
                      <Badge variant="outline" className="ml-2">{pharmacy.distance}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{pharmacy.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-warning" />
                        <span>{pharmacy.rating}</span>
                      </div>
                      <span>Stock Items: {pharmacy.stockItems}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button size="sm">View Stock</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setOrderPharmacy(pharmacy);
                      setOrderModal(true);
                    }}
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Modal */}
      <Dialog open={orderModal} onOpenChange={setOrderModal}>
        <DialogContent className="rounded-xl bg-white/90 border-red-100 transition-all">
          <DialogHeader>
            <DialogTitle>Place Order to {orderPharmacy?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedDrug} onValueChange={setSelectedDrug}>
              <SelectTrigger className="w-full rounded-lg border-red-200">
                <SelectValue placeholder="Select Drug..." />
              </SelectTrigger>
              <SelectContent>
                {mockDrugs.map(drug => (
                  <SelectItem key={drug.id} value={drug.id}>{drug.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              placeholder="Quantity"
              className="rounded-lg border-red-200"
            />
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="w-full rounded-lg border-red-200">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              className="rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
              onClick={handlePlaceOrder}
              disabled={!selectedDrug || !quantity}
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyLocator;