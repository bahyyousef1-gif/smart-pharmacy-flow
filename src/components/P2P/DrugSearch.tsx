import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DrugSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrength, setSelectedStrength] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all drugs on component mount
  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Inventory_2023')
        .select('name, product_code, stock_quantity');

      if (error) throw error;

      // Transform to expected format
      const transformedData = (data || []).map(item => ({
        name: item.name,
        product_code: item.product_code,
        stock: item.stock_quantity && item.stock_quantity > 0 ? 'In Stock' : 'Out of Stock',
        price_EGP: 0,
        price_USD: 0,
        stock_quantity: item.stock_quantity
      }));
      setDrugs(transformedData);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch drug data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    console.log('Searching for:', searchQuery);
    console.log('Available drugs:', drugs.length);

    const filtered = drugs.filter(drug => 
      drug.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log('Filtered results:', filtered.length);

    // Transform the data to include mock pharmacy suppliers
    const resultsWithSuppliers = filtered.map(drug => ({
      drugName: drug.name,
      strength: selectedStrength || "Various",
      priceEGP: drug.price_EGP,
      priceUSD: drug.price_USD,
      stock: drug.stock,
      pharmacies: [
        {
          id: "ph001",
          name: "MediCore Pharmacy",
          distance: "0.8 km",
          price: drug.price_EGP || 0,
          stock: drug.stock === "In Stock" || drug.stock === "Low stock" ? 150 : 0,
          available: drug.stock === "In Stock" || drug.stock === "Low stock"
        },
        {
          id: "ph002",
          name: "Central Drug Store", 
          distance: "1.2 km",
          price: (drug.price_EGP || 0) * 0.95, // 5% discount
          stock: drug.stock === "In Stock" || drug.stock === "Low stock" ? 89 : 0,
          available: drug.stock === "In Stock" || drug.stock === "Low stock"
        },
        {
          id: "ph003",
          name: "HealthPlus Dispensary",
          distance: "2.1 km", 
          price: (drug.price_EGP || 0) * 1.1, // 10% markup
          stock: Math.random() > 0.3 ? 25 : 0,
          available: Math.random() > 0.3
        }
      ]
    }));

    console.log('Results with suppliers:', resultsWithSuppliers);
    setSearchResults(resultsWithSuppliers);
  };

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
                placeholder="Enter drug name... (e.g., Adol, Actos)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
              <Button className="w-full" onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
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
          
          {searchResults.length === 0 && !loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No drugs found matching your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((drug, drugIndex) => (
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
                              <span>EGP {pharmacy.price.toFixed(2)}</span>
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
          )))}
        </div>
      )}
    </div>
  );
};

export default DrugSearch;