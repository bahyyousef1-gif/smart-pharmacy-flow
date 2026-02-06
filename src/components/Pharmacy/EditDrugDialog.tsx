import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface EditDrugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drug: {
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
  };
  onSuccess: () => void;
}

const dosageForms = [
  "tablet",
  "capsule",
  "syrup",
  "ampoule",
  "injection",
  "cream",
  "ointment",
  "drops",
  "inhaler",
  "suppository",
  "powder",
  "gel",
  "patch",
  "spray",
];

const EditDrugDialog = ({ open, onOpenChange, drug, onSuccess }: EditDrugDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    generic_name: "",
    dosage_form: "tablet",
    strength: "",
    stock_quantity: "",
    expiry_date: "",
    supplier: "",
    purchase_price: "",
    selling_price: "",
    min_stock: "",
    max_stock: "",
  });

  useEffect(() => {
    if (drug) {
      setForm({
        name: drug.name || "",
        generic_name: drug.generic_name || "",
        dosage_form: drug.dosage_form || "tablet",
        strength: drug.strength || "",
        stock_quantity: drug.stock_quantity?.toString() || "",
        expiry_date: drug.expiry_date || "",
        supplier: drug.supplier || "",
        purchase_price: drug.purchase_price?.toString() || "",
        selling_price: drug.selling_price?.toString() || "",
        min_stock: drug.min_stock?.toString() || "10",
        max_stock: drug.max_stock?.toString() || "100",
      });
    }
  }, [drug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast({
        title: "Validation error",
        description: "Drug name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!drug.product_code) {
      toast({
        title: "Error",
        description: "Cannot update drug without product code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('Inventory_2023')
        .update({
          name: form.name.trim(),
          generic_name: form.generic_name.trim() || null,
          dosage_form: form.dosage_form,
          strength: form.strength.trim() || null,
          stock_quantity: parseFloat(form.stock_quantity) || 0,
          expiry_date: form.expiry_date || null,
          supplier: form.supplier.trim() || null,
          purchase_price: parseFloat(form.purchase_price) || 0,
          selling_price: parseFloat(form.selling_price) || 0,
          min_stock: parseInt(form.min_stock) || 10,
          max_stock: parseInt(form.max_stock) || 100,
        })
        .eq('product_code', drug.product_code)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Drug updated",
        description: `${form.name} has been updated.`,
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating drug:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update drug. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Drug</DialogTitle>
          <DialogDescription>
            Update the drug details in your inventory.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-name">Drug Name (Brand) *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Panadol Extra"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-generic_name">Generic Name</Label>
              <Input
                id="edit-generic_name"
                placeholder="e.g., Paracetamol + Caffeine"
                value={form.generic_name}
                onChange={(e) => setForm({ ...form, generic_name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Dosage Form</Label>
              <Select 
                value={form.dosage_form} 
                onValueChange={(v) => setForm({ ...form, dosage_form: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dosageForms.map((df) => (
                    <SelectItem key={df} value={df} className="capitalize">
                      {df}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-strength">Strength</Label>
              <Input
                id="edit-strength"
                placeholder="e.g., 500mg"
                value={form.strength}
                onChange={(e) => setForm({ ...form, strength: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-stock_quantity">Quantity in Stock</Label>
              <Input
                id="edit-stock_quantity"
                type="number"
                placeholder="0"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-expiry_date">Expiry Date</Label>
              <Input
                id="edit-expiry_date"
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                placeholder="e.g., Pharco Pharmaceuticals"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-purchase_price">Purchase Price (EGP)</Label>
              <Input
                id="edit-purchase_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-selling_price">Selling Price (EGP)</Label>
              <Input
                id="edit-selling_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.selling_price}
                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-min_stock">Min Stock Level</Label>
              <Input
                id="edit-min_stock"
                type="number"
                value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-max_stock">Max Stock Level</Label>
              <Input
                id="edit-max_stock"
                type="number"
                value={form.max_stock}
                onChange={(e) => setForm({ ...form, max_stock: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDrugDialog;
