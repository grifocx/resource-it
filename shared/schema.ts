import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  status: text("status").notNull().default("todo"), // "todo" | "in-progress" | "review" | "done"
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

export const insertWorkItemSchema = createInsertSchema(workItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
export const updateWorkItemSchema = insertWorkItemSchema.partial();
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