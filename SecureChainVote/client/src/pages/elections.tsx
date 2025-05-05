import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElectionCard, Election } from "@/components/dashboard/ElectionCard";
import { ElectionModal } from "@/components/elections/ElectionModal";

export default function Elections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("active");
  const [localElections, setLocalElections] = useState<any[]>([]);
  
  useEffect(() => {
    // Load any elections stored in localStorage for prototype mode
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
  
  // Automatically update election status based on dates (for demonstration)
  useEffect(() => {
    const updateElectionStatuses = () => {
      if (localElections.length === 0) return;
      
      const now = new Date();
      let updated = false;
      
      const updatedElections = localElections.map((election: any) => {
        const startDate = new Date(election.startDate);
        const endDate = new Date(election.endDate);
        
        let status = election.status;
        if (status === "upcoming" && now >= startDate) {
          status = "in_progress";
          updated = true;
          // Add simulation data for newly active elections
          election.voteCount = Math.floor(Math.random() * 50);
          election.participation = Math.floor(Math.random() * 5) + 3;
          election.lastTransaction = "0x" + Math.random().toString(16).substring(2, 18);
          election.lastTransactionTime = "just now";
        }
        if (status === "in_progress" && now >= endDate) {
          status = "completed";
          updated = true;
          // Finalize voting numbers for completed elections
          election.participation = Math.min(100, Math.floor(Math.random() * 60) + 40);
          election.voteCount = Math.floor(election.participation / 100 * election.registeredVoters);
          election.lastTransactionTime = "2 hours ago";
        }
        
        return { ...election, status };
      });
      
      if (updated) {
        localStorage.setItem('blockvote_elections', JSON.stringify(updatedElections));
        setLocalElections(updatedElections);
      }
    };
    
    // Initial check
    updateElectionStatuses();
    
    // Check periodically
    const interval = setInterval(updateElectionStatuses, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [localElections]);
  
  const { data: electionsData, isLoading } = useQuery<{elections: any[]}>({ 
    queryKey: ["/api/elections"],
  });
  
  // Transform raw elections data
  const processElections = (elections: any[]): Election[] => {
    return elections?.map((election: any) => {
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
      
      // Add some demo data based on status
      let participation, voteCount, lastTransaction, lastTransactionTime, registrationPercentage, registeredVoters;
      
      if (status === "in_progress") {
        participation = Math.floor(Math.random() * 60) + 10; // 10-70%
        voteCount = Math.floor(participation / 100 * 12458 * 0.8);
        lastTransaction = "0x" + Math.random().toString(16).substring(2, 18);
        lastTransactionTime = Math.floor(Math.random() * 60) + " minutes ago";
      } else if (status === "upcoming") {
        registrationPercentage = Math.floor(Math.random() * 30) + 60; // 60-90%
        registeredVoters = Math.floor((Math.random() * 30 + 60) / 100 * 12458);
      }
      
      return {
        ...election,
        status,
        participation,
        voteCount,
        lastTransaction,
        lastTransactionTime,
        registrationPercentage,
        registeredVoters,
      };
    }) || [];
  };
  
  // Combine API elections with locally stored elections for the prototype
  const apiElections = processElections(electionsData?.elections || []);
  const processedLocalElections = processElections(localElections || []);
  const elections = [...apiElections, ...processedLocalElections];
  
  // Filter elections by tab and search
  const filteredElections = elections.filter(election => {
    // Filter by tab
    if (currentTab === "active" && election.status !== "completed") return true;
    if (currentTab === "completed" && election.status === "completed") return true;
    if (currentTab === "all") return true;
    return false;
  }).filter(election => {
    // Filter by search
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      election.title.toLowerCase().includes(searchLower) ||
      election.electionId.toLowerCase().includes(searchLower) ||
      (election.description && election.description.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Elections</h1>
          <p className="text-slate-500">Manage and monitor all election events</p>
        </div>
        <Button 
          onClick={() => setShowElectionModal(true)}
          className="mt-4 md:mt-0"
        >
          <i className="fas fa-plus mr-2"></i>
          Create New Election
        </Button>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search elections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="active" className="mb-6" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="active">Active & Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Elections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredElections.length > 0 ? (
            <div className="space-y-4">
              {filteredElections.map(election => (
                <ElectionCard key={election.id} election={election} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-slate-500">
                {searchTerm ? "No elections matching your search" : "No active or upcoming elections"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowElectionModal(true)}
              >
                Create New Election
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredElections.length > 0 ? (
            <div className="space-y-4">
              {filteredElections.map(election => (
                <ElectionCard key={election.id} election={election} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-slate-500">
                {searchTerm ? "No completed elections matching your search" : "No completed elections found"}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredElections.length > 0 ? (
            <div className="space-y-4">
              {filteredElections.map(election => (
                <ElectionCard key={election.id} election={election} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-slate-500">
                {searchTerm ? "No elections matching your search" : "No elections found"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowElectionModal(true)}
              >
                Create New Election
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Election creation modal */}
      <ElectionModal 
        isOpen={showElectionModal} 
        onClose={() => setShowElectionModal(false)} 
      />
    </div>
  );
}
