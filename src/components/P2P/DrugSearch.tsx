import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, MapPin, DollarSign } from "lucide-react";

const DrugSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrength, setSelectedStrength] = useState("");

  // Mock drug availability data
  const drugAvailability = [
    {
      drugName: "Metformin HCl",
      strength: "1000mg",
      pharmacies: [
        {
          id: "ph001",
          name: "MediCore Pharmacy",
          distance: "0.8 km",
          price: 45.99,
          stock: 150,
          available: true
        },
        {
          id: "ph002", 
          name: "Central Drug Store",
          distance: "1.2 km",
          price: 42.50,
          stock: 89,
          available: true
        },
        {
          id: "ph003",
          name: "HealthPlus Dispensary", 
          distance: "2.1 km",
          price: 48.75,
          stock: 0,
          available: false
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Drug Availability Search</h2>
        <p className="text-muted-foreground">Search for drugs across nearby pharmacies</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Drugs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Drug Name</label>
              <Input
                placeholder="Enter drug name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Strength</label>
              <Select value={selectedStrength} onValueChange={setSelectedStrength}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strength" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500mg">500mg</SelectItem>
                  <SelectItem value="1000mg">1000mg</SelectItem>
                  <SelectItem value="1500mg">1500mg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Results for "{searchQuery}" {selectedStrength && `- ${selectedStrength}`}
          </h3>
          
          {drugAvailability.map((drug, drugIndex) => (
            <Card key={drugIndex}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    {drug.drugName} - {drug.strength}
                  </div>
                  <Badge variant="outline">{drug.pharmacies.length} pharmacies found</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {drug.pharmacies
                    .sort((a, b) => a.price - b.price) // Sort by price (lowest first)
                    .map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className={`p-4 border rounded-lg ${
                        pharmacy.available ? "border-border" : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-foreground">{pharmacy.name}</h4>
                            {pharmacy.available && pharmacy.price <= Math.min(...drug.pharmacies.filter(p => p.available).map(p => p.price)) && (
                              <Badge className="bg-success-light text-success border-success/20">
                                Best Price
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{pharmacy.distance}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${pharmacy.price}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              <span>Stock: {pharmacy.stock}</span>
                              <Badge variant={pharmacy.available ? "default" : "destructive"}>
                                {pharmacy.available ? "Available" : "Out of Stock"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button 
                            size="sm" 
                            disabled={!pharmacy.available}
                          >
                            Request Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrugSearch;