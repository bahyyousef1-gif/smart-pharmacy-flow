import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowRight, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnMappingConfig {
  date: string | null;
  productSku: string | null;
  productName?: string | null;
  quantitySold: string | null;
  stock?: string | null;
  price?: string | null;
  supplier?: string | null;
}

interface ColumnMappingProps {
  columns: string[];
  mapping: ColumnMappingConfig;
  onMappingChange: (mapping: ColumnMappingConfig) => void;
  onConfirm: () => void;
}

const REQUIRED_FIELDS = [
  { key: "date", label: "Date", description: "Transaction or sale date", patterns: ["date", "time", "day", "fecha"] },
  { key: "productSku", label: "Product Code / SKU", description: "Product identifier or code number", patterns: ["code", "sku", "item_code", "product_code", "codigo"] },
  { key: "quantitySold", label: "Quantity Sold", description: "Units sold or consumed", patterns: ["qty", "quantity", "sales", "sold", "units", "amount", "net"] },
];

const OPTIONAL_FIELDS = [
  { key: "productName", label: "Product Name", description: "Product or item name", patterns: ["name", "item_name", "product_name", "drug", "medicine", "producto", "nombre"] },
  { key: "stock", label: "Stock Level", description: "Current inventory quantity", patterns: ["stock", "inventory", "available", "on_hand"] },
  { key: "price", label: "Unit Price", description: "Price per unit", patterns: ["price", "cost", "unit_price", "precio"] },
  { key: "supplier", label: "Supplier", description: "Vendor or supplier name", patterns: ["supplier", "vendor", "distributor", "proveedor"] },
];

export const ColumnMapping = ({
  columns,
  mapping,
  onMappingChange,
  onConfirm,
}: ColumnMappingProps) => {
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-detect columns on mount
  useEffect(() => {
    if (!autoDetected && columns.length > 0) {
      const detectedMapping: ColumnMappingConfig = { ...mapping };
      let hasChanges = false;

      [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].forEach((field) => {
      const fieldKey = field.key as keyof ColumnMappingConfig;
      if (!detectedMapping[fieldKey]) {
        for (const col of columns) {
          const colLower = col.toLowerCase().replace(/[_\s-]/g, "");
          const matches = field.patterns.some((pattern) => colLower.includes(pattern));
          if (matches) {
            detectedMapping[fieldKey] = col;
            hasChanges = true;
              break;
            }
          }
        }
      });

      if (hasChanges) {
        onMappingChange(detectedMapping);
      }
      setAutoDetected(true);
    }
  }, [columns, mapping, onMappingChange, autoDetected]);

  const handleFieldChange = (fieldKey: keyof ColumnMappingConfig, value: string) => {
    const newMapping = { ...mapping };
    newMapping[fieldKey] = value === "__none__" ? null : value;
    onMappingChange(newMapping);
  };

  const getUsedColumns = (): string[] => {
    return Object.values(mapping).filter((v): v is string => v !== null);
  };

  const getAvailableColumns = (currentField: string): string[] => {
    const used = getUsedColumns();
    const currentValue = mapping[currentField as keyof ColumnMappingConfig];
    return columns.filter((col) => !used.includes(col) || col === currentValue);
  };

  const isRequiredMappingComplete = (): boolean => {
    return REQUIRED_FIELDS.every(
      (field) => mapping[field.key as keyof ColumnMappingConfig] !== null
    );
  };

  const renderFieldRow = (field: typeof REQUIRED_FIELDS[0], isRequired: boolean) => {
    const fieldKey = field.key as keyof ColumnMappingConfig;
    const currentValue = mapping[fieldKey];
    const available = getAvailableColumns(field.key);
    const isMapped = currentValue !== null;

    return (
      <div
        key={field.key}
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg border transition-colors",
          isMapped ? "bg-success/5 border-success/30" : isRequired ? "bg-destructive/5 border-destructive/30" : "bg-muted/50"
        )}
      >
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <span className="font-medium">{field.label}</span>
            {isRequired ? (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Optional</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{field.description}</p>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

        <div className="w-[220px]">
          <Select
            value={currentValue || "__none__"}
            onValueChange={(value) => handleFieldChange(fieldKey, value)}
          >
            <SelectTrigger className={cn(!isMapped && isRequired && "border-destructive")}>
              <SelectValue placeholder="Select column..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">
                <span className="text-muted-foreground">-- Not mapped --</span>
              </SelectItem>
              {available.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-6">
          {isMapped ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : isRequired ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : null}
        </div>
      </div>
    );
  };

  const requiredComplete = isRequiredMappingComplete();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Column Mapping</CardTitle>
          </div>
          {autoDetected && (
            <Badge variant="outline" className="gap-1">
              <Wand2 className="h-3 w-3" />
              Auto-detected
            </Badge>
          )}
        </div>
        <CardDescription>
          Map your file columns to the required data fields. Auto-detection has been applied based on column names.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Fields */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Required Fields
          </h4>
          {REQUIRED_FIELDS.map((field) => renderFieldRow(field, true))}
        </div>

        {/* Optional Fields */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Optional Fields
          </h4>
          {OPTIONAL_FIELDS.map((field) => renderFieldRow(field, false))}
        </div>

        {/* Confirm Button */}
        <div className="pt-4 border-t">
          {!requiredComplete && (
            <div className="flex items-center gap-2 text-sm text-destructive mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>Please map all required fields before continuing</span>
            </div>
          )}
          <Button
            onClick={onConfirm}
            disabled={!requiredComplete}
            className="w-full gap-2"
            size="lg"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Mapping & Validate Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnMapping;
