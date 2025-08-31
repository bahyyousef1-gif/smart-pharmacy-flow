import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Package,
  Eye,
  Edit,
  Plus
} from "lucide-react";

const InventoryGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const inventoryItems = [
    {
      id: "1",
      name: "Amoxicillin 500mg",
      generic: "Amoxicillin",
      manufacturer: "Pfizer",
      currentStock: 48,
      minimumStock: 50,
      expiryDate: "2024-12-15",
      batchNumber: "AMX2024-001",
      unitPrice: 2.45,
      status: "low_stock",
      location: "A-1-3"
    },
    {
      id: "2", 
      name: "Metformin 1000mg",
      generic: "Metformin HCL",
      manufacturer: "Teva",
      currentStock: 125,
      minimumStock: 75,
      expiryDate: "2025-08-22",
      batchNumber: "MET2024-015",
      unitPrice: 1.20,
      status: "in_stock",
      location: "B-2-1"
    },
    {
      id: "3",
      name: "Lisinopril 10mg", 
      generic: "Lisinopril",
      manufacturer: "Mylan",
      currentStock: 22,
      minimumStock: 40,
      expiryDate: "2024-10-30",
      batchNumber: "LIS2024-007",
      unitPrice: 0.85,
      status: "expiring_soon",
      location: "C-1-2"
    },
    {
      id: "4",
      name: "Atorvastatin 20mg",
      generic: "Atorvastatin Calcium", 
      manufacturer: "Lipitor",
      currentStock: 89,
      minimumStock: 60,
      expiryDate: "2025-03-18",
      batchNumber: "ATO2024-012",
      unitPrice: 3.20,
      status: "in_stock",
      location: "A-3-1"
    },
    {
      id: "5",
      name: "Amlodipine 5mg",
      generic: "Amlodipine Besylate",
      manufacturer: "Sandoz",
      currentStock: 5,
      minimumStock: 30,
      expiryDate: "2025-01-12",
      batchNumber: "AML2024-003",
      unitPrice: 1.75,
      status: "critical_low",
      location: "B-1-4"
    },
    {
      id: "6",
      name: "Omeprazole 20mg",
      generic: "Omeprazole",
      manufacturer: "Dr. Reddy's",
      currentStock: 67,
      minimumStock: 45,
      expiryDate: "2025-06-08",
      batchNumber: "OME2024-018",
      unitPrice: 2.10,
      status: "in_stock",
      location: "C-2-3"
    }
  ];

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

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Monitor stock levels and manage your pharmacy inventory</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
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

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
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
                    <p className="font-medium text-foreground">${item.unitPrice}</p>
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
        ))}
      </div>
    </div>
  );
};

export default InventoryGrid;