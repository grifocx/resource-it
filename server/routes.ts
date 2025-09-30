import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTeamSchema,
  updateTeamSchema,
  insertTeamMemberSchema, 
  updateTeamMemberSchema,
  insertWorkItemSchema,
  updateWorkItemSchema,
  insertAllocationSchema,
  updateAllocationSchema,
  insertOutOfOfficeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Teams routes
  app.get("/api/teams", async (req, res) => {
    try {
      const teamsData = await storage.getTeams();
      res.json(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to create team" });
      }
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const validatedData = updateTeamSchema.parse(req.body);
      const team = await storage.updateTeam(req.params.id, validatedData);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      console.error("Error updating team:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to update team" });
      }
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeam(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

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

  // Allocations routes
  app.get("/api/allocations", async (req, res) => {
    try {
      const { teamMemberId, workItemId } = req.query;
      const allocationsData = await storage.getAllocations(
        teamMemberId as string, 
        workItemId as string
      );
      res.json(allocationsData);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      res.status(500).json({ error: "Failed to fetch allocations" });
    }
  });

  app.post("/api/allocations", async (req, res) => {
    try {
      const validatedData = insertAllocationSchema.parse(req.body);
      const allocation = await storage.createAllocation(validatedData);
      res.status(201).json(allocation);
    } catch (error) {
      console.error("Error creating allocation:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to create allocation" });
      }
    }
  });

  app.patch("/api/allocations/:id", async (req, res) => {
    try {
      const validatedData = updateAllocationSchema.parse(req.body);
      const allocation = await storage.updateAllocation(req.params.id, validatedData);
      if (!allocation) {
        return res.status(404).json({ error: "Allocation not found" });
      }
      res.json(allocation);
    } catch (error) {
      console.error("Error updating allocation:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(422).json({ error: "Invalid data provided" });
      } else {
        res.status(500).json({ error: "Failed to update allocation" });
      }
    }
  });

  app.delete("/api/allocations/:id", async (req, res) => {
    try {
      const success = await storage.deleteAllocation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Allocation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting allocation:", error);
      res.status(500).json({ error: "Failed to delete allocation" });
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

  const httpServer = createServer(app);
  return httpServer;
}