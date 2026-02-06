import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Package,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Pencil
} from "lucide-react";
import AddDrugDialog from "./AddDrugDialog";
import EditDrugDialog from "./EditDrugDialog";

interface InventoryItem {
  id: string;
  name: string;
  generic_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  stock_quantity: number;
  expiry_date: string | null;
  supplier: string | null;
  purchase_price: number;
  selling_price: number;
  min_stock: number;
  max_stock: number;
  product_code: number | null;
  status: 'normal' | 'low_stock' | 'near_expiry' | 'critical';
}

type SortField = 'name' | 'stock_quantity' | 'expiry_date' | 'selling_price';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'low_stock' | 'near_expiry';

const PharmacyInventory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDrugs();
    }
  }, [user]);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Inventory_2023')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) throw error;
      
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const inventoryItems: InventoryItem[] = (data || []).map((item: any) => {
        const stockQty = item.stock_quantity || 0;
        const minStock = item.min_stock || 10;
        const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
        
        let status: InventoryItem['status'] = 'normal';
        if (stockQty <= 3) {
          status = 'critical';
        } else if (stockQty <= minStock) {
          status = 'low_stock';
        } else if (expiryDate && expiryDate <= thirtyDaysFromNow) {
          status = 'near_expiry';
        }
        
        return {
          id: item.product_code?.toString() || Math.random().toString(),
          name: item.name || 'Unknown',
          generic_name: item.generic_name,
          dosage_form: item.dosage_form || 'tablet',
          strength: item.strength,
          stock_quantity: stockQty,
          expiry_date: item.expiry_date,
          supplier: item.supplier,
          purchase_price: item.purchase_price || 0,
          selling_price: item.selling_price || 0,
          min_stock: minStock,
          max_stock: item.max_stock || 100,
          product_code: item.product_code,
          status,
        };
      });
      
      setDrugs(inventoryItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error loading inventory",
        description: "Unable to load inventory data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productCode: number | null) => {
    if (!productCode) return;
    
    try {
      const { error } = await supabase
        .from('Inventory_2023')
        .delete()
        .eq('product_code', productCode)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Drug deleted",
        description: "The item has been removed from inventory.",
      });
      fetchDrugs();
    } catch (error) {
      console.error('Error deleting drug:', error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case "critical":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
      case "low_stock":
        return <Badge className="bg-warning-light text-warning border-warning/20">Low Stock</Badge>;
      case "near_expiry":
        return <Badge className="bg-warning-light text-warning border-warning/20">Near Expiry</Badge>;
      default:
        return <Badge className="bg-success-light text-success border-success/20">Normal</Badge>;
    }
  };

  const getRowClass = (status: InventoryItem['status']) => {
    switch (status) {
      case "critical":
        return "bg-destructive/5 hover:bg-destructive/10";
      case "low_stock":
        return "bg-warning/5 hover:bg-warning/10";
      case "near_expiry":
        return "bg-warning/5 hover:bg-warning/10";
      default:
        return "hover:bg-muted/50";
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
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 text-primary" />
      : <ArrowDown className="h-4 w-4 ml-1 text-primary" />;
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = drugs.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.generic_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.supplier?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Apply filter
    if (filterType === 'low_stock') {
      filtered = filtered.filter(item => item.status === 'low_stock' || item.status === 'critical');
    } else if (filterType === 'near_expiry') {
      filtered = filtered.filter(item => item.status === 'near_expiry');
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
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
  }, [drugs, searchTerm, sortField, sortOrder, filterType]);

  const stats = useMemo(() => ({
    total: drugs.length,
    lowStock: drugs.filter(d => d.status === 'low_stock' || d.status === 'critical').length,
    nearExpiry: drugs.filter(d => d.status === 'near_expiry').length,
  }), [drugs]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Near Expiry</p>
              <p className="text-2xl font-bold">{stats.nearExpiry}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search, Filter, Add */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by drug name, generic name, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="near_expiry">Near Expiry</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddDialogOpen(true)} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Add Drug
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Drug Name {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead>Dosage Form</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-center"
                  onClick={() => handleSort('stock_quantity')}
                >
                  <div className="flex items-center justify-center">
                    Quantity {getSortIcon('stock_quantity')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('expiry_date')}
                >
                  <div className="flex items-center">
                    Expiry Date {getSortIcon('expiry_date')}
                  </div>
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('selling_price')}
                >
                  <div className="flex items-center justify-end">
                    Selling Price {getSortIcon('selling_price')}
                  </div>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {drugs.length === 0 
                      ? "No drugs in inventory. Click 'Add Drug' to get started."
                      : `No items found matching "${searchTerm}"`
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedItems.map((item) => (
                  <TableRow key={item.id} className={getRowClass(item.status)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.generic_name && (
                          <p className="text-sm text-muted-foreground">{item.generic_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{item.dosage_form}</TableCell>
                    <TableCell>{item.strength || '-'}</TableCell>
                    <TableCell className="text-center font-medium">{item.stock_quantity}</TableCell>
                    <TableCell>{item.expiry_date || '-'}</TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell className="text-right">EGP {item.purchase_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">EGP {item.selling_price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingDrug(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.product_code)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Dialogs */}
      <AddDrugDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchDrugs}
      />
      
      {editingDrug && (
        <EditDrugDialog
          open={!!editingDrug}
          onOpenChange={(open) => !open && setEditingDrug(null)}
          drug={editingDrug}
          onSuccess={fetchDrugs}
        />
      )}
    </div>
  );
};

export default PharmacyInventory;
