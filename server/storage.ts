import { 
  teams,
  teamMembers, 
  workItems, 
  allocations,
  outOfOffice,
  type Team,
  type TeamMember, 
  type WorkItem, 
  type Allocation,
  type OutOfOffice,
  type InsertTeam,
  type InsertTeamMember, 
  type InsertWorkItem, 
  type InsertAllocation,
  type InsertOutOfOffice,
  type UpdateTeam,
  type UpdateTeamMember,
  type UpdateWorkItem,
  type UpdateAllocation,
  type TeamWithMembers,
  type TeamMemberWithStats,
  type WorkItemWithAllocations,
  type AllocationWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Teams
  getTeams(): Promise<TeamWithMembers[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: UpdateTeam): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  // Team Members
  getTeamMembers(): Promise<TeamMemberWithStats[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: UpdateTeamMember): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;

  // Work Items
  getWorkItems(): Promise<WorkItemWithAllocations[]>;
  getWorkItem(id: string): Promise<WorkItem | undefined>;
  createWorkItem(item: InsertWorkItem): Promise<WorkItem>;
  updateWorkItem(id: string, updates: UpdateWorkItem): Promise<WorkItem | undefined>;
  deleteWorkItem(id: string): Promise<boolean>;

  // Allocations
  getAllocations(teamMemberId?: string, workItemId?: string): Promise<AllocationWithDetails[]>;
  createAllocation(allocation: InsertAllocation): Promise<Allocation>;
  updateAllocation(id: string, updates: UpdateAllocation): Promise<Allocation | undefined>;
  deleteAllocation(id: string): Promise<boolean>;

  // Out of Office
  getOutOfOffice(teamMemberId?: string): Promise<OutOfOffice[]>;
  createOutOfOffice(ooo: InsertOutOfOffice): Promise<OutOfOffice>;
  deleteOutOfOffice(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Teams
  async getTeams(): Promise<TeamWithMembers[]> {
    const teamsData = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        memberCount: sql<number>`COUNT(${teamMembers.id})`
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .groupBy(teams.id)
      .orderBy(teams.name);

    return teamsData.map(team => ({
      ...team,
      memberCount: Number(team.memberCount) || 0
    }));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values(team)
      .returning();
    return newTeam;
  }

  async updateTeam(id: string, updates: UpdateTeam): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam || undefined;
  }

  async deleteTeam(id: string): Promise<boolean> {
    // First, remove team assignment from all members
    await db
      .update(teamMembers)
      .set({ teamId: null })
      .where(eq(teamMembers.teamId, id));
    
    // Then delete the team
    const [deleted] = await db
      .delete(teams)
      .where(eq(teams.id, id))
      .returning();
    return !!deleted;
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMemberWithStats[]> {
    const members = await db
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        role: teamMembers.role,
        email: teamMembers.email,
        teamId: teamMembers.teamId,
        skills: teamMembers.skills,
        weeklyHours: teamMembers.weeklyHours,
        avatar: teamMembers.avatar,
        isActive: teamMembers.isActive,
        createdAt: teamMembers.createdAt,
        updatedAt: teamMembers.updatedAt,
        teamName: teams.name,
        allocatedHours: sql<number>`COALESCE(
          (SELECT SUM(${allocations.hoursPerWeek}) 
           FROM ${allocations} 
           WHERE ${allocations.teamMemberId} = ${teamMembers.id}
           AND ${allocations.startDate} <= NOW()
           AND (${allocations.endDate} IS NULL OR ${allocations.endDate} >= NOW())), 0
        )`
      })
      .from(teamMembers)
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.isActive, true))
      .orderBy(teamMembers.name);

    return members.map(member => {
      const allocatedHours = Number(member.allocatedHours) || 0;
      const availableHours = member.weeklyHours - allocatedHours;
      const capacityPercentage = member.weeklyHours > 0 
        ? Math.round((allocatedHours / member.weeklyHours) * 100) 
        : 0;

      return {
        ...member,
        teamName: member.teamName || undefined,
        allocatedHours,
        availableHours,
        capacityPercentage
      };
    });
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
    const [deleted] = await db
      .update(teamMembers)
      .set({ isActive: false })
      .where(eq(teamMembers.id, id))
      .returning();
    return !!deleted;
  }

  // Work Items
  async getWorkItems(): Promise<WorkItemWithAllocations[]> {
    const items = await db
      .select()
      .from(workItems)
      .orderBy(desc(workItems.createdAt));

    const itemsWithAllocations = await Promise.all(
      items.map(async (item) => {
        const itemAllocations = await db
          .select({
            id: allocations.id,
            teamMemberId: allocations.teamMemberId,
            workItemId: allocations.workItemId,
            hoursPerWeek: allocations.hoursPerWeek,
            startDate: allocations.startDate,
            endDate: allocations.endDate,
            notes: allocations.notes,
            createdAt: allocations.createdAt,
            updatedAt: allocations.updatedAt,
            teamMember: {
              id: teamMembers.id,
              name: teamMembers.name,
              avatar: teamMembers.avatar
            }
          })
          .from(allocations)
          .innerJoin(teamMembers, eq(allocations.teamMemberId, teamMembers.id))
          .where(eq(allocations.workItemId, item.id));

        const totalAllocatedHours = itemAllocations.reduce(
          (sum, alloc) => sum + Number(alloc.hoursPerWeek), 
          0
        );

        return {
          ...item,
          allocations: itemAllocations,
          totalAllocatedHours
        };
      })
    );

    return itemsWithAllocations;
  }

  async getWorkItem(id: string): Promise<WorkItem | undefined> {
    const [item] = await db.select().from(workItems).where(eq(workItems.id, id));
    return item || undefined;
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

  // Allocations
  async getAllocations(teamMemberId?: string, workItemId?: string): Promise<AllocationWithDetails[]> {
    let whereConditions = [];
    
    if (teamMemberId) {
      whereConditions.push(eq(allocations.teamMemberId, teamMemberId));
    }
    if (workItemId) {
      whereConditions.push(eq(allocations.workItemId, workItemId));
    }

    const query = db
      .select({
        id: allocations.id,
        teamMemberId: allocations.teamMemberId,
        workItemId: allocations.workItemId,
        hoursPerWeek: allocations.hoursPerWeek,
        startDate: allocations.startDate,
        endDate: allocations.endDate,
        notes: allocations.notes,
        createdAt: allocations.createdAt,
        updatedAt: allocations.updatedAt,
        workItem: {
          title: workItems.title,
          type: workItems.type,
          status: workItems.status
        },
        teamMember: {
          name: teamMembers.name,
          teamId: teamMembers.teamId
        }
      })
      .from(allocations)
      .innerJoin(workItems, eq(allocations.workItemId, workItems.id))
      .innerJoin(teamMembers, eq(allocations.teamMemberId, teamMembers.id))
      .orderBy(desc(allocations.startDate));

    if (whereConditions.length > 0) {
      return await query.where(and(...whereConditions));
    }

    return await query;
  }

  async createAllocation(allocation: InsertAllocation): Promise<Allocation> {
    const [newAllocation] = await db
      .insert(allocations)
      .values(allocation)
      .returning();
    return newAllocation;
  }

  async updateAllocation(id: string, updates: UpdateAllocation): Promise<Allocation | undefined> {
    const [updatedAllocation] = await db
      .update(allocations)
      .set(updates)
      .where(eq(allocations.id, id))
      .returning();
    return updatedAllocation || undefined;
  }

  async deleteAllocation(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(allocations)
      .where(eq(allocations.id, id))
      .returning();
    return !!deleted;
  }

  // Out of Office
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
}

export const storage = new DatabaseStorage();