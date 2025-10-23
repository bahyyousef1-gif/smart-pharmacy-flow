import { Bell, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<any>(null);
  const [showDrugDetails, setShowDrugDetails] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, type: "warning", message: "5 items critically low stock", time: "2m ago" },
    { id: 2, type: "info", message: "New order approved", time: "1h ago" },
    { id: 3, type: "alert", message: "3 items expiring soon", time: "3h ago" },
  ]);
  const { toast } = useToast();

  // Fetch drugs for search suggestions
  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const { data, error } = await supabase
        .from('Drugs dataset')
        .select('*');

      if (error) throw error;
      setDrugs(data || []);
    } catch (error) {
      console.error('Error fetching drugs:', error);
    }
  };

  // Smart search functionality with fuzzy matching
  const getSmartSuggestions = (query: string) => {
    if (query.length < 2) return [];

    const queryLower = query.toLowerCase();
    
    // Score-based matching
    const scored = drugs.map(drug => {
      if (!drug.name) return null;
      
      const nameLower = drug.name.toLowerCase();
      let score = 0;

      // Exact match at start gets highest score
      if (nameLower.startsWith(queryLower)) {
        score += 100;
      }
      
      // Word boundary matches
      const words = nameLower.split(/\s+/);
      words.forEach(word => {
        if (word.startsWith(queryLower)) {
          score += 50;
        }
      });

      // Contains query anywhere
      if (nameLower.includes(queryLower)) {
        score += 25;
      }

      // Fuzzy matching for typos
      const distance = levenshteinDistance(queryLower, nameLower.substring(0, queryLower.length));
      if (distance <= 2 && distance > 0) {
        score += 10 - distance;
      }

      return score > 0 ? { ...drug, score } : null;
    }).filter(Boolean);

    // Sort by score and return top matches
    return scored
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 8)
      .map(item => item!);
  };

  // Simple Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Search with debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        const suggestions = getSmartSuggestions(searchQuery);
        setSearchResults(suggestions);
        setIsSearchOpen(suggestions.length > 0);
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, drugs]);

  const handleSearchSelect = (drug: any) => {
    setSelectedDrug(drug);
    setSearchQuery(drug.name);
    setIsSearchOpen(false);
    setShowDrugDetails(true);
  };

  const formatPrice = (price: number | null, currency: string) => {
    return price ? `${currency} ${price.toFixed(2)}` : 'N/A';
  };

  const getStockStatus = (stock: string | null) => {
    if (!stock || stock === "No additional info") return "Unknown";
    return stock;
  };
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pharmachain.ai</h1>
            <p className="text-xs text-muted-foreground">Supply Chain Platform</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8 relative">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drugs intelligently..."
                  className="pl-10 bg-background border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[400px] p-0 bg-background border border-border shadow-lg z-50" 
              align="start"
            >
              <div className="bg-background p-4 space-y-2">
                {searchResults.length > 0 ? (
                  <>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Smart Drug Suggestions</h4>
                    {searchResults.map((drug, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearchSelect(drug)}
                        className="cursor-pointer hover:bg-accent p-3 rounded-lg bg-background transition-colors"
                      >
                        <div className="flex flex-col w-full space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{drug.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Score: {drug.score || 'Match'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>EGP {drug.price_EGP}</span>
                            <span>USD {drug.price_USD}</span>
                            <span>Stock: {getStockStatus(drug.stock)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : searchQuery.length >= 2 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No drugs found matching "{searchQuery}"
                  </div>
                ) : null}
              </div>
            </PopoverContent>
          </Popover>

          {/* Drug Details Modal */}
          {showDrugDetails && selectedDrug && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground">Drug Details</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowDrugDetails(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg text-foreground mb-2">{selectedDrug.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Price (EGP)</label>
                          <p className="text-lg font-semibold text-foreground">{formatPrice(selectedDrug.price_EGP, 'EGP')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Price (USD)</label>
                          <p className="text-lg font-semibold text-foreground">{formatPrice(selectedDrug.price_USD, 'USD')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-muted-foreground">Stock Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={selectedDrug.stock === "Low stock" ? "destructive" : "default"}>
                          {getStockStatus(selectedDrug.stock)}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-foreground mt-1">{selectedDrug.date || 'N/A'}</p>
                    </div>

                    <div className="bg-primary/10 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Available Pharmacies</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>MediCore Pharmacy (0.8 km)</span>
                          <span className="font-medium">EGP {selectedDrug.price_EGP}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Central Drug Store (1.2 km)</span>
                          <span className="font-medium">EGP {((selectedDrug.price_EGP || 0) * 0.95).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HealthPlus Dispensary (2.1 km)</span>
                          <span className="font-medium">EGP {((selectedDrug.price_EGP || 0) * 1.1).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">Request Order</Button>
                      <Button variant="outline" className="flex-1">Add to Watchlist</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-warning text-warning-foreground">
                  {notifications.length}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Notifications</h4>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Badge 
                            variant={notification.type === "warning" ? "destructive" : "default"}
                            className="mt-1"
                          >
                            {notification.type}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Notifications cleared",
                      description: "All notifications have been marked as read.",
                    });
                    setIsNotificationOpen(false);
                  }}
                >
                  Clear All
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Dr. Karim Elsawy</p>
              <p className="text-xs text-muted-foreground">MediCare Pharmacy</p>
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;