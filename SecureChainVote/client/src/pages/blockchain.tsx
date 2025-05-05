import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { createHash } from "@/lib/blockchain";

interface Block {
  id: number;
  blockId: string;
  timestamp: string;
  previousHash: string;
  hash: string;
  nonce: number;
  transactions: string[];
  transactionCount: number;
}

export default function Blockchain() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [simulatedBlocks, setSimulatedBlocks] = useState<Block[]>([]);
  const [votesQueue, setVotesQueue] = useState<string[]>([]);
  const [isMining, setIsMining] = useState(false);
  
  // Simulate blockchain mining activity
  useEffect(() => {
    // Load any existing blocks from localStorage
    try {
      const storedBlocks = localStorage.getItem('blockvote_blocks');
      if (storedBlocks) {
        setSimulatedBlocks(JSON.parse(storedBlocks));
      } else {
        // If no blocks yet, create genesis block
        const genesisBlock: Block = {
          id: 1,
          blockId: 'block-0000000000',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          hash: '000db50855c215ce6e40a38b9548e8cd0ea73a43774c56a94e9e3f9b9768b8e4',
          nonce: 1337,
          transactions: ['Genesis Block'],
          transactionCount: 1
        };
        setSimulatedBlocks([genesisBlock]);
        localStorage.setItem('blockvote_blocks', JSON.stringify([genesisBlock]));
      }
    } catch (error) {
      console.error("Error loading blocks from localStorage", error);
    }
    
    // Create a generator for simulated vote transactions
    const interval = setInterval(() => {
      // Monitor localStorage for new elections and votes
      try {
        const storedElections = localStorage.getItem('blockvote_elections');
        if (storedElections) {
          const elections = JSON.parse(storedElections);
          const activeElections = elections.filter((e: any) => e.status === 'in_progress');
          
          // If there are active elections, generate random votes
          if (activeElections.length > 0 && Math.random() > 0.3) { // 70% chance to generate a vote
            const randomElection = activeElections[Math.floor(Math.random() * activeElections.length)];
            
            // Create a simulated vote transaction
            const voterID = Math.floor(Math.random() * 1000000);
            const timestamp = new Date().toISOString();
            const electionID = randomElection.electionId;
            const ballotChoice = Math.floor(Math.random() * 3) + 1; // Random choice between 1-3
            
            const voteTransaction = `VOTE:${voterID}:${electionID}:${ballotChoice}:${timestamp}:${Math.random().toString(36).substring(2, 15)}` 
            
            // Add to vote queue
            setVotesQueue(prev => [...prev, voteTransaction]);
          }
        }
      } catch (error) {
        console.error("Error processing simulated votes", error);
      }
    }, 3000); // Generate votes every 3 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Process vote queue and mine blocks
  useEffect(() => {
    // Only mine if we have enough votes and aren't currently mining
    if (votesQueue.length >= 5 && !isMining) {
      const mineBlock = async () => {
        setIsMining(true);
        
        try {
          // Take up to 10 votes from queue
          const transactionsToProcess = votesQueue.slice(0, 10);
          const remainingVotes = votesQueue.slice(10);
          
          // Get the latest block as previous block
          const previousBlock = simulatedBlocks[simulatedBlocks.length - 1];
          
          // Create a new block
          const newBlock: Block = {
            id: previousBlock.id + 1,
            blockId: `block-${Date.now().toString().substring(6)}`,
            timestamp: new Date().toISOString(),
            previousHash: previousBlock.hash,
            hash: '', // Will calculate below
            nonce: 0,
            transactions: transactionsToProcess,
            transactionCount: transactionsToProcess.length
          };
          
          // Simulate mining (Proof of Work)
          let validHash = false;
          let attempts = 0;
          let hash = '';
          
          while (!validHash && attempts < 100) {
            newBlock.nonce = Math.floor(Math.random() * 1000000);
            hash = await createHashWithDelay(previousBlock.hash, transactionsToProcess, newBlock.nonce, new Date(newBlock.timestamp));
            validHash = hash.startsWith('000'); // Simplified difficulty
            attempts++;
          }
          
          newBlock.hash = hash;
          
          // Update simulated blocks
          const updatedBlocks = [...simulatedBlocks, newBlock];
          setSimulatedBlocks(updatedBlocks);
          setVotesQueue(remainingVotes);
          
          // Store in localStorage
          localStorage.setItem('blockvote_blocks', JSON.stringify(updatedBlocks));
          
          // Simulate adding these votes to the election vote counts
          updateElectionVoteCounts(transactionsToProcess);
          
        } catch (error) {
          console.error("Error mining block", error);
        } finally {
          setIsMining(false);
        }
      };
      
      mineBlock();
    }
  }, [votesQueue, isMining, simulatedBlocks]);
  
  // Helper to add a delay to hash calculation to simulate mining time
  const createHashWithDelay = async (previousHash: string, transactions: string[], nonce: number, timestamp: Date): Promise<string> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const hash = createHash(previousHash, transactions, nonce, timestamp);
        resolve(hash);
      }, 500); // Add a delay to make mining visible
    });
  };
  
  // Blockchain verification
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationDetails, setVerificationDetails] = useState<{block: string, status: 'valid' | 'invalid', issue?: string}[]>([]);
  
  // Verify the integrity of the blockchain
  const verifyBlockchain = async () => {
    if (blocks.length === 0) return;
    
    setVerificationStatus('verifying');
    setVerificationProgress(0);
    setVerificationDetails([]);
    
    let isValid = true;
    const details: {block: string, status: 'valid' | 'invalid', issue?: string}[] = [];
    
    // Verify each block
    for (let i = 0; i < blocks.length; i++) {
      // Update progress
      setVerificationProgress(Math.round((i / blocks.length) * 100));
      
      const block = blocks[i];
      
      // 1. Check genesis block if it's the first block
      if (i === 0) {
        if (block.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
          isValid = false;
          details.push({
            block: block.blockId,
            status: 'invalid',
            issue: 'Invalid genesis block: incorrect previous hash'
          });
          continue;
        }
      } else {
        // 2. Verify the previous hash links to the previous block
        const previousBlock = blocks[i - 1];
        if (block.previousHash !== previousBlock.hash) {
          isValid = false;
          details.push({
            block: block.blockId,
            status: 'invalid',
            issue: 'Previous hash does not match hash of previous block'
          });
          continue;
        }
      }
      
      // 3. Verify hash is correct for the block's content
      const calculatedHash = createHash(
        block.previousHash,
        block.transactions,
        block.nonce,
        new Date(block.timestamp)
      );
      
      if (calculatedHash !== block.hash) {
        isValid = false;
        details.push({
          block: block.blockId,
          status: 'invalid',
          issue: 'Block hash is invalid (content may have been tampered with)'
        });
        continue;
      }
      
      // Add valid block to details
      details.push({
        block: block.blockId,
        status: 'valid'
      });
      
      // Simulate verification time with a small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Update final status
    setVerificationStatus(isValid ? 'valid' : 'invalid');
    setVerificationProgress(100);
    setVerificationDetails(details);
  };
  
  // Update election vote counts in localStorage when blocks are mined
  const updateElectionVoteCounts = (transactions: string[]) => {
    try {
      const storedElections = localStorage.getItem('blockvote_elections');
      if (!storedElections) return;
      
      const elections = JSON.parse(storedElections);
      let updated = false;
      
      // Process each vote transaction
      transactions.forEach(transaction => {
        if (transaction.startsWith('VOTE:')) {
          const parts = transaction.split(':');
          const electionID = parts[2];
          
          // Find the election
          const electionIndex = elections.findIndex((e: any) => e.electionId === electionID);
          if (electionIndex >= 0) {
            // Update vote count
            const election = elections[electionIndex];
            election.voteCount = (election.voteCount || 0) + 1;
            
            // Update participation percentage
            const totalVoters = election.registeredVoters || 10000;
            election.participation = Math.min(100, (election.voteCount / totalVoters) * 100);
            
            // Update last transaction
            election.lastTransaction = transaction.split(':')[5] || "0x" + Math.random().toString(16).substring(2, 18);
            election.lastTransactionTime = "just now";
            
            updated = true;
          }
        }
      });
      
      if (updated) {
        localStorage.setItem('blockvote_elections', JSON.stringify(elections));
      }
      
    } catch (error) {
      console.error("Error updating election vote counts", error);
    }
  };
  
  // Try to get blocks from API first, fall back to simulated
  const { data: blockchainStatus, isLoading: isLoadingStatus } = useQuery<any>({
    queryKey: ["/api/blockchain/status"],
  });
  
  const { data: blocksData, isLoading: isLoadingBlocks } = useQuery<{blocks: Block[]}>({
    queryKey: ["/api/blockchain/blocks"],
  });
  
  const { data: selectedBlockData, isLoading: isLoadingSelectedBlock } = useQuery<{block: Block}>({
    queryKey: ["/api/blockchain/blocks", selectedBlock],
    enabled: !!selectedBlock,
  });
  
  // Use API blocks if available, otherwise use simulated
  const blocks: Block[] = (blocksData && blocksData.blocks && blocksData.blocks.length > 0)
    ? blocksData.blocks 
    : simulatedBlocks;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Blockchain</h1>
        <p className="text-slate-500">Monitor and validate the election blockchain</p>
      </div>
      
      {/* Blockchain Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Blockchain Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStatus ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-lg font-medium">Online</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500">Nodes Active:</div>
                  <div className="font-medium">{blockchainStatus?.nodesActive || 42}</div>
                  
                  <div className="text-slate-500">Latest Block:</div>
                  <div className="font-mono">{blockchainStatus?.latestBlock?.blockId || "#1038294"}</div>
                  
                  <div className="text-slate-500">Consensus:</div>
                  <div className="font-medium">{blockchainStatus?.consensusAgreement || "100%"}</div>
                  
                  <div className="text-slate-500">Block Time:</div>
                  <div className="font-medium">~30 seconds</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Network Details</CardTitle>
            <CardDescription>Blockchain configuration and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Consensus Algorithm</h3>
                <p className="font-medium">Proof of Authority (PoA)</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Block Generation</h3>
                <p className="font-medium">10 transactions / block</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Hash Algorithm</h3>
                <p className="font-medium">SHA-256</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Network Type</h3>
                <p className="font-medium">Private Permissioned</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Block Explorer</h3>
                <p className="font-medium">
                  <a href="#" className="text-primary-600 hover:text-primary-800">
                    Open Explorer <i className="fas fa-external-link-alt text-xs"></i>
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Data Storage</h3>
                <p className="font-medium">Distributed Ledger</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Blockchain Explorer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Blockchain Explorer</CardTitle>
          <CardDescription>Browse and inspect blocks in the chain</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="blocks">
            <TabsList className="mb-4">
              <TabsTrigger value="blocks">Blocks</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="verification">Chain Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blocks">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border-r pr-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Recent Blocks</h3>
                    {isLoadingBlocks ? (
                      <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {blocks.map((block) => (
                          <div 
                            key={block.blockId} 
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedBlock === block.blockId 
                                ? "bg-primary-50 border-primary-200" 
                                : "bg-white hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedBlock(block.blockId)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-mono">{block.blockId}</div>
                              <Badge variant="success">{block.transactionCount} tx</Badge>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Block Details</h3>
                  
                  {!selectedBlock ? (
                    <div className="bg-slate-50 rounded-lg p-6 text-center">
                      <p className="text-slate-500">Select a block to view its details</p>
                    </div>
                  ) : isLoadingSelectedBlock ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Block ID</h4>
                          <p className="font-mono">{selectedBlockData?.block?.blockId}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Timestamp</h4>
                          <p>{selectedBlockData?.block?.timestamp ? new Date(selectedBlockData.block.timestamp).toLocaleString() : ''}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Hash</h4>
                          <p className="font-mono text-xs break-all">{selectedBlockData?.block?.hash}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Previous Hash</h4>
                          <p className="font-mono text-xs break-all">{selectedBlockData?.block?.previousHash}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Nonce</h4>
                          <p>{selectedBlockData?.block?.nonce}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Transaction Count</h4>
                          <p>{selectedBlockData?.block?.transactionCount}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-500 mb-2">Transactions</h4>
                        <div className="bg-white rounded border p-3 max-h-[200px] overflow-y-auto">
                          {selectedBlockData?.block?.transactions ? (
                            selectedBlockData.block.transactions.map((tx: string) => (
                              <div key={tx} className="text-xs font-mono py-1 border-b last:border-0">
                                {tx}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-slate-500 py-1">No transactions</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 text-right">
                        <Button variant="outline" size="sm">
                          <i className="fas fa-check-circle mr-2"></i>
                          Verify Block
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <div className="bg-white rounded-lg border p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Transaction Explorer</h3>
                  <p className="text-slate-500 mb-4">
                    Browse and search all transactions recorded on the blockchain.
                  </p>
                  
                  {/* Transaction search */}
                  <div className="flex gap-4 items-center mb-6">
                    <div className="relative w-full max-w-md">
                      <input 
                        type="text" 
                        placeholder="Search by transaction ID, voter ID, or election ID" 
                        className="w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="fas fa-search text-slate-400"></i>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-filter mr-2"></i>
                      Filter
                    </Button>
                  </div>
                  
                  {/* Transactions list */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Block</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {blocks.flatMap(block => 
                          block.transactions.map((tx, txIndex) => {
                            let txType = 'OTHER';
                            let details = { id: '', target: '' };
                            
                            // Parse transaction data based on format
                            if (tx.startsWith('VOTE:')) {
                              txType = 'VOTE';
                              const parts = tx.split(':');
                              const voterId = parts[1];
                              const electionId = parts[2];
                              const choice = parts[3];
                              details = {
                                id: tx.includes(':') ? tx.split(':')[5] || `tx-${Math.random().toString(16).substring(2, 10)}` : '',
                                target: `Election ${electionId}`
                              };
                            } else if (tx === 'Genesis Block') {
                              txType = 'GENESIS';
                              details = {
                                id: 'genesis-tx',
                                target: 'System Initialization'
                              };
                            }
                            
                            return (
                              <tr key={`${block.blockId}-${txIndex}`}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-900">
                                  {details.id || `tx-${Math.random().toString(16).substring(2, 10)}`}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    txType === 'VOTE' ? 'bg-blue-100 text-blue-800' :
                                    txType === 'GENESIS' ? 'bg-purple-100 text-purple-800' :
                                    'bg-slate-100 text-slate-800'
                                  }`}>
                                    {txType}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                  {block.blockId}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                  {formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-900">
                                  {details.target || 'Transaction data'}
                                </td>
                              </tr>
                            );
                          })
                        ).slice(0, 20) /* Limit to first 20 transactions for performance */}
                      </tbody>
                    </table>
                  </div>
                  
                  {blocks.flatMap(block => block.transactions).length > 20 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm">
                        Load More Transactions
                      </Button>
                    </div>
                  )}
                  
                  {votesQueue.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-3">Pending Transactions</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-800">
                            Transactions waiting to be mined
                          </span>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {votesQueue.length} in queue
                          </Badge>
                        </div>
                        <div className="text-xs text-yellow-700 mb-2">
                          New blocks are mined approximately every 30 seconds, or when 5-10 transactions are in queue.
                        </div>
                        {isMining && (
                          <div className="flex items-center text-sm text-yellow-800">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-600 mr-2"></div>
                            Mining in progress...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="verification">
              <div className="bg-white rounded-lg border p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Blockchain Integrity Verification</h3>
                  <p className="text-slate-500 mb-4">
                    Verify that the blockchain has not been tampered with by checking the integrity of all blocks and their connections.
                  </p>
                  
                  {/* Verification controls */}
                  <div className="flex gap-4 items-center">
                    <Button 
                      onClick={verifyBlockchain} 
                      disabled={verificationStatus === 'verifying' || blocks.length === 0}
                      className="px-6"
                    >
                      {verificationStatus === 'verifying' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : 'Verify Blockchain'}
                    </Button>
                    
                    {verificationStatus !== 'idle' && (
                      <div className="flex items-center">
                        {verificationStatus === 'valid' ? (
                          <Badge variant="success" className="px-3 py-1">
                            <i className="fas fa-check mr-1"></i> Valid
                          </Badge>
                        ) : verificationStatus === 'invalid' ? (
                          <Badge variant="destructive" className="px-3 py-1">
                            <i className="fas fa-times mr-1"></i> Invalid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-3 py-1">
                            {verificationProgress}% Complete
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                {verificationStatus === 'verifying' && (
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${verificationProgress}%` }}
                    ></div>
                  </div>
                )}
                
                {/* Verification results */}
                {verificationDetails.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-3">Verification Results</h4>
                    <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                      <table className="min-w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Block</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {verificationDetails.map((detail, index) => (
                            <tr key={index} className={detail.status === 'invalid' ? 'bg-red-50' : ''}>
                              <td className="px-4 py-3 text-sm font-mono">{detail.block}</td>
                              <td className="px-4 py-3">
                                {detail.status === 'valid' ? (
                                  <Badge variant="success" className="px-2 py-0.5">
                                    <i className="fas fa-check mr-1"></i> Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="px-2 py-0.5">
                                    <i className="fas fa-times mr-1"></i> Invalid
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500">
                                {detail.issue || 'Block verified successfully'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Information about blockchain verification */}
                {verificationStatus === 'idle' && (
                  <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg">
                    <h4 className="text-md font-medium mb-2">About Blockchain Verification</h4>
                    <p className="text-sm">
                      The verification process checks the following aspects of each block:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      <li>Validates the genesis block's structure</li>
                      <li>Ensures each block properly references the previous block's hash</li>
                      <li>Recalculates each block's hash to confirm data integrity</li>
                      <li>Verifies the proof-of-work for each block</li>
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Chain Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Visualization</CardTitle>
          <CardDescription>Visual representation of the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-4 h-64 overflow-hidden relative">
            {/* Visual chain representation */}
            <div className="flex items-center justify-start overflow-x-auto px-4 py-6 absolute inset-0">
              {blocks.map((block, index) => (
                <div key={block.blockId} className="flex flex-col items-center mx-1 first:ml-4 last:mr-8">
                  {/* Block */}
                  <div 
                    className={`w-32 h-32 flex-shrink-0 border-2 rounded-md flex flex-col justify-between p-2 transition-colors cursor-pointer ${
                      selectedBlock === block.blockId 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedBlock(block.blockId)}
                  >
                    <div className="text-xs font-mono overflow-hidden text-ellipsis">
                      {block.blockId}
                    </div>
                    
                    <div className="text-center my-1">
                      <Badge variant="outline" className="text-xs">
                        {block.transactionCount} tx
                      </Badge>
                      {index === 0 && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Genesis
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-500 text-right">
                      {formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  
                  {/* Chain connector */}
                  {index < blocks.length - 1 && (
                    <div className="flex items-center mt-2">
                      <div className="w-8 h-0.5 bg-slate-300"></div>
                      <div className="text-slate-400">
                        <i className="fas fa-arrow-right"></i>
                      </div>
                      <div className="w-8 h-0.5 bg-slate-300"></div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Pending block (if mining) */}
              {isMining && votesQueue.length > 0 && (
                <div className="flex flex-col items-center mx-1 ml-4">
                  {/* Connection to previous block */}
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-0.5 bg-slate-300"></div>
                    <div className="text-slate-400">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                    <div className="w-8 h-0.5 bg-slate-300"></div>
                  </div>
                  
                  {/* Mining block */}
                  <div className="w-32 h-32 flex-shrink-0 border-2 border-dashed border-yellow-400 rounded-md flex flex-col justify-between p-2 bg-yellow-50">
                    <div className="text-xs font-mono overflow-hidden text-ellipsis">
                      Mining...
                    </div>
                    
                    <div className="flex justify-center items-center flex-grow">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50 text-xs">
                        {Math.min(votesQueue.length, 10)} tx
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Queue indicator (if not mining) */}
              {!isMining && votesQueue.length > 0 && (
                <div className="flex flex-col items-center mx-1 ml-4">
                  {/* Connection to previous block */}
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-0.5 bg-slate-300"></div>
                    <div className="text-slate-400">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                    <div className="w-8 h-0.5 bg-slate-300"></div>
                  </div>
                  
                  {/* Pending transactions */}
                  <div className="w-32 h-32 flex-shrink-0 border-2 border-slate-200 rounded-md flex flex-col justify-between p-2 bg-slate-50">
                    <div className="text-xs font-mono overflow-hidden text-ellipsis">
                      Pending
                    </div>
                    
                    <div className="flex flex-col items-center justify-center flex-grow gap-1">
                      <div className="text-sm font-medium">{votesQueue.length}</div>
                      <div className="text-xs text-slate-500">transactions in queue</div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        Awaiting mining
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Side fade effect */}
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-white to-transparent"></div>
            
            {/* Empty state */}
            {blocks.length === 0 && !isMining && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-cubes text-4xl text-slate-300 mb-2"></i>
                  <p className="text-slate-500">No blocks available in the blockchain</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Instruction */}
          <div className="text-center mt-4 text-xs text-slate-500">
            Scroll horizontally to view the entire blockchain. Click on any block to view its details.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
