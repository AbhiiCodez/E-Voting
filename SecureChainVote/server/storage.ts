import { 
  users, elections, ballotItems, blocks, votes, auditLogs,
  type User, type InsertUser, 
  type Election, type InsertElection,
  type BallotItem, type InsertBallotItem,
  type Block, type InsertBlock,
  type Vote, type InsertVote,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(id: number, verified: boolean): Promise<User | undefined>;
  
  // Election methods
  getElection(id: number): Promise<Election | undefined>;
  getElectionByElectionId(electionId: string): Promise<Election | undefined>;
  getAllElections(): Promise<Election[]>;
  getActiveElections(): Promise<Election[]>;
  createElection(election: InsertElection): Promise<Election>;
  updateElectionStatus(id: number, status: string): Promise<Election | undefined>;
  
  // Ballot Item methods
  getBallotItems(electionId: number): Promise<BallotItem[]>;
  createBallotItem(ballotItem: InsertBallotItem): Promise<BallotItem>;
  
  // Blockchain methods
  createBlock(block: InsertBlock): Promise<Block>;
  getLatestBlock(): Promise<Block | undefined>;
  getBlock(blockId: string): Promise<Block | undefined>;
  getAllBlocks(limit?: number): Promise<Block[]>;
  
  // Vote methods
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByElection(electionId: number): Promise<Vote[]>;
  getVoteByTransactionId(transactionId: string): Promise<Vote | undefined>;
  updateVoteBlock(transactionId: string, blockId: string): Promise<Vote | undefined>;
  
  // Audit logs
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getRecentAuditLogs(limit?: number): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private electionsData: Map<number, Election>;
  private ballotItemsData: Map<number, BallotItem>;
  private blocksData: Map<number, Block>;
  private votesData: Map<number, Vote>;
  private auditLogsData: Map<number, AuditLog>;
  
  private currentUserId: number;
  private currentElectionId: number;
  private currentBallotItemId: number;
  private currentBlockId: number;
  private currentVoteId: number;
  private currentAuditLogId: number;

  constructor() {
    this.usersData = new Map();
    this.electionsData = new Map();
    this.ballotItemsData = new Map();
    this.blocksData = new Map();
    this.votesData = new Map();
    this.auditLogsData = new Map();
    
    this.currentUserId = 1;
    this.currentElectionId = 1;
    this.currentBallotItemId = 1;
    this.currentBlockId = 1;
    this.currentVoteId = 1;
    this.currentAuditLogId = 1;
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "$2a$10$JUNPOh5TBqbV1ljv3nWjn.zECf0J5BiY4UMTn6GsveYw8S/V6XHgS", // "password" hashed
      fullName: "Admin Johnson",
      role: "admin",
      email: "admin@blockvote.com",
      verificationData: {},
      publicKey: "",
      privateKey: ""
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { id, ...insertUser, verified: false };
    this.usersData.set(id, user);
    return user;
  }

  async verifyUser(id: number, verified: boolean): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, verified };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  // Election methods
  async getElection(id: number): Promise<Election | undefined> {
    return this.electionsData.get(id);
  }

  async getElectionByElectionId(electionId: string): Promise<Election | undefined> {
    return Array.from(this.electionsData.values()).find(
      (election) => election.electionId === electionId
    );
  }

  async getAllElections(): Promise<Election[]> {
    return Array.from(this.electionsData.values());
  }

  async getActiveElections(): Promise<Election[]> {
    return Array.from(this.electionsData.values())
      .filter(election => ['upcoming', 'in_progress'].includes(election.status));
  }

  async createElection(insertElection: InsertElection): Promise<Election> {
    const id = this.currentElectionId++;
    const election: Election = { id, ...insertElection, createdAt: new Date(), status: 'upcoming' };
    this.electionsData.set(id, election);
    return election;
  }

  async updateElectionStatus(id: number, status: string): Promise<Election | undefined> {
    const election = this.electionsData.get(id);
    if (!election) return undefined;
    
    const updatedElection: Election = { ...election, status };
    this.electionsData.set(id, updatedElection);
    return updatedElection;
  }

  // Ballot Item methods
  async getBallotItems(electionId: number): Promise<BallotItem[]> {
    return Array.from(this.ballotItemsData.values())
      .filter(item => item.electionId === electionId);
  }

  async createBallotItem(insertBallotItem: InsertBallotItem): Promise<BallotItem> {
    const id = this.currentBallotItemId++;
    const ballotItem: BallotItem = { id, ...insertBallotItem };
    this.ballotItemsData.set(id, ballotItem);
    return ballotItem;
  }

  // Blockchain methods
  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const id = this.currentBlockId++;
    const block: Block = { id, ...insertBlock };
    this.blocksData.set(id, block);
    
    // Update votes to reference this block
    for (const transactionId of insertBlock.transactions as string[]) {
      await this.updateVoteBlock(transactionId, insertBlock.blockId);
    }
    
    return block;
  }

  async getLatestBlock(): Promise<Block | undefined> {
    const blocks = Array.from(this.blocksData.values());
    if (blocks.length === 0) return undefined;
    
    // Sort by id in descending order and get the first one
    return blocks.sort((a, b) => b.id - a.id)[0];
  }

  async getBlock(blockId: string): Promise<Block | undefined> {
    return Array.from(this.blocksData.values()).find(
      (block) => block.blockId === blockId
    );
  }

  async getAllBlocks(limit?: number): Promise<Block[]> {
    const blocks = Array.from(this.blocksData.values())
      .sort((a, b) => b.id - a.id); // Sort by id in descending order
    
    return limit ? blocks.slice(0, limit) : blocks;
  }

  // Vote methods
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentVoteId++;
    const vote: Vote = { id, ...insertVote, blockId: null, timestamp: new Date() };
    this.votesData.set(id, vote);
    return vote;
  }

  async getVotesByElection(electionId: number): Promise<Vote[]> {
    return Array.from(this.votesData.values())
      .filter(vote => vote.electionId === electionId);
  }

  async getVoteByTransactionId(transactionId: string): Promise<Vote | undefined> {
    return Array.from(this.votesData.values()).find(
      (vote) => vote.transactionId === transactionId
    );
  }

  async updateVoteBlock(transactionId: string, blockId: string): Promise<Vote | undefined> {
    const vote = Array.from(this.votesData.values()).find(
      (v) => v.transactionId === transactionId
    );
    
    if (!vote) return undefined;
    
    const updatedVote: Vote = { ...vote, blockId };
    this.votesData.set(vote.id, updatedVote);
    return updatedVote;
  }

  // Audit logs
  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const id = this.currentAuditLogId++;
    const auditLog: AuditLog = { id, ...insertAuditLog, timestamp: new Date() };
    this.auditLogsData.set(id, auditLog);
    return auditLog;
  }

  async getRecentAuditLogs(limit?: number): Promise<AuditLog[]> {
    const logs = Array.from(this.auditLogsData.values())
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // Sort by timestamp in descending order
    
    return limit ? logs.slice(0, limit) : logs;
  }
}

export const storage = new MemStorage();
