import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

interface SalesRecord {
  Date: string;
  Item_Code: number;
  Item_Name: string;
  Unit_Price: number;
  Net_Daily_Sales: number;
  Daily_Revenue: number;
}

interface SalesHistoryImportProps {
  onImportComplete?: () => void;
}

const SalesHistoryImport = ({ onImportComplete }: SalesHistoryImportProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [recordCount, setRecordCount] = useState(0);
  const { toast } = useToast();

  const parseExcelFile = async (file: File): Promise<SalesRecord[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const records: SalesRecord[] = jsonData.map((row: any) => {
            // Parse date - handle Excel serial dates
            let dateStr: string;
            const dateValue = row['Date'];
            
            if (typeof dateValue === 'number') {
              // Excel serial date
              const excelDate = XLSX.SSF.parse_date_code(dateValue);
              dateStr = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
            } else if (dateValue) {
              const parsed = new Date(dateValue);
              dateStr = parsed.toISOString().split('T')[0];
            } else {
              dateStr = new Date().toISOString().split('T')[0];
            }

            return {
              Date: dateStr,
              Item_Code: parseInt(row['Item_Code']) || 0,
              Item_Name: row['Item_Name'] || 'Unknown',
              Unit_Price: parseFloat(row['Unit_Price']) || 0,
              Net_Daily_Sales: parseFloat(row['Net_Daily_Sales']) || 0,
              Daily_Revenue: parseFloat(row['Daily_Revenue']) || 0,
            };
          }).filter(record => record.Item_Name && record.Item_Name !== 'Unknown');

          resolve(records);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const records = await parseExcelFile(file);
      
      if (records.length === 0) {
        throw new Error("No valid records found in the file");
      }

      // Upload in batches of 500 to avoid timeout
      const batchSize = 500;
      let totalUploaded = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        const { error } = await supabase.from('sales_history_2023').insert(batch);
        
        if (error) {
          throw error;
        }
        
        totalUploaded += batch.length;
      }

      setRecordCount(totalUploaded);
      setUploadStatus('success');
      toast({
        title: "Import successful!",
        description: `${totalUploaded.toLocaleString()} transaction records imported for AI forecasting`,
      });
      
      // Notify parent component
      onImportComplete?.();

    } catch (error: any) {
      console.error('Import error:', error);
      setUploadStatus('error');
      toast({
        title: "Import failed",
        description: error.message || "Failed to import transaction data",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Import Transaction History
        </CardTitle>
        <CardDescription>
          Upload your pharmacy transaction data (Excel/CSV) to power AI demand forecasting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="sales-history-upload"
              disabled={uploading}
            />
            <label htmlFor="sales-history-upload" className="cursor-pointer">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Importing transaction data...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload transaction history</span>
                  <span className="text-xs text-muted-foreground">Excel (.xlsx, .xls) or CSV files supported</span>
                </div>
              )}
            </label>
          </div>

          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{recordCount.toLocaleString()} records imported successfully!</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Import failed. Please check your file format.</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Expected columns:</p>
            <p>Date, Item_Code, Item_Name, Unit_Price, Net_Daily_Sales, Daily_Revenue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesHistoryImport;
