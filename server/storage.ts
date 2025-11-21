import {
  type Transaction,
  type InsertTransaction,
  type UserNode,
  type InsertUserNode,
  type BlockchainBlock,
  type InsertBlockchainBlock,
  type TrustScoreHistory,
  type DashboardStats,
} from "@shared/schema";
import { randomUUID } from "crypto";
import * as crypto from "crypto";

export interface IStorage {
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByStatus(status: string): Promise<Transaction[]>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  
  // User/Node methods
  createUserNode(node: InsertUserNode): Promise<UserNode>;
  getUserNode(address: string): Promise<UserNode | undefined>;
  updateUserNode(address: string, updates: Partial<UserNode>): Promise<UserNode | undefined>;
  getAllUserNodes(): Promise<UserNode[]>;
  
  // Blockchain methods
  createBlock(block: InsertBlockchainBlock): Promise<BlockchainBlock>;
  getLatestBlock(): Promise<BlockchainBlock | undefined>;
  getAllBlocks(): Promise<BlockchainBlock[]>;
  
  // Trust score history
  addTrustScoreHistory(userId: string, score: number): Promise<TrustScoreHistory>;
  getTrustScoreHistory(userId: string, limit?: number): Promise<TrustScoreHistory[]>;
  
  // Analytics
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private userNodes: Map<string, UserNode>;
  private blocks: Map<number, BlockchainBlock>;
  private trustScoreHistory: Map<string, TrustScoreHistory[]>;
  private blockCounter: number;

  constructor() {
    this.transactions = new Map();
    this.userNodes = new Map();
    this.blocks = new Map();
    this.trustScoreHistory = new Map();
    this.blockCounter = 0;
    
    // Initialize with genesis block
    this.initializeGenesisBlock();
    
    // Initialize default user node
    this.initializeDefaultUser();
  }

  private initializeGenesisBlock() {
    const genesisBlock: BlockchainBlock = {
      id: randomUUID(),
      blockNumber: 0,
      timestamp: new Date(),
      previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
      blockHash: this.generateHash("genesis"),
      transactionCount: 0,
      merkleRoot: this.generateHash("genesis-merkle"),
    };
    this.blocks.set(0, genesisBlock);
  }

  private initializeDefaultUser() {
    const defaultUser: UserNode = {
      id: randomUUID(),
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
      trustScore: "100.00",
      transactionCount: 0,
      flaggedCount: 0,
      lastUpdated: new Date(),
    };
    this.userNodes.set(defaultUser.address, defaultUser);
  }

  private generateHash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private calculateFraudScore(transaction: InsertTransaction): number {
    let score = parseFloat(transaction.fraudScore || "0");
    
    // Apply rule-based fraud detection
    const amount = parseFloat(transaction.amount);
    
    // High amount transactions are riskier
    if (amount > 10000) score += 30;
    else if (amount > 5000) score += 15;
    else if (amount > 1000) score += 5;
    
    // Round trip transactions (same user and recipient)
    if (transaction.userId === transaction.recipient) {
      score += 50;
    }
    
    // If manually marked as fraudulent
    if (transaction.isFraudulent) {
      score = Math.max(score, 85);
    }
    
    return Math.min(Math.max(score, 0), 100);
  }

  private updateUserTrustScore(userId: string, isFraud: boolean): void {
    const user = this.userNodes.get(userId);
    if (!user) return;

    const currentScore = parseFloat(user.trustScore);
    let newScore = currentScore;

    if (isFraud) {
      // Decrease trust score for fraudulent transactions
      newScore = Math.max(0, currentScore - 10);
      user.flaggedCount++;
    } else {
      // Slightly increase trust score for legitimate transactions
      newScore = Math.min(100, currentScore + 0.5);
    }

    user.trustScore = newScore.toFixed(2);
    user.transactionCount++;
    user.lastUpdated = new Date();
    
    this.userNodes.set(userId, user);
    this.addTrustScoreHistory(userId, newScore);
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const fraudScore = this.calculateFraudScore(insertTransaction);
    const isFraudulent = fraudScore >= 70;
    const status = isFraudulent ? "flagged" : insertTransaction.status || "verified";
    
    const transactionData = {
      ...insertTransaction,
      amount: insertTransaction.amount,
      fraudScore: fraudScore.toFixed(2),
      isFraudulent,
      status,
    };
    
    const transactionHash = this.generateHash(
      `${insertTransaction.userId}-${insertTransaction.amount}-${Date.now()}`
    );

    const transaction: Transaction = {
      id,
      ...transactionData,
      transactionHash,
      timestamp: new Date(),
    };

    this.transactions.set(id, transaction);
    
    // Update user trust score
    const user = this.userNodes.get(insertTransaction.userId);
    if (!user) {
      // Create new user if doesn't exist
      await this.createUserNode({
        address: insertTransaction.userId,
        trustScore: "100",
        transactionCount: 0,
        flaggedCount: 0,
      });
    }
    this.updateUserTrustScore(insertTransaction.userId, isFraudulent);
    
    // Create new block every 5 transactions
    if (this.transactions.size % 5 === 0) {
      await this.createBlockFromPendingTransactions();
    }

    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.status === status)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // User/Node methods
  async createUserNode(insertNode: InsertUserNode): Promise<UserNode> {
    const id = randomUUID();
    const node: UserNode = {
      id,
      address: insertNode.address,
      trustScore: insertNode.trustScore || "100",
      transactionCount: insertNode.transactionCount || 0,
      flaggedCount: insertNode.flaggedCount || 0,
      lastUpdated: new Date(),
    };

    this.userNodes.set(node.address, node);
    return node;
  }

