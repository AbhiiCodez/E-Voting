import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Voter {
  id: number;
  username: string;
  fullName: string;
  email: string;
  verified: boolean;
}

interface UsersResponse {
  users: Voter[];
}

export default function Voters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const { toast } = useToast();
  const [simulatedVoters, setSimulatedVoters] = useState<Voter[]>([]);
  
  // Generate random voter names for simulation
  const generateRandomVoterName = () => {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah', 'Thomas', 'Karen', 'Charles', 'Nancy'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  };

  // Generate random email based on name
  const generateEmail = (name: string) => {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com', 'company.org'];
    const nameParts = name.toLowerCase().split(' ');
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${nameParts[0]}.${nameParts[1]}@${domain}`;
  };

  // Generate random username based on name
  const generateUsername = (name: string) => {
    const nameParts = name.toLowerCase().split(' ');
    const randomNum = Math.floor(Math.random() * 1000);
    return `${nameParts[0][0]}${nameParts[1]}${randomNum}`;
  };
  
  // Initialize simulated voter data
  useEffect(() => {
    // Check if we already have voters in localStorage
    const storedVoters = localStorage.getItem('blockvote_voters');
    if (storedVoters) {
      setSimulatedVoters(JSON.parse(storedVoters));
    } else {
      // Generate some initial simulated voters
      const initialVoters: Voter[] = Array.from({ length: 25 }, (_, i) => {
        const fullName = generateRandomVoterName();
        return {
          id: 1000 + i,
          fullName,
          email: generateEmail(fullName),
          username: generateUsername(fullName),
          verified: Math.random() > 0.3  // 70% are verified initially
        };
      });
      setSimulatedVoters(initialVoters);
      localStorage.setItem('blockvote_voters', JSON.stringify(initialVoters));
    }
  }, []);

  // Add new voters and automatically verify some periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // 25% chance to add a new voter
      if (Math.random() < 0.25) {
        setSimulatedVoters(prev => {
          const fullName = generateRandomVoterName();
          const newVoter: Voter = {
            id: 1000 + prev.length,
            fullName,
            email: generateEmail(fullName),
            username: generateUsername(fullName),
            verified: false // New voters start unverified
          };
          
          const updatedVoters = [...prev, newVoter];
          localStorage.setItem('blockvote_voters', JSON.stringify(updatedVoters));
          
          // Show toast notification for new voter
          toast({
            title: "New Voter Registered",
            description: `${fullName} has just registered as a voter.`,
          });
          
          return updatedVoters;
        });
      }
      
      // 15% chance to verify a pending voter
      const pendingVoters = simulatedVoters.filter(v => !v.verified);
      if (pendingVoters.length > 0 && Math.random() < 0.15) {
        const voterToVerify = pendingVoters[Math.floor(Math.random() * pendingVoters.length)];
        verifyVoter(voterToVerify.id);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [simulatedVoters]);
  
  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/users"],
  });
  
  const verifyVoter = async (userId: number) => {
    try {
      // If it's a simulated voter (ID >= 1000)
      if (userId >= 1000) {
        setSimulatedVoters(prev => {
          const updatedVoters = prev.map(voter => 
            voter.id === userId ? { ...voter, verified: true } : voter
          );
          localStorage.setItem('blockvote_voters', JSON.stringify(updatedVoters));
          return updatedVoters;
        });
        
        // Create an audit log for this verification
        const verifiedVoter = simulatedVoters.find(v => v.id === userId);
        if (verifiedVoter) {
          // Add to audit logs
          const auditLogs = JSON.parse(localStorage.getItem('blockvote_audit_logs') || '[]');
          const newLog = {
            id: Date.now(),
            action: 'Voter Verified',
            userId: 1, // Admin
            details: { voter: verifiedVoter.fullName, email: verifiedVoter.email },
            timestamp: new Date().toISOString()
          };
          auditLogs.unshift(newLog); // Add to beginning
          localStorage.setItem('blockvote_audit_logs', JSON.stringify(auditLogs.slice(0, 100)));
        }
      } else {
        // Regular API voter
        await apiRequest("POST", `/api/users/verify/${userId}`, {});
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      }
      
      toast({
        title: "Voter Verified",
        description: "The voter has been successfully verified.",
      });
    } catch (error) {
      console.error("Error verifying voter:", error);
      toast({
        title: "Error",
        description: "Failed to verify voter. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Combine API voters with simulated voters
  const apiVoters: Voter[] = data?.users || [];
  const allVoters: Voter[] = [...apiVoters, ...simulatedVoters];
  
  // Filter voters
  const filteredVoters = allVoters.filter(voter => {
    // Filter by tab
    if (currentTab === "verified" && !voter.verified) return false;
    if (currentTab === "pending" && voter.verified) return false;
    
    // Filter by search
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      voter.username.toLowerCase().includes(searchLower) ||
      voter.fullName.toLowerCase().includes(searchLower) ||
      voter.email.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Voters</h1>
        <p className="text-slate-500">Manage and verify registered voters</p>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Input
          placeholder="Search voters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        
        <div className="flex gap-2">
          <Button variant="outline">
            <i className="fas fa-download mr-2"></i>
            Export
          </Button>
          <Button>
            <i className="fas fa-user-plus mr-2"></i>
            Add Voter
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All Voters</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <VoterTable 
            voters={filteredVoters} 
            isLoading={isLoading} 
            onVerify={verifyVoter} 
          />
        </TabsContent>
        
        <TabsContent value="verified">
          <VoterTable 
            voters={filteredVoters} 
            isLoading={isLoading} 
            onVerify={verifyVoter} 
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <VoterTable 
            voters={filteredVoters} 
            isLoading={isLoading} 
            onVerify={verifyVoter} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface VoterTableProps {
  voters: Voter[];
  isLoading: boolean;
  onVerify: (id: number) => void;
}

function VoterTable({ voters, isLoading, onVerify }: VoterTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (voters.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-slate-500">No voters found matching your criteria</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {voters.map((voter) => (
            <TableRow key={voter.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-2">
                    {voter.fullName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                  </div>
                  {voter.fullName}
                </div>
              </TableCell>
              <TableCell>{voter.email}</TableCell>
              <TableCell>{voter.username}</TableCell>
              <TableCell>
                {voter.verified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {!voter.verified && (
                    <Button 
                      size="sm" 
                      onClick={() => onVerify(voter.id)}
                    >
                      Verify
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <i className="fas fa-ellipsis-h"></i>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
