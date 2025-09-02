import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ClaimSubmission = () => {
  const [formData, setFormData] = useState({
    claimId: `CLM-${Date.now()}`,
    patientName: "Sarah Johnson",
    insuranceId: "INS-789456123",
    drugName: "",
    ndc: "",
    quantity: "",
    prescriptionDate: "",
    pharmacyPrice: "",
    insuranceCoverage: "",
    copayAmount: "",
    prescriptionNumber: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
      toast({
        title: "Claim Submitted Successfully",
        description: `Claim ID: ${formData.claimId} has been submitted for processing.`
      });
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">Claim Submitted Successfully!</h3>
          <p className="text-muted-foreground mb-4">
            Claim ID: <span className="font-mono font-semibold">{formData.claimId}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Your claim has been submitted for processing. You will receive updates on the claim status.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Submit Another Claim
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Insurance Claim Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Claim Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="claimId">Claim ID</Label>
                <Input
                  id="claimId"
                  value={formData.claimId}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prescriptionNumber">Prescription Number</Label>
                <Input
                  id="prescriptionNumber"
                  value={formData.prescriptionNumber}
                  onChange={(e) => handleInputChange("prescriptionNumber", e.target.value)}
                  placeholder="RX-123456"
                />
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange("patientName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceId">Insurance ID</Label>
                <Input
                  id="insuranceId"
                  value={formData.insuranceId}
                  onChange={(e) => handleInputChange("insuranceId", e.target.value)}
                />
              </div>
            </div>

            {/* Drug Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="drugName">Drug Name</Label>
                <Input
                  id="drugName"
                  value={formData.drugName}
                  onChange={(e) => handleInputChange("drugName", e.target.value)}
                  placeholder="Metformin 1000mg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ndc">NDC Number</Label>
                <Input
                  id="ndc"
                  value={formData.ndc}
                  onChange={(e) => handleInputChange("ndc", e.target.value)}
                  placeholder="12345-678-90"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  placeholder="30"
                  required
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pharmacyPrice">Pharmacy Price ($)</Label>
                <Input
                  id="pharmacyPrice"
                  type="number"
                  step="0.01"
                  value={formData.pharmacyPrice}
                  onChange={(e) => handleInputChange("pharmacyPrice", e.target.value)}
                  placeholder="45.99"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceCoverage">Insurance Coverage ($)</Label>
                <Input
                  id="insuranceCoverage"
                  type="number"
                  step="0.01"
                  value={formData.insuranceCoverage}
                  onChange={(e) => handleInputChange("insuranceCoverage", e.target.value)}
                  placeholder="38.50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="copayAmount">Patient Co-pay ($)</Label>
                <Input
                  id="copayAmount"
                  type="number"
                  step="0.01"
                  value={formData.copayAmount}
                  onChange={(e) => handleInputChange("copayAmount", e.target.value)}
                  placeholder="7.49"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescriptionDate">Prescription Date</Label>
              <Input
                id="prescriptionDate"
                type="date"
                value={formData.prescriptionDate}
                onChange={(e) => handleInputChange("prescriptionDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special instructions or notes..."
                rows={3}
              />
            </div>

            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Please ensure all prescription details are accurate before submission. 
                Claims with errors may be rejected or delayed.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting Claim..." : "Submit Claim"}
              </Button>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimSubmission;