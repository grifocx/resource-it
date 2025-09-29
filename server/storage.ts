import { 
  teamMembers, 
  workItems, 
  timeEntries, 
  outOfOffice,
  type TeamMember, 
  type WorkItem, 
  type TimeEntry,
  type OutOfOffice,
  type InsertTeamMember, 
  type InsertWorkItem, 
  type InsertTimeEntry,
  type InsertOutOfOffice,
  type UpdateTeamMember,
  type UpdateWorkItem,
  type TeamMemberWithStats,
  type WorkItemWithAssignee,
  type TimeEntryWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

// Storage interface for IT Resource Management
export interface IStorage {
  // Team Members
  getTeamMembers(): Promise<TeamMemberWithStats[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: UpdateTeamMember): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;

  // Work Items
  getWorkItems(): Promise<WorkItemWithAssignee[]>;
  getWorkItem(id: string): Promise<WorkItem | undefined>;
  getWorkItemsByAssignee(assigneeId: string): Promise<WorkItem[]>;
  createWorkItem(item: InsertWorkItem): Promise<WorkItem>;
  updateWorkItem(id: string, updates: UpdateWorkItem): Promise<WorkItem | undefined>;
  deleteWorkItem(id: string): Promise<boolean>;

  // Time Entries
  getTimeEntries(teamMemberId?: string, workItemId?: string): Promise<TimeEntryWithDetails[]>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  deleteTimeEntry(id: string): Promise<boolean>;

  // Out of Office
  getOutOfOffice(teamMemberId?: string): Promise<OutOfOffice[]>;
  createOutOfOffice(ooo: InsertOutOfOffice): Promise<OutOfOffice>;
  deleteOutOfOffice(id: string): Promise<boolean>;

  // Analytics
  getTeamStats(): Promise<{
    totalMembers: number;
    averageCapacity: number;
    projectHours: number;
    omHours: number;
    overallocatedMembers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getTeamMembers(): Promise<TeamMemberWithStats[]> {
    const members = await db
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        role: teamMembers.role,
        email: teamMembers.email,
        skills: teamMembers.skills,
        weeklyHours: teamMembers.weeklyHours,
        currentCapacity: teamMembers.currentCapacity,
        avatar: teamMembers.avatar,
        isActive: teamMembers.isActive,
        createdAt: teamMembers.createdAt,
        updatedAt: teamMembers.updatedAt,
        assignedHours: sql<number>`COALESCE(
          (SELECT SUM(${workItems.estimatedHours}) 
           FROM ${workItems} 
           WHERE ${workItems.assignedToId} = ${teamMembers.id} 
           AND ${workItems.status} != 'done'), 0
        )`,
        currentProject: sql<string>`(
          SELECT ${workItems.title}
          FROM ${workItems}
          WHERE ${workItems.assignedToId} = ${teamMembers.id}
          AND ${workItems.status} = 'in-progress'
          LIMIT 1
        )`
      })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true));

    return members.map(member => ({
      ...member,
      assignedHours: Number(member.assignedHours) || 0,
      currentProject: member.currentProject || undefined
    }));
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async updateTeamMember(id: string, updates: UpdateTeamMember): Promise<TeamMember | undefined> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set(updates)
      .where(eq(teamMembers.id, id))
      .returning();
    return updatedMember || undefined;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    // Soft delete by setting isActive to false
    const [deleted] = await db
      .update(teamMembers)
      .set({ isActive: false })
      .where(eq(teamMembers.id, id))
      .returning();
    return !!deleted;
  }

  async getWorkItems(): Promise<WorkItemWithAssignee[]> {
    const items = await db
      .select({
        id: workItems.id,
        title: workItems.title,
        description: workItems.description,
        type: workItems.type,
        priority: workItems.priority,
        status: workItems.status,
        estimatedHours: workItems.estimatedHours,
        actualHours: workItems.actualHours,
        assignedToId: workItems.assignedToId,
        dueDate: workItems.dueDate,
        createdAt: workItems.createdAt,
        updatedAt: workItems.updatedAt,
        assignedTo: {
          id: teamMembers.id,
          name: teamMembers.name,
          avatar: teamMembers.avatar
        }
      })
      .from(workItems)
      .leftJoin(teamMembers, eq(workItems.assignedToId, teamMembers.id))
      .orderBy(desc(workItems.createdAt));

    return items.map(item => ({
      ...item,
      assignedTo: item.assignedTo?.id ? item.assignedTo : undefined
    }));
  }

  async getWorkItem(id: string): Promise<WorkItem | undefined> {
    const [item] = await db.select().from(workItems).where(eq(workItems.id, id));
    return item || undefined;
  }

  async getWorkItemsByAssignee(assigneeId: string): Promise<WorkItem[]> {
    return await db
      .select()
      .from(workItems)
      .where(eq(workItems.assignedToId, assigneeId))
      .orderBy(desc(workItems.createdAt));
  }

  async createWorkItem(item: InsertWorkItem): Promise<WorkItem> {
    const [newItem] = await db
      .insert(workItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateWorkItem(id: string, updates: UpdateWorkItem): Promise<WorkItem | undefined> {
    const [updatedItem] = await db
      .update(workItems)
      .set(updates)
      .where(eq(workItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteWorkItem(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(workItems)
      .where(eq(workItems.id, id))
      .returning();
    return !!deleted;
  }

  async getTimeEntries(teamMemberId?: string, workItemId?: string): Promise<TimeEntryWithDetails[]> {
    let whereConditions = [];
    
    if (teamMemberId) {
      whereConditions.push(eq(timeEntries.teamMemberId, teamMemberId));
    }
    if (workItemId) {
      whereConditions.push(eq(timeEntries.workItemId, workItemId));
    }

    const query = db
      .select({
        id: timeEntries.id,
        teamMemberId: timeEntries.teamMemberId,
        workItemId: timeEntries.workItemId,
        hours: timeEntries.hours,
        description: timeEntries.description,
        date: timeEntries.date,
        createdAt: timeEntries.createdAt,
        workItem: {
          title: workItems.title,
          type: workItems.type
        },
        teamMember: {
          name: teamMembers.name
        }
      })
      .from(timeEntries)
      .innerJoin(workItems, eq(timeEntries.workItemId, workItems.id))
      .innerJoin(teamMembers, eq(timeEntries.teamMemberId, teamMembers.id))
      .orderBy(desc(timeEntries.date));

    if (whereConditions.length > 0) {
      return await query.where(and(...whereConditions));
    }

    return await query;
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const [newEntry] = await db
      .insert(timeEntries)
      .values(entry)
      .returning();

    // Update actual hours on the work item
    await db
      .update(workItems)
      .set({
        actualHours: sql`${workItems.actualHours} + ${entry.hours}`
      })
      .where(eq(workItems.id, entry.workItemId));

    return newEntry;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(timeEntries)
      .where(eq(timeEntries.id, id))
      .returning();
    return !!deleted;
  }

  async getOutOfOffice(teamMemberId?: string): Promise<OutOfOffice[]> {
    const baseQuery = db
      .select()
      .from(outOfOffice)
      .orderBy(desc(outOfOffice.startDate));

    if (teamMemberId) {
      return await baseQuery.where(eq(outOfOffice.teamMemberId, teamMemberId));
    }

    return await baseQuery;
  }

  async createOutOfOffice(ooo: InsertOutOfOffice): Promise<OutOfOffice> {
    const [newOoo] = await db
      .insert(outOfOffice)
      .values(ooo)
      .returning();
    return newOoo;
  }

  async deleteOutOfOffice(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(outOfOffice)
      .where(eq(outOfOffice.id, id))
      .returning();
    return !!deleted;
  }

  async getTeamStats(): Promise<{
    totalMembers: number;
    averageCapacity: number;
    projectHours: number;
    omHours: number;
    overallocatedMembers: number;
  }> {
    // Get basic team stats
    const teamStats = await db
      .select({
        totalMembers: sql<number>`COUNT(*)`,
        averageCapacity: sql<number>`AVG(${teamMembers.currentCapacity})`,
        overallocatedMembers: sql<number>`COUNT(CASE WHEN ${teamMembers.currentCapacity} >= 90 THEN 1 END)`
      })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true));

    // Get work hours by type
    const workStats = await db
      .select({
        type: workItems.type,
        totalHours: sql<number>`SUM(${workItems.actualHours})`
      })
      .from(workItems)
      .groupBy(workItems.type);

    const projectHours = workStats.find(s => s.type === 'project')?.totalHours || 0;
    const omHours = workStats.find(s => s.type === 'om')?.totalHours || 0;

    return {
      totalMembers: Number(teamStats[0]?.totalMembers) || 0,
      averageCapacity: Math.round(Number(teamStats[0]?.averageCapacity)) || 0,
      projectHours: Number(projectHours),
      omHours: Number(omHours),
      overallocatedMembers: Number(teamStats[0]?.overallocatedMembers) || 0
    };
  }
}

export const storage = new DatabaseStorage();