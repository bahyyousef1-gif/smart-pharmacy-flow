import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ClipboardCheck,
  Calendar,
  Hash,
  Package,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  duplicatesRemoved: number;
  missingValuesHandled: number;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  uniqueProducts: number;
  stockoutDaysDetected: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: "no_data" | "invalid_dates" | "missing_required" | "no_time_series";
  message: string;
  details?: string;
}

export interface ValidationWarning {
  type: "missing_values" | "duplicates" | "stockouts" | "short_history" | "gaps";
  message: string;
  count?: number;
}

interface DataValidationProps {
  isValidating: boolean;
  validationResult: ValidationResult | null;
  onProceed: () => void;
  onRetry: () => void;
}

export const DataValidation = ({
  isValidating,
  validationResult,
  onProceed,
  onRetry,
}: DataValidationProps) => {
  if (isValidating) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Validating & Cleaning Data</p>
              <p className="text-sm text-muted-foreground">
                Checking dates, removing duplicates, handling missing values...
              </p>
            </div>
            <Progress value={66} className="w-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult) return null;

  const { isValid, errors, warnings } = validationResult;

  return (
    <Card className={cn(!isValid && "border-destructive/50")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Data Validation</CardTitle>
          </div>
          {isValid ? (
            <Badge className="bg-success text-success-foreground gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Ready for Forecasting
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Validation Failed
            </Badge>
          )}
        </div>
        <CardDescription>
          {isValid
            ? "Your data has been validated and cleaned. Ready to generate forecasts."
            : "There are issues with your data that need to be addressed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Hash className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Valid Rows</p>
              <p className="font-semibold">
                {validationResult.validRows.toLocaleString()}
                <span className="text-xs text-muted-foreground ml-1">
                  / {validationResult.totalRows.toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Package className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Unique Products</p>
              <p className="font-semibold">{validationResult.uniqueProducts.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Date Range</p>
              <p className="font-semibold text-sm">
                {validationResult.dateRangeStart && validationResult.dateRangeEnd
                  ? `${validationResult.dateRangeStart} - ${validationResult.dateRangeEnd}`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-5 w-5 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Stockout Days</p>
              <p className="font-semibold">{validationResult.stockoutDaysDetected}</p>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Errors ({errors.length})
            </h4>
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">{error.message}</p>
                  {error.details && (
                    <p className="text-sm text-muted-foreground mt-1">{error.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({warnings.length})
            </h4>
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
              >
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {warning.message}
                    {warning.count !== undefined && (
                      <Badge variant="outline" className="ml-2">
                        {warning.count}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cleaning Summary */}
        {(validationResult.duplicatesRemoved > 0 || validationResult.missingValuesHandled > 0) && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <h4 className="text-sm font-semibold text-success flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              Data Cleaned Automatically
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {validationResult.duplicatesRemoved > 0 && (
                <li>• Removed {validationResult.duplicatesRemoved} duplicate rows</li>
              )}
              {validationResult.missingValuesHandled > 0 && (
                <li>• Handled {validationResult.missingValuesHandled} missing values</li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {isValid ? (
            <Button onClick={onProceed} className="flex-1 gap-2" size="lg">
              <TrendingUp className="h-4 w-4" />
              Generate AI Forecast
            </Button>
          ) : (
            <Button onClick={onRetry} variant="outline" className="flex-1 gap-2" size="lg">
              <AlertCircle className="h-4 w-4" />
              Upload Different File
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataValidation;
