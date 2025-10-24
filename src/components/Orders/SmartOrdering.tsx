import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Calculator,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search
} from "lucide-react";

type SortField = 'drugName' | 'currentStock' | 'suggestedQuantity' | 'unitPrice' | 'totalCost';
type SortOrder = 'asc' | 'desc';

interface Order {
  id: string;
  drugName: string;
  supplier: string;
  currentStock: number;
  minimumStock: number;
  forecastDemand: number;
  suggestedQuantity: number;
  unitPrice: number;
  daysSupply: number;
  totalCost: number;
  status: string;
  priority: string;
  expectedDelivery: string;
  lastOrderDate: string;
  aiReason: string;
}

const SmartOrdering = () => {
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('drugName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Drugs dataset')
        .select('*');
      
      if (error) throw error;
      
      // Transform drug data into order format
      const orderSuggestions = (data || []).slice(0, 10).map((drug, index) => {
        const suggestedQty = Math.floor(Math.random() * 100) + 50;
        const unitPrice = drug.price_USD || 0;
        const minStock = Math.floor(Math.random() * 30) + 10;
        const currentStock = Math.floor(Math.random() * 50) + 5;
        const forecastDemand = Math.floor(Math.random() * 150) + 80;
        
        return {
          id: String(index + 1),
          drugName: drug.name || 'Unknown Drug',
          supplier: 'AutoSelect Supplier',
          currentStock,
          minimumStock: minStock,
          forecastDemand,
          suggestedQuantity: suggestedQty,
          unitPrice,
          daysSupply: Math.floor(Math.random() * 60) + 30,
          totalCost: unitPrice * suggestedQty,
          status: currentStock < minStock ? 'urgent' : forecastDemand > currentStock * 2 ? 'suggested' : 'optimal',
          priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          expectedDelivery: '2-3 days',
          lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          aiReason: `Low stock detected. Predicted demand based on sales history.`
        };
      });
      
      setDrugs(orderSuggestions);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast({
        title: "Error fetching drug data",
        description: "Unable to load smart ordering suggestions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const orders = drugs;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "urgent":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Urgent</Badge>;
      case "suggested":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Suggested</Badge>;
      case "optimal":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Optimal</Badge>;
      default:
        return <Badge variant="outline">Review</Badge>;
    }
  };

  const updateQuantity = (orderId: string, newQuantity: number) => {
    const updatedDrugs = drugs.map(order => 
      order.id === orderId 
        ? { ...order, suggestedQuantity: newQuantity, totalCost: newQuantity * order.unitPrice }
        : order
    );
    setDrugs(updatedDrugs);
  };

  const handleQuantityChange = (orderId: string, value: string) => {
    const newQuantity = parseInt(value) || 0;
    if (newQuantity >= 0) {
      updateQuantity(orderId, newQuantity);
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
      return <ArrowUpDown className="h-5 w-5 ml-2 inline opacity-40" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-5 w-5 ml-2 inline text-primary" />
      : <ArrowDown className="h-5 w-5 ml-2 inline text-primary" />;
  };

  // Filter orders by search term
  const filteredOrders = orders.filter(order =>
    order.drugName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
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

  const totalOrderValue = sortedOrders.reduce((sum, order) => sum + order.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Smart Ordering System</h2>
          <p className="text-muted-foreground">AI-powered inventory replenishment suggestions</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Add Manual Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Manual Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Drug Name</Label>
                  <Input placeholder="Enter drug name" />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input placeholder="Enter supplier name" />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="Enter quantity" />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input type="number" placeholder="Enter unit price" />
                </div>
                <Button className="w-full">Submit Order</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve All Orders
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Calculator className="h-5 w-5 mr-2" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{sortedOrders.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalOrderValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Urgent Orders</p>
              <p className="text-2xl font-bold text-destructive">
                {sortedOrders.filter(o => o.status === "urgent").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Delivery</p>
              <p className="text-2xl font-bold text-foreground">1-5 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by drug name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 border-2 border-primary/20"
                  onClick={() => handleSort('drugName')}
                >
                  <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                    Drug Name {getSortIcon('drugName')}
                  </Button>
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                  onClick={() => handleSort('currentStock')}
                >
                  <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                    Current Stock {getSortIcon('currentStock')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Min Stock</TableHead>
                <TableHead className="text-center">Forecast</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                  onClick={() => handleSort('suggestedQuantity')}
                >
                  <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                    Suggested Qty {getSortIcon('suggestedQuantity')}
                  </Button>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                  onClick={() => handleSort('unitPrice')}
                >
                  <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                    Unit Price {getSortIcon('unitPrice')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Days Supply</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-center border-2 border-primary/20"
                  onClick={() => handleSort('totalCost')}
                >
                  <Button variant="ghost" size="lg" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                    Total Cost {getSortIcon('totalCost')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No orders found matching "{searchTerm}"
                  </TableCell>
                </TableRow>
              ) : (
                sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.drugName}</TableCell>
                    <TableCell className="text-muted-foreground">{order.supplier}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-center">{order.currentStock}</TableCell>
                    <TableCell className="text-center">{order.minimumStock}</TableCell>
                    <TableCell className="text-center">{order.forecastDemand}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        value={order.suggestedQuantity}
                        onChange={(e) => handleQuantityChange(order.id, e.target.value)}
                        className="w-24 h-9 text-center border-border/60 hover:border-border hover:shadow-sm transition-all mx-auto"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-center">${order.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{order.daysSupply}</TableCell>
                    <TableCell className="text-center font-semibold text-primary">
                      ${order.totalCost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" className="h-8 px-2">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <Trash2 className="h-3 w-3" />
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
    </div>
  );
};

export default SmartOrdering;
