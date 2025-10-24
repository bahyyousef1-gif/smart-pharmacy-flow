import { useState, useEffect, useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Package,
  Eye,
  Edit,
  Plus,
  ZoomIn,
  ZoomOut,
  Settings,
  Grid3x3,
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'currentStock' | 'minimumStock' | 'unitPrice' | 'expiryDate';
type SortOrder = 'asc' | 'desc';

const InventoryGrid = () => {
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(3);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { toast } = useToast();

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Drugs dataset')
        .select('name, price_USD, stock')
        .limit(100);
      
      if (error) throw error;
      
      // Transform drug data into inventory format - generate random data once
      const inventoryItems = (data || []).map((drug, index) => {
        const currentStock = Math.floor(Math.random() * 200) + 10;
        const minimumStock = 50;
        
        return {
          id: String(index + 1),
          name: drug.name || 'Unknown Drug',
          generic: drug.name?.split(' ')[0] || 'Generic',
          manufacturer: 'Various',
          currentStock,
          minimumStock,
          expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          batchNumber: `BAT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          unitPrice: drug.price_USD || 0,
          status: currentStock < minimumStock ? 'critical_low' : 
                  currentStock < minimumStock * 1.5 ? 'low_stock' : 'in_stock',
          location: `${String.fromCharCode(65 + Math.floor(Math.random() * 3))}-${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 4) + 1}`
        };
      });
      
      setDrugs(inventoryItems);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast({
        title: "Error fetching inventory data",
        description: "Unable to load inventory information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical_low":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical Low</Badge>;
      case "low_stock":
        return <Badge className="bg-warning-light text-warning border-warning/20">Low Stock</Badge>;
      case "expiring_soon":
        return <Badge className="bg-warning-light text-warning border-warning/20">Expiring Soon</Badge>;
      case "in_stock":
        return <Badge className="bg-success-light text-success border-success/20">In Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical_low":
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "expiring_soon":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Package className="h-4 w-4 text-success" />;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2 inline opacity-40" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-2 inline text-primary" />
      : <ArrowDown className="h-4 w-4 ml-2 inline text-primary" />;
  };

  // Memoized filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    const filtered = drugs.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [drugs, searchTerm, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Monitor stock levels and manage your pharmacy inventory</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'grid' ? "default" : "outline"} 
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button 
            variant={viewMode === 'table' ? "default" : "outline"} 
            onClick={() => setViewMode('table')}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button variant={editMode ? "default" : "outline"} onClick={() => setEditMode(!editMode)}>
            <Settings className="h-4 w-4 mr-2" />
            {editMode ? "Exit Edit" : "Edit Mode"}
          </Button>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by drug name, generic, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="whitespace-nowrap">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>


      {/* Zoom Control - Only show in grid view */}
      {viewMode === 'grid' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => gridCols > 1 && setGridCols(gridCols - 1)}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground">Cards: {gridCols}</span>
                <Slider value={[gridCols]} onValueChange={(v) => setGridCols(v[0])} min={1} max={5} step={1} className="flex-1" />
              </div>
              <Button variant="outline" size="sm" onClick={() => gridCols < 5 && setGridCols(gridCols + 1)}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
          {loading ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading inventory...
              </CardContent>
            </Card>
          ) : filteredAndSortedItems.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                No items found matching "{searchTerm}"
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-all duration-200 border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground leading-tight">
                    {item.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{item.generic}</p>
                  <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  {getStatusBadge(item.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Stock</p>
                    <p className="font-semibold text-foreground">{item.currentStock} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Min. Stock</p>
                    <p className="font-semibold text-foreground">{item.minimumStock} units</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Expiry Date</p>
                    <p className="font-medium text-foreground">{item.expiryDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unit Price</p>
                    <p className="font-medium text-foreground">{formatCurrency(item.unitPrice)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Batch #</p>
                    <p className="font-medium text-foreground">{item.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{item.location}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2 border-t border-border">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 border-2 border-primary/20"
                    onClick={() => handleSort('name')}
                  >
                    <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                      Drug Name {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>Generic</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                    onClick={() => handleSort('currentStock')}
                  >
                    <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                      Current Stock {getSortIcon('currentStock')}
                    </Button>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                    onClick={() => handleSort('minimumStock')}
                  >
                    <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                      Min Stock {getSortIcon('minimumStock')}
                    </Button>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                    onClick={() => handleSort('expiryDate')}
                  >
                    <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                      Expiry Date {getSortIcon('expiryDate')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Batch Number</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                    onClick={() => handleSort('unitPrice')}
                  >
                    <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                      Unit Price {getSortIcon('unitPrice')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Location</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No items found matching "{searchTerm}"
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.generic}</TableCell>
                      <TableCell className="text-muted-foreground">{item.manufacturer}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-center">{item.currentStock}</TableCell>
                      <TableCell className="text-center">{item.minimumStock}</TableCell>
                      <TableCell className="text-center">{item.expiryDate}</TableCell>
                      <TableCell className="text-center">{item.batchNumber}</TableCell>
                      <TableCell className="text-center">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-center">{item.location}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryGrid;