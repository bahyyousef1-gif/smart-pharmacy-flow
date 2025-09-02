import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Pill, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const CoverageChecker = () => {
  const [drugName, setDrugName] = useState("");
  const [coverageResult, setCoverageResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        drugName: drugName,
        covered: Math.random() > 0.3, // 70% chance of being covered
        copayAmount: 25.50,
        copayPercentage: 15,
        priorAuth: Math.random() > 0.8,
        alternatives: [
          { name: "Generic Metformin", copay: 10.00, covered: true },
          { name: "Metformin ER 500mg", copay: 18.50, covered: true },
          { name: "Glucophage XR", copay: 35.00, covered: false }
        ]
      };
      setCoverageResult(mockResult);
      setIsChecking(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Drug Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2 text-primary" />
            Drug Coverage Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter drug name or NDC number..."
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleCheck}
              disabled={!drugName || isChecking}
              className="min-w-[120px]"
            >
              {isChecking ? "Checking..." : "Check Coverage"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Results */}
      {coverageResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Coverage Results</span>
              <Badge 
                className={coverageResult.covered 
                  ? "bg-success-light text-success border-success/20" 
                  : "bg-destructive-light text-destructive border-destructive/20"
                }
              >
                {coverageResult.covered ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Covered
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Covered
                  </>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{coverageResult.drugName}</h4>
                {coverageResult.covered ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Patient Co-pay: <span className="font-semibold text-primary">${coverageResult.copayAmount}</span>
                    </p>
                    {coverageResult.priorAuth && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Prior authorization required for this medication.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert className="mt-2">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      This medication is not covered under the current plan.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Alternative Medications */}
              {coverageResult.alternatives.length > 0 && (
                <div className="border-t pt-4">
                  <h5 className="font-medium mb-3">Alternative Medications</h5>
                  <div className="space-y-2">
                    {coverageResult.alternatives.map((alt: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{alt.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Co-pay: ${alt.copay.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={alt.covered ? "default" : "outline"}
                            className={alt.covered 
                              ? "bg-success-light text-success border-success/20" 
                              : "bg-warning-light text-warning border-warning/20"
                            }
                          >
                            {alt.covered ? "Covered" : "Not Covered"}
                          </Badge>
                          {alt.covered && (
                            <Button size="sm" variant="outline">
                              Select
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoverageChecker;