import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PostgreSQL enums for work item statuses
export const demandStatusEnum = pgEnum("demand_status", [
  "draft",
  "submitted",
  "screened",
  "qualified-approved",
  "complete",
  "deferred",
  "rejected"
]);

export const projectStatusEnum = pgEnum("project_status", [
  "initiating",
  "planning",
  "executing",
  "delivering",
  "closing"
]);

export const omStatusEnum = pgEnum("om_status", [
  "planned",
  "active",
  "on-hold",
  "completed"
]);

// Status arrays for helper functions
export const demandStatuses = [
  "draft",
  "submitted",
  "screened",
  "qualified-approved",
  "complete",
  "deferred",
  "rejected"
] as const;

export const projectStatuses = [
  "initiating",
  "planning",
  "executing",
  "delivering",
  "closing"
] as const;

export const omStatuses = [
  "planned",
  "active",
  "on-hold",
  "completed"
] as const;

export type DemandStatus = typeof demandStatuses[number];
export type ProjectStatus = typeof projectStatuses[number];
export type OMStatus = typeof omStatuses[number];
export type WorkItemStatus = DemandStatus | ProjectStatus | OMStatus;

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team Members table
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull().unique(),
  teamId: varchar("team_id").references(() => teams.id),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  weeklyHours: integer("weekly_hours").notNull().default(40),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Work Items table - supports Demands, Projects, and O&M
export const workItems = pgTable("work_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  type: text("type").notNull(), // "demand" | "project" | "om"
  priority: text("priority").notNull().default("normal"), // "critical" | "high" | "normal" | "low"
  status: text("status").notNull(), // Status depends on type - see validation below
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }).notNull().default("0"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Allocations table - forecasts weekly hours per person per work item
export const allocations = pgTable("allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").references(() => teamMembers.id).notNull(),
  workItemId: varchar("work_item_id").references(() => workItems.id).notNull(),
  hoursPerWeek: decimal("hours_per_week", { precision: 4, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Out of Office table
export const outOfOffice = pgTable("out_of_office", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").references(() => teamMembers.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason").notNull().default("Out of office"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for validation
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Custom validation for work items with type-specific status
const baseInsertWorkItemSchema = createInsertSchema(workItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkItemSchema = baseInsertWorkItemSchema.refine(
  (data) => {
    // Validate status matches work item type
    if (data.type === "demand") {
      return demandStatuses.includes(data.status as DemandStatus);
    } else if (data.type === "project") {
      return projectStatuses.includes(data.status as ProjectStatus);
    } else if (data.type === "om") {
      return omStatuses.includes(data.status as OMStatus);
    }
    return false;
  },
  {
    message: "Invalid status for the selected work item type",
    path: ["status"],
  }
);

export const insertAllocationSchema = createInsertSchema(allocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOutOfOfficeSchema = createInsertSchema(outOfOffice).omit({
  id: true,
  createdAt: true,
});

// Update schemas
export const updateTeamSchema = insertTeamSchema.partial();
export const updateTeamMemberSchema = insertTeamMemberSchema.partial();
export const updateWorkItemSchema = baseInsertWorkItemSchema.partial().refine(
  (data) => {
    // Only validate if both type and status are provided
    if (!data.type || !data.status) return true;
    
    // Validate status matches work item type
    if (data.type === "demand") {
      return demandStatuses.includes(data.status as DemandStatus);
    } else if (data.type === "project") {
      return projectStatuses.includes(data.status as ProjectStatus);
    } else if (data.type === "om") {
      return omStatuses.includes(data.status as OMStatus);
    }
    return false;
  },
  {
    message: "Invalid status for the selected work item type",
    path: ["status"],
  }
);
export const updateAllocationSchema = insertAllocationSchema.partial();

// Types
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertWorkItem = z.infer<typeof insertWorkItemSchema>;
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type InsertOutOfOffice = z.infer<typeof insertOutOfOfficeSchema>;

export type UpdateTeam = z.infer<typeof updateTeamSchema>;
export type UpdateTeamMember = z.infer<typeof updateTeamMemberSchema>;
export type UpdateWorkItem = z.infer<typeof updateWorkItemSchema>;
export type UpdateAllocation = z.infer<typeof updateAllocationSchema>;

export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type WorkItem = typeof workItems.$inferSelect;
export type Allocation = typeof allocations.$inferSelect;
export type OutOfOffice = typeof outOfOffice.$inferSelect;

// Extended types with relations
export type TeamWithMembers = Team & {
  memberCount: number;
};

export type TeamMemberWithStats = TeamMember & {
  teamName?: string;
  allocatedHours: number; // sum of forecasted hours/week
  availableHours: number; // weeklyHours - allocatedHours
  capacityPercentage: number; // (allocatedHours / weeklyHours) * 100
};

export type WorkItemWithAllocations = WorkItem & {
  allocations: (Allocation & {
    teamMember: Pick<TeamMember, "id" | "name" | "avatar">;
  })[];
  totalAllocatedHours: number;
};

export type AllocationWithDetails = Allocation & {
  workItem: Pick<WorkItem, "title" | "type" | "status">;
  teamMember: Pick<TeamMember, "name" | "teamId">;
};

// Helper functions for work item status
export function getValidStatusesForType(type: string): readonly string[] {
  switch (type) {
    case "demand":
      return demandStatuses;
    case "project":
      return projectStatuses;
    case "om":
      return omStatuses;
    default:
      return [];
  }
}

export function getDefaultStatusForType(type: string): string {
  switch (type) {
    case "demand":
      return "draft";
    case "project":
      return "initiating";
    case "om":
      return "planned";
    default:
      return "draft";
  }
}

export function formatStatusLabel(status: string): string {
  return status
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}