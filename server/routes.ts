import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTeamMemberSchema, 
  updateTeamMemberSchema,
  insertWorkItemSchema,
  updateWorkItemSchema,
  insertTimeEntrySchema,
  insertOutOfOfficeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Team Members routes
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/team-members/:id", async (req, res) => {
    try {
      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to create team member" });
      }
    }
  });

  app.patch("/api/team-members/:id", async (req, res) => {
    try {
      const validatedData = updateTeamMemberSchema.parse(req.body);
      const member = await storage.updateTeamMember(req.params.id, validatedData);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to update team member" });
      }
    }
  });

  app.delete("/api/team-members/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeamMember(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  // Work Items routes
  app.get("/api/work-items", async (req, res) => {
    try {
      const items = await storage.getWorkItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching work items:", error);
      res.status(500).json({ error: "Failed to fetch work items" });
    }
  });

  app.get("/api/work-items/:id", async (req, res) => {
    try {
      const item = await storage.getWorkItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Work item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching work item:", error);
      res.status(500).json({ error: "Failed to fetch work item" });
    }
  });

  app.get("/api/work-items/assignee/:assigneeId", async (req, res) => {
    try {
      const items = await storage.getWorkItemsByAssignee(req.params.assigneeId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching work items by assignee:", error);
      res.status(500).json({ error: "Failed to fetch work items" });
    }
  });

  app.post("/api/work-items", async (req, res) => {
    try {
      const validatedData = insertWorkItemSchema.parse(req.body);
      const item = await storage.createWorkItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating work item:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to create work item" });
      }
    }
  });

  app.patch("/api/work-items/:id", async (req, res) => {
    try {
      const validatedData = updateWorkItemSchema.parse(req.body);
      const item = await storage.updateWorkItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ error: "Work item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating work item:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to update work item" });
      }
    }
  });

  app.delete("/api/work-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Work item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting work item:", error);
      res.status(500).json({ error: "Failed to delete work item" });
    }
  });

  // Time Entries routes
  app.get("/api/time-entries", async (req, res) => {
    try {
      const { teamMemberId, workItemId } = req.query;
      const entries = await storage.getTimeEntries(
        teamMemberId as string, 
        workItemId as string
      );
      res.json(entries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ error: "Failed to fetch time entries" });
    }
  });

  app.post("/api/time-entries", async (req, res) => {
    try {
      const validatedData = insertTimeEntrySchema.parse(req.body);
      const entry = await storage.createTimeEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to create time entry" });
      }
    }
  });

  app.delete("/api/time-entries/:id", async (req, res) => {
    try {
      const success = await storage.deleteTimeEntry(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Time entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      res.status(500).json({ error: "Failed to delete time entry" });
    }
  });

  // Out of Office routes
  app.get("/api/out-of-office", async (req, res) => {
    try {
      const { teamMemberId } = req.query;
      const entries = await storage.getOutOfOffice(teamMemberId as string);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching out of office:", error);
      res.status(500).json({ error: "Failed to fetch out of office entries" });
    }
  });

  app.post("/api/out-of-office", async (req, res) => {
    try {
      const validatedData = insertOutOfOfficeSchema.parse(req.body);
      const entry = await storage.createOutOfOffice(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating out of office:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to create out of office entry" });
      }
    }
  });

  app.delete("/api/out-of-office/:id", async (req, res) => {
    try {
      const success = await storage.deleteOutOfOffice(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Out of office entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting out of office:", error);
      res.status(500).json({ error: "Failed to delete out of office entry" });
    }
  });

  // Analytics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getTeamStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}