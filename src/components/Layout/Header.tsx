import { Bell, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  // Fetch drugs for search suggestions
  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const { data, error } = await supabase
        .from('Drugs dataset')
        .select('name, price_EGP, price_USD')
        .limit(100); // Limit for performance

      if (error) throw error;
      setDrugs(data || []);
    } catch (error) {
      console.error('Error fetching drugs:', error);
    }
  };

  // Search functionality with debounce effect
  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = drugs.filter(drug => 
        drug.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8); // Show max 8 results
      
      setSearchResults(filtered);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery, drugs]);

  const handleSearchSelect = (drugName: string) => {
    setSearchQuery(drugName);
    setIsSearchOpen(false);
    toast({
      title: "Drug Selected",
      description: `You selected: ${drugName}`,
    });
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
        <div className="flex-1 max-w-md mx-8">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drugs, suppliers, orders..."
                  className="pl-10 bg-muted/50 border-muted-foreground/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 2 && setIsSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandList>
                  {searchResults.length > 0 ? (
                    <CommandGroup heading="Drugs">
                      {searchResults.map((drug, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => handleSearchSelect(drug.name)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{drug.name}</span>
                            <div className="text-sm text-muted-foreground">
                              EGP {drug.price_EGP} | USD {drug.price_USD}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : searchQuery.length > 2 ? (
                    <CommandEmpty>No drugs found.</CommandEmpty>
                  ) : null}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-warning text-warning-foreground">
              3
            </Badge>
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Dr. Sarah Johnson</p>
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