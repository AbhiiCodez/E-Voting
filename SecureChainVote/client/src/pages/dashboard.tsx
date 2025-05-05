import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ElectionCard, Election } from "@/components/dashboard/ElectionCard";
import { ActivityLog, AuditLogEntry } from "@/components/dashboard/ActivityLog";
import { ElectionModal } from "@/components/elections/ElectionModal";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [localElections, setLocalElections] = useState<any[]>([]);
  
  // Load local elections from localStorage
  useEffect(() => {
    try {
      const storedElections = localStorage.getItem('blockvote_elections');
      if (storedElections) {
        setLocalElections(JSON.parse(storedElections));
      }
    } catch (error) {
      console.error("Error loading elections from localStorage", error);
    }

    // Listen for storage events to update when another tab makes changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'blockvote_elections') {
        try {
          if (event.newValue) {
            setLocalElections(JSON.parse(event.newValue));
          } else {
            setLocalElections([]);
          }
        } catch (error) {
          console.error("Error parsing localStorage elections", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const { data: dashboardStats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });
  
  const { data: electionsData, isLoading: isLoadingElections } = useQuery<{elections: any[]}>({ 
    queryKey: ["/api/elections/active"],
  });

  // Transform data for components
  const processElection = (election: any): Election => {
    // Format data for display
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    let status = election.status;
    if (status === "upcoming" && now >= startDate) {
      status = "in_progress";
    }
    if (status === "in_progress" && now >= endDate) {
      status = "completed";
    }
    
    // Add some demo data
    const participation = Math.floor(Math.random() * 60) + 10; // 10-70%
    const voteCount = Math.floor(participation / 100 * 12458 * 0.8);
    const lastTxTime = formatDistanceToNow(new Date(Date.now() - Math.floor(Math.random() * 3600000)), { addSuffix: true });
    
    return {
      ...election,
      status,
      participation,
      voteCount,
      lastTransaction: "0x" + Math.random().toString(16).substring(2, 18),
      lastTransactionTime: lastTxTime,
      registrationPercentage: Math.floor(Math.random() * 30) + 60, // 60-90%
      registeredVoters: Math.floor((Math.random() * 30 + 60) / 100 * 12458),
    };
  };

  // Combine API and localStorage elections
  const apiElections = (electionsData?.elections || []).map(processElection);
  const localActiveElections = localElections
    .filter((election: any) => election.status !== 'completed')
    .map(processElection);
  
  const activeElections: Election[] = [...apiElections, ...localActiveElections];
  
  // For demonstration, create realistic data that changes over time
  const [simulationData, setSimulationData] = useState({
    lastBlock: "#" + (1038294 + Math.floor(Math.random() * 100)),
    blockchainNodes: 42 + Math.floor(Math.random() * 8),
    consensusAgreement: "100%",
    registeredVoters: 12458,
    verifiedVoters: 11932,
    pendingVoters: 526,
    timestamp: new Date()
  });
  
  // Generate random voter names for simulation
  const generateRandomVoterName = () => {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah', 'Thomas', 'Karen', 'Charles', 'Nancy'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  };
  
  // Simulation of audit log entries for voting activity
  const [simulatedVoters, setSimulatedVoters] = useState<{
    name: string;
    voted: boolean;
    votedAt: Date | null;
    electionId: number | null;
  }[]>(Array.from({ length: 100 }, () => ({
    name: generateRandomVoterName(),
    voted: false,
    votedAt: null,
    electionId: null
  })));
  
  // Generate new simulated audit log entry for voting
  const generateVoteAuditLog = (voterName: string, electionTitle: string) => {
    // Generate a unique ID using timestamp and a random number
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    
    return {
      id: newId,
      action: "Vote Cast",
      details: { voter: voterName, election: electionTitle, verified: true },
      timestamp: new Date().toISOString(),
      user: { fullName: voterName, initials: voterName.split(' ').map(n => n[0]).join('') }
    };
  };
  
  // Create custom audit logs for voting simulation
  const [simulatedAuditLogs, setSimulatedAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Every few seconds, update simulation data to show blockchain activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Update blockchain simulation data
      setSimulationData(prev => ({
        ...prev,
        lastBlock: "#" + (parseInt(prev.lastBlock.substring(1)) + 1),
        blockchainNodes: 42 + Math.floor(Math.random() * 8),
        consensusAgreement: Math.random() > 0.9 ? "99.8%" : "100%",
        registeredVoters: prev.registeredVoters + (Math.random() > 0.7 ? 1 : 0),
        verifiedVoters: prev.verifiedVoters + (Math.random() > 0.8 ? 1 : 0),
        timestamp: new Date()
      }));
      
      // If active elections exist, simulate intensive voting activity
      if (activeElections.length > 0) {
        // Get only in-progress elections
        const inProgressElections = activeElections.filter(election => election.status === 'in_progress');
        if (inProgressElections.length === 0) return;
        
        // Select a random election for this voting round
        const randomElectionIndex = Math.floor(Math.random() * inProgressElections.length);
        const targetElection = inProgressElections[randomElectionIndex];
        
        if (targetElection) {
          // Find available voters who haven't voted yet
          const availableVoters = simulatedVoters.filter(voter => !voter.voted || voter.electionId !== targetElection.id);
          
          // If we have voters available, simulate 1-3 votes in this round
          if (availableVoters.length > 0) {
            const votesThisRound = Math.min(Math.floor(Math.random() * 3) + 1, availableVoters.length);
            const newVoters = [...simulatedVoters];
            const newAuditLogs = [...simulatedAuditLogs];
            
            // Process each vote
            for (let i = 0; i < votesThisRound; i++) {
              const voterIndex = simulatedVoters.findIndex(v => v === availableVoters[i]);
              if (voterIndex >= 0) {
                // Mark voter as having voted
                newVoters[voterIndex] = {
                  ...newVoters[voterIndex],
                  voted: true,
                  votedAt: new Date(),
                  electionId: targetElection.id
                };
                
                // Create audit log entry for this vote
                const auditLog = generateVoteAuditLog(newVoters[voterIndex].name, targetElection.title);
                newAuditLogs.unshift(auditLog); // Add to beginning
                
                // Keep only latest 20 logs for display
                if (newAuditLogs.length > 20) {
                  newAuditLogs.length = 20;
                }
              }
            }
            
            // Update voter and audit log state
            setSimulatedVoters(newVoters);
            setSimulatedAuditLogs(newAuditLogs);
            
            // Update the local elections with new vote counts
            const updatedLocalElections = [...localElections];
            const localElectionIndex = updatedLocalElections.findIndex(e => e.id === targetElection.id);
            
            if (localElectionIndex >= 0) {
              // Update vote count and participation
              updatedLocalElections[localElectionIndex].voteCount = (updatedLocalElections[localElectionIndex].voteCount || 0) + votesThisRound;
              
              // Calculate new participation percentage
              const totalVoters = updatedLocalElections[localElectionIndex].registeredVoters || 10000;
              const participation = Math.min(100, (updatedLocalElections[localElectionIndex].voteCount / totalVoters) * 100);
              updatedLocalElections[localElectionIndex].participation = participation;
              
              // Add transaction info
              updatedLocalElections[localElectionIndex].lastTransaction = "0x" + Math.random().toString(16).substring(2, 18);
              updatedLocalElections[localElectionIndex].lastTransactionTime = "just now";
              
              // Save to localStorage to persist changes
              localStorage.setItem('blockvote_elections', JSON.stringify(updatedLocalElections));
            }
          }
        }
      }
    }, 2000); // Faster updates for more active simulation
    
    return () => clearInterval(interval);
  }, [activeElections, localElections, simulatedVoters, simulatedAuditLogs]);
  
  // Generate demo audit logs if none from API
  const defaultAuditLogs: AuditLogEntry[] = [
    {
      id: 1,
      action: "System Startup",
      details: { status: "success", nodeCount: 42 },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: { fullName: "System", initials: "SY" }
    },
    {
      id: 2,
      action: "User Login",
      userId: 1,
      details: { username: "admin" },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      user: { fullName: "Admin Johnson", initials: "AJ" }
    },
    {
      id: 3,
      action: "Blockchain Verification",
      details: { blocks: 1038294, status: "verified" },
      timestamp: new Date(Date.now() - 900000).toISOString(),
      user: { fullName: "System", initials: "SY" }
    }
  ];
  
  // Process audit logs - combine simulated voter logs with default/API logs
  const apiLogs = (dashboardStats?.recentActivity || []).map((log: any) => ({
    ...log,
    id: log.id + 10000, // Ensure unique IDs by adding offset to API logs
    user: {
      fullName: log.userId === 1 ? "Admin Johnson" : "System",
      initials: log.userId === 1 ? "AJ" : "SY",
    }
  }));
  
  // No need to track IDs separately as we're using timestamp-based unique IDs
  
  const combinedLogs = [...simulatedAuditLogs, ...apiLogs, ...defaultAuditLogs];
  
  // Sort logs by timestamp (newest first) and keep only the most recent ones
  const auditLogs: AuditLogEntry[] = combinedLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">System overview and active elections</p>
      </div>
      
      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusCard
          icon={<i className="fas fa-server"></i>}
          title="Blockchain Status"
          primaryValue={
            <div className="flex items-center">
              <span className="text-green-600 mr-2">
                <i className="fas fa-circle text-xs"></i>
              </span>
              <span>Online - {simulationData.blockchainNodes} nodes active</span>
            </div>
          }
          stats={[
            { label: "Last block", value: dashboardStats?.blockchainStatus?.lastBlock || simulationData.lastBlock },
            { label: "Consensus", value: dashboardStats?.blockchainStatus?.consensusAgreement || simulationData.consensusAgreement }
          ]}
          iconBgColor="bg-green-100"
          iconTextColor="text-green-600"
        />
        
        <StatusCard
          icon={<i className="fas fa-vote-yea"></i>}
          title="Active Elections"
          primaryValue={dashboardStats?.elections?.active || activeElections.length || 0}
          stats={[
            { label: "In progress", value: dashboardStats?.elections?.inProgress || activeElections.filter(e => e.status === 'in_progress').length },
            { label: "Upcoming", value: dashboardStats?.elections?.upcoming || activeElections.filter(e => e.status === 'upcoming').length }
          ]}
          iconBgColor="bg-blue-100"
          iconTextColor="text-primary-600"
        />
        
        <StatusCard
          icon={<i className="fas fa-users"></i>}
          title="Registered Voters"
          primaryValue={dashboardStats?.voters?.registered || simulationData.registeredVoters}
          stats={[
            { label: "Verified", value: dashboardStats?.voters?.verified || simulationData.verifiedVoters },
            { label: "Pending verification", value: dashboardStats?.voters?.pending || simulationData.pendingVoters }
          ]}
          iconBgColor="bg-amber-100"
          iconTextColor="text-accent-500"
        />
      </div>
      
      {/* Current Elections */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Active Elections</h2>
          <Button onClick={() => setShowElectionModal(true)}>
            <i className="fas fa-plus mr-2"></i>
            New Election
          </Button>
        </div>
        
        {isLoadingElections ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : activeElections.length > 0 ? (
          activeElections.map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-slate-500">No active elections found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setShowElectionModal(true)}
            >
              Create New Election
            </Button>
          </div>
        )}
      </div>
      
      {/* Recent Activity */}
      <ActivityLog 
        logs={auditLogs} 
        showViewAll={true}
        onViewAll={() => setLocation("/audit")}
      />
      
      {/* Election creation modal */}
      <ElectionModal 
        isOpen={showElectionModal} 
        onClose={() => setShowElectionModal(false)} 
      />
    </div>
  );
}
