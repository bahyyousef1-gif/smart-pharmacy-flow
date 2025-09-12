import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database as DatabaseIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Drug = Database['public']['Tables']['Drugs dataset']['Row'];

const DrugsTable = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
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
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setDrugs(data || []);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast({
        title: "Error",
        description: "Failed to load drugs data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'N/A';
    return `${price.toFixed(2)} ${currency}`;
  };

  const getStockBadgeVariant = (stock: string | null) => {
    if (!stock) return 'secondary';
    const stockLower = stock.toLowerCase();
    if (stockLower.includes('in stock') || stockLower.includes('available')) {
      return 'default';
    }
    if (stockLower.includes('low') || stockLower.includes('limited')) {
      return 'destructive';
    }
    if (stockLower.includes('out') || stockLower.includes('unavailable')) {
      return 'outline';
    }
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DatabaseIcon className="h-5 w-5 mr-2 text-primary" />
          Drugs Database
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading drugs data...</span>
          </div>
        ) : drugs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No drugs data available</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Price (EGP)</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Stock Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drugs.map((drug, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {drug.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {formatPrice(drug.price_EGP, 'EGP')}
                    </TableCell>
                    <TableCell>
                      {formatPrice(drug.price_USD, 'USD')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStockBadgeVariant(drug.stock)}>
                        {drug.stock || 'Unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DrugsTable;