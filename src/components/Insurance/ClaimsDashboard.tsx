import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  FileText, 
  Download,
  Filter,
  Search
} from "lucide-react";

const ClaimsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const claimStats = {
    submitted: 156,
    pending: 42,
    approved: 98,
    rejected: 16,
    totalAmount: 45678.90,
    reimbursed: 38245.50
  };

  const mockClaims = [
    {
      id: "CLM-2024001",
      patient: "Sarah Johnson",
      insurer: "BlueCross Health",
      drug: "Metformin 1000mg",
      amount: 45.99,
      copay: 7.50,
      status: "approved",
      submittedDate: "2024-01-15",
      progress: 100
    },
    {
      id: "CLM-2024002",
      patient: "Michael Chen",
      insurer: "Aetna Insurance",
      drug: "Lisinopril 10mg",
      amount: 32.50,
      copay: 5.00,
      status: "pending",
      submittedDate: "2024-01-14",
      progress: 60
    },
    {
      id: "CLM-2024003",
      patient: "Emma Davis",
      insurer: "Cigna Health",
      drug: "Amlodipine 5mg",
      amount: 28.75,
      copay: 4.25,
      status: "rejected",
      submittedDate: "2024-01-13",
      progress: 100
    },
    {
      id: "CLM-2024004",
      patient: "James Wilson",
      insurer: "BlueCross Health",
      drug: "Atorvastatin 20mg",
      amount: 89.99,
      copay: 15.00,
      status: "submitted",
      submittedDate: "2024-01-12",
      progress: 25
    },
    {
      id: "CLM-2024005",
      patient: "Lisa Anderson",
      insurer: "United Healthcare",
      drug: "Omeprazole 40mg",
      amount: 67.50,
      copay: 10.50,
      status: "pending",
      submittedDate: "2024-01-11",
      progress: 75
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "bg-success-light text-success border-success/20",
      pending: "bg-warning-light text-warning border-warning/20",
      rejected: "bg-destructive-light text-destructive border-destructive/20",
      submitted: "bg-accent-light text-accent border-accent/20"
    };
    
    const icons = {
      approved: CheckCircle,
      pending: Clock,
      rejected: XCircle,
      submitted: FileText
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-destructive';
      case 'pending': return 'bg-warning';
      default: return 'bg-accent';
    }
  };

  const filteredClaims = mockClaims.filter(claim => {
    const matchesSearch = 
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.drug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submitted</p>
                <p className="text-2xl font-bold text-foreground">{claimStats.submitted}</p>
              </div>
              <FileText className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{claimStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-success">{claimStats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reimbursed</p>
                <p className="text-2xl font-bold text-primary">${claimStats.reimbursed.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Claims Management</CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Insurer</TableHead>
                <TableHead>Drug</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-mono">{claim.id}</TableCell>
                  <TableCell className="font-medium">{claim.patient}</TableCell>
                  <TableCell>{claim.insurer}</TableCell>
                  <TableCell>{claim.drug}</TableCell>
                  <TableCell>${claim.amount}</TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    <div className="w-full max-w-[100px]">
                      <Progress 
                        value={claim.progress} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{claim.progress}%</p>
                    </div>
                  </TableCell>
                  <TableCell>{claim.submittedDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimsDashboard;