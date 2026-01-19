import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InventoryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File appears to be empty or has no data rows');
      }

      // Parse CSV (assuming format: name,product_code,stock_quantity)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        
        // Map to Inventory_2023 format
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const codeIdx = headers.findIndex(h => h.includes('code') || h.includes('product'));
        const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('quantity'));
        
        return {
          name: nameIdx >= 0 ? values[nameIdx] || null : null,
          product_code: codeIdx >= 0 ? (values[codeIdx] ? parseInt(values[codeIdx]) : null) : null,
          stock_quantity: stockIdx >= 0 ? (values[stockIdx] ? parseFloat(values[stockIdx]) : null) : null
        };
      }).filter(row => row.name); // Filter out rows without names

      // Insert data into Supabase
      const { error } = await supabase
        .from('Inventory_2023')
        .insert(data);

      if (error) throw error;

      setUploadStatus('success');
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${data.length} items`,
      });

      // Reset file input
      event.target.value = '';
      
      // Reload the page to show updated data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload inventory data",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Upload Inventory Data
        </CardTitle>
        <CardDescription>
          Import pharmacy inventory from CSV or Excel file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                CSV or Excel file (max 10MB)
              </p>
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="inventory-upload"
            />
            <label htmlFor="inventory-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  {uploading ? "Uploading..." : "Select File"}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg text-success">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Data uploaded successfully!</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Upload failed. Please try again.</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Expected CSV format:</p>
          <code className="block bg-muted p-2 rounded text-xs">
            name,product_code,stock_quantity
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryUpload;