  async getUserNode(address: string): Promise<UserNode | undefined> {
    return this.userNodes.get(address);
  }

  async updateUserNode(address: string, updates: Partial<UserNode>): Promise<UserNode | undefined> {
    const node = this.userNodes.get(address);
    if (!node) return undefined;

    const updated = { ...node, ...updates, lastUpdated: new Date() };
    this.userNodes.set(address, updated);
    return updated;
  }

  async getAllUserNodes(): Promise<UserNode[]> {
    return Array.from(this.userNodes.values());
  }

  // Blockchain methods
  private async createBlockFromPendingTransactions(): Promise<BlockchainBlock> {
    const latestBlock = await this.getLatestBlock();
    const previousHash = latestBlock?.blockHash || "0";
    const blockNumber = this.blockCounter + 1;
    
    const blockData = `${blockNumber}-${previousHash}-${Date.now()}`;
    const blockHash = this.generateHash(blockData);
    const merkleRoot = this.generateHash(`merkle-${blockNumber}`);

    const block: InsertBlockchainBlock = {
      blockNumber,
      previousHash,
      blockHash,
      transactionCount: 5,
      merkleRoot,
    };

    return this.createBlock(block);
  }

  async createBlock(insertBlock: InsertBlockchainBlock): Promise<BlockchainBlock> {
    const id = randomUUID();
    const block: BlockchainBlock = {
      id,
      ...insertBlock,
      timestamp: new Date(),
    };

    this.blocks.set(block.blockNumber, block);
    this.blockCounter = Math.max(this.blockCounter, block.blockNumber);
    return block;
  }

  async getLatestBlock(): Promise<BlockchainBlock | undefined> {
    if (this.blockCounter === 0 && this.blocks.size === 1) {
      return this.blocks.get(0);
    }
    return this.blocks.get(this.blockCounter);
  }

  async getAllBlocks(): Promise<BlockchainBlock[]> {
    return Array.from(this.blocks.values()).sort(
      (a, b) => a.blockNumber - b.blockNumber
    );
  }

  // Trust score history
  async addTrustScoreHistory(userId: string, score: number): Promise<TrustScoreHistory> {
    const history: TrustScoreHistory = {
      id: randomUUID(),
      userId,
      trustScore: score.toFixed(2),
      timestamp: new Date(),
    };

    if (!this.trustScoreHistory.has(userId)) {
      this.trustScoreHistory.set(userId, []);
    }

    const userHistory = this.trustScoreHistory.get(userId)!;
    userHistory.push(history);
    
    // Keep only last 20 entries
    if (userHistory.length > 20) {
      userHistory.shift();
    }

    return history;
  }

  async getTrustScoreHistory(userId: string, limit: number = 10): Promise<TrustScoreHistory[]> {
    const history = this.trustScoreHistory.get(userId) || [];
    return history.slice(-limit);
  }

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const allTransactions = await this.getAllTransactions();
    const flaggedTransactions = allTransactions.filter((t) => t.status === "flagged");
    
    const allUsers = await this.getAllUserNodes();
    const totalTrustScore = allUsers.reduce(
      (sum, user) => sum + parseFloat(user.trustScore),
      0
    );
    const averageTrustScore = allUsers.length > 0 ? totalTrustScore / allUsers.length : 100;

    return {
      totalTransactions: allTransactions.length,
      flaggedCases: flaggedTransactions.length,
      averageTrustScore: parseFloat(averageTrustScore.toFixed(2)),
      activeAlerts: flaggedTransactions.filter(
        (t) => new Date().getTime() - t.timestamp.getTime() < 3600000
      ).length,
    };
  }
}

export const storage = new MemStorage();
