import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import TeamMemberCard from "@/components/TeamMemberCard";
import TeamMemberForm from "@/components/TeamMemberForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TeamMemberWithStats, InsertTeamMember, TeamMember } from "@shared/schema";

export default function Team() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const { toast } = useToast();

  // Fetch team members from API
  const { data: teamMembers = [], isLoading, error } = useQuery<TeamMemberWithStats[]>({
    queryKey: ["/api", "team-members"],
  });

  // Create team member mutation
  const createMemberMutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      const response = await apiRequest("POST", "/api/team-members", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "team-members"] });
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create team member:", error);
    },
  });

  // Update team member mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTeamMember> }) => {
      const response = await apiRequest("PATCH", `/api/team-members/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "team-members"] });
      setEditingMember(null);
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update team member:", error);
    },
  });

  const handleSaveMember = (data: InsertTeamMember) => {
    if (editingMember) {
      updateMemberMutation.mutate({ id: editingMember.id, data });
    } else {
      createMemberMutation.mutate(data);
    }
  };

  const handleEditMember = (member: TeamMemberWithStats) => {
    // Convert TeamMemberWithStats to TeamMember for editing
    const teamMember: TeamMember = {
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      skills: member.skills,
      weeklyHours: member.weeklyHours,
      currentCapacity: member.currentCapacity,
      avatar: member.avatar,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
    setEditingMember(teamMember);
  };

  if (error) {
    return (
      <div className="p-6" data-testid="team-page">
        <div className="text-center text-destructive">
          Failed to load team members. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="team-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage team capacity and view current assignments
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          data-testid="button-add-team-member"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading team members...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <TeamMemberCard 
              key={member.id} 
              member={member}
              onClick={() => handleEditMember(member)}
            />
          ))}
          {teamMembers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No team members found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Team Member
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <TeamMemberForm
            onSave={handleSaveMember}
            onCancel={() => setShowAddDialog(false)}
            isLoading={createMemberMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <TeamMemberForm
              member={editingMember}
              onSave={handleSaveMember}
              onCancel={() => setEditingMember(null)}
              isLoading={updateMemberMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}