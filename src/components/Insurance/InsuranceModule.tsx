import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, XCircle } from "lucide-react";

import PatientVerification from "./PatientVerification";
import CoverageChecker from "./CoverageChecker";
import ClaimSubmission from "./ClaimSubmission";
import ClaimsDashboard from "./ClaimsDashboard";

const InsuranceModule = () => {
  // Mock error alerts
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "duplicate",
      message: "Duplicate claim detected: CLM-2024003 for patient Emma Davis",
      severity: "warning"
    },
    {
      id: 2,
      type: "coverage",
      message: "Coverage limit exceeded for patient ID INS-123456 (annual limit: $5,000)",
      severity: "error"
    }
  ]);

  const dismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Insurance Management</h1>
          <p className="text-muted-foreground">Manage patient verification, coverage, and claims processing.</p>
        </div>
      </div>

      {/* Error Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Alert key={alert.id} className={alert.severity === 'error' ? 'border-destructive' : 'border-warning'}>
              {alert.severity === 'error' ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="text-xs hover:underline ml-4"
                >
                  Dismiss
                </button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}


      {/* Insurance Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Claims Dashboard</TabsTrigger>
          <TabsTrigger value="verification">Patient Verification</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Checker</TabsTrigger>
          <TabsTrigger value="submission">Submit Claim</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <ClaimsDashboard />
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
          <PatientVerification />
        </TabsContent>

        <TabsContent value="coverage" className="mt-6">
          <CoverageChecker />
        </TabsContent>

        <TabsContent value="submission" className="mt-6">
          <ClaimSubmission />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceModule;