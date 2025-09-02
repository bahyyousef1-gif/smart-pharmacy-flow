import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Star } from "lucide-react";

const PharmacyLocator = () => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
      stockItems: 1250
    },
    {
      id: "ph002", 
      name: "Central Drug Store",
      address: "456 Medicine Ave, Central",
      distance: "1.2 km",
      phone: "+1 234-567-8902",
      rating: 4.6,
      isOpen: true,
      stockItems: 980
    },
    {
      id: "ph003",
      name: "HealthPlus Dispensary",
      address: "789 Wellness Blvd, Westside",
      distance: "2.1 km", 
      phone: "+1 234-567-8903",
      rating: 4.9,
      isOpen: false,
      stockItems: 1450
    }
  ];

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
        {nearbyPharmacies.map((pharmacy) => (
          <Card key={pharmacy.id} className="hover:shadow-md transition-shadow">
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
                  <Button size="sm" variant="outline">Send Request</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PharmacyLocator;