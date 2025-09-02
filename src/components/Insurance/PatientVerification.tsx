import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, CreditCard, CheckCircle, XCircle } from "lucide-react";

const PatientVerification = () => {
  const [searchId, setSearchId] = useState("");
  const [patientData, setPatientData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setPatientData({
        name: "Sarah Johnson",
        insuranceId: "INS-789456123",
        nationalId: "ID-456789123",
        insurer: "BlueCross Health",
        eligibility: "Active",
        copayPercentage: 15,
        deductibleMet: true,
        coverageType: "Premium Plan",
        validUntil: "2024-12-31"
      });
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 text-primary" />
            Patient Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter Insurance ID or National ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={!searchId || isSearching}
              className="min-w-[100px]"
            >
              {isSearching ? "Searching..." : "Verify"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Details */}
      {patientData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                  <p className="text-lg font-semibold">{patientData.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Insurance ID</label>
                  <p className="font-mono">{patientData.insuranceId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">National ID</label>
                  <p className="font-mono">{patientData.nationalId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Coverage Type</label>
                  <p>{patientData.coverageType}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Insurance Provider</label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <p className="font-medium">{patientData.insurer}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Eligibility Status</label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <Badge className="bg-success-light text-success border-success/20">
                      {patientData.eligibility}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Co-pay Percentage</label>
                  <p className="text-2xl font-bold text-primary">{patientData.copayPercentage}%</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valid Until</label>
                  <p>{patientData.validUntil}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientVerification;