import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database as DatabaseIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  name: string | null;
  product_code: number | null;
  stock_quantity: number | null;
}

const DrugsTable = () => {
  const [drugs, setDrugs] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Inventory_2023')
        .select('name, product_code, stock_quantity')
        .order('name')
        .limit(100);

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

  const getStockBadgeVariant = (stock: number | null) => {
    if (stock === null || stock === 0) return 'destructive';
    if (stock < 50) return 'secondary';
    return 'default';
  };

  const getStockLabel = (stock: number | null) => {
    if (stock === null || stock === 0) return 'Out of Stock';
    if (stock < 50) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DatabaseIcon className="h-5 w-5 mr-2 text-primary" />
          Inventory Database
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading inventory data...</span>
          </div>
        ) : drugs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No inventory data available</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Stock Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drugs.map((drug, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {drug.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {drug.product_code || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {drug.stock_quantity?.toFixed(0) || '0'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStockBadgeVariant(drug.stock_quantity)}>
                        {getStockLabel(drug.stock_quantity)}
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