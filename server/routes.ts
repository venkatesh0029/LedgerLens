import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { format, subDays } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard statistics
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get all transactions or filter by status
  app.get("/api/transactions", async (req, res) => {
    try {
      const { status } = req.query;

      let transactions;
      if (status && status !== "all") {
        transactions = await storage.getTransactionsByStatus(status as string);
      } else {
        transactions = await storage.getAllTransactions();
      }

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get single transaction
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  // Create new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // Get user trust score
  app.get("/api/trust-score", async (req, res) => {
    try {
      const { address } = req.query;
      let user;

      if (address) {
        user = await storage.getUserNode(address as string);
      }

      // Fallback
      if (!user) {
        const users = await storage.getAllUserNodes();
        user = users.length > 0 ? users[0] : undefined;
      }

      if (!user) {
        return res.json({
          trustScore: "100",
          address: "0x0000...0000",
          transactionCount: 0,
          flaggedCount: 0,
        });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trust score" });
    }
  });

  // Get user by address
  app.get("/api/users/:address", async (req, res) => {
    try {
      const user = await storage.getUserNode(req.params.address);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get blockchain blocks
  app.get("/api/blockchain/blocks", async (_req, res) => {
    try {
      const blocks = await storage.getAllBlocks();
      // Return last 10 blocks
      const recentBlocks = blocks.slice(-10);
      res.json(recentBlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });

  // Get fraud detection statistics for chart
  app.get("/api/analytics/fraud-stats", async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();

      // Group by last 7 days
      const stats = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "MMM dd");

        const dayTransactions = transactions.filter(t => {
          const txDate = new Date(t.timestamp);
          return format(txDate, "MMM dd") === dateStr;
        });

        stats.push({
          date: dateStr,
          verified: dayTransactions.filter(t => t.status === "verified").length,
          flagged: dayTransactions.filter(t => t.status === "flagged").length,
          pending: dayTransactions.filter(t => t.status === "pending").length,
        });
      }

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fraud statistics" });
    }
  });

  // Get trust score trend
  app.get("/api/analytics/trust-trend", async (req, res) => {
    try {
      const { address } = req.query;
      let user;

      if (address) {
        user = await storage.getUserNode(address as string);
      }

      if (!user) {
        const users = await storage.getAllUserNodes();
        user = users.length > 0 ? users[0] : undefined;
      }

      if (!user) {
        return res.json([]);
      }

      const history = await storage.getTrustScoreHistory(user.address, 20);

      const trendData = history.map(h => ({
        timestamp: format(new Date(h.timestamp), "HH:mm"),
        score: parseFloat(h.trustScore),
      }));

      // If no history, generate sample data based on current score
      if (trendData.length === 0) {
        const currentScore = parseFloat(user.trustScore);
        for (let i = 9; i >= 0; i--) {
          trendData.push({
            timestamp: format(subDays(new Date(), i), "MMM dd"),
            score: currentScore,
          });
        }
      }

      res.json(trendData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trust trend" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
