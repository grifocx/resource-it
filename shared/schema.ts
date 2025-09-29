import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Team Members table
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull().unique(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  weeklyHours: integer("weekly_hours").notNull().default(40),
  currentCapacity: integer("current_capacity").notNull().default(80), // percentage
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Work Items table  
export const workItems = pgTable("work_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  type: text("type").notNull(), // "project" | "om"
  priority: text("priority").notNull().default("normal"), // "critical" | "high" | "normal" | "low"
  status: text("status").notNull().default("todo"), // "todo" | "in-progress" | "review" | "done"
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }).notNull().default("0"),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }).notNull().default("0"),
  assignedToId: varchar("assigned_to_id").references(() => teamMembers.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Time Entries table
export const timeEntries = pgTable("time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").references(() => teamMembers.id).notNull(),
  workItemId: varchar("work_item_id").references(() => workItems.id).notNull(),
  hours: decimal("hours", { precision: 4, scale: 2 }).notNull(),
  description: text("description").notNull().default(""),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkItemSchema = createInsertSchema(workItems).omit({
  id: true,
  actualHours: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

export const insertOutOfOfficeSchema = createInsertSchema(outOfOffice).omit({
  id: true,
  createdAt: true,
});

// Update schemas
export const updateTeamMemberSchema = insertTeamMemberSchema.partial();
export const updateWorkItemSchema = insertWorkItemSchema.partial();

// Types
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertWorkItem = z.infer<typeof insertWorkItemSchema>;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type InsertOutOfOffice = z.infer<typeof insertOutOfOfficeSchema>;
export type UpdateTeamMember = z.infer<typeof updateTeamMemberSchema>;
export type UpdateWorkItem = z.infer<typeof updateWorkItemSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type WorkItem = typeof workItems.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type OutOfOffice = typeof outOfOffice.$inferSelect;

// Extended types with relations
export type WorkItemWithAssignee = WorkItem & {
  assignedTo?: Pick<TeamMember, "id" | "name" | "avatar">;
};

export type TeamMemberWithStats = TeamMember & {
  assignedHours: number;
  currentProject?: string;
};

export type TimeEntryWithDetails = TimeEntry & {
  workItem: Pick<WorkItem, "title" | "type">;
  teamMember: Pick<TeamMember, "name">;
};

// Remove old user schema that's no longer needed
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;