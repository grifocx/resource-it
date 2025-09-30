import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Users, 
  Workflow,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react";
import type { TeamMemberWithStats, WorkItemWithAllocations, TeamWithMembers } from "@shared/schema";

export default function MainDashboard() {
  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery<TeamMemberWithStats[]>({
    queryKey: ["/api", "team-members"],
  });

  const { data: workItems = [], isLoading: loadingWorkItems } = useQuery<WorkItemWithAllocations[]>({
    queryKey: ["/api", "work-items"],
  });

  const { data: teams = [], isLoading: loadingTeams } = useQuery<TeamWithMembers[]>({
    queryKey: ["/api", "teams"],
  });

  // Calculate statistics
  const avgCapacity = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((sum, m) => sum + m.capacityPercentage, 0) / teamMembers.length)
    : 0;

  const overAllocated = teamMembers.filter(m => m.capacityPercentage >= 100).length;
  const totalAllocatedHours = teamMembers.reduce((sum, m) => sum + m.allocatedHours, 0);
  const activeWorkItems = workItems.filter(w => w.status === 'in-progress' || w.status === 'planned').length;

  const isLoading = loadingMembers || loadingWorkItems || loadingTeams;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="main-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IT Resource Manager</h1>
          <p className="text-muted-foreground">
            Track team capacity and manage resource allocation forecasts
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold" data-testid="stat-team-members">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold" data-testid="stat-avg-capacity">{avgCapacity}%</div>
                <p className="text-xs text-muted-foreground">Avg Capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold" data-testid="stat-active-items">{activeWorkItems}</div>
                <p className="text-xs text-muted-foreground">Active Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold" data-testid="stat-allocated-hours">{totalAllocatedHours}h</div>
                <p className="text-xs text-muted-foreground">Allocated/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Capacity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold">Team Capacity</CardTitle>
            {overAllocated > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {overAllocated} over-allocated
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No team members yet</p>
                <Link href="/team-members">
                  <Button size="sm">Add Team Member</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3" data-testid={`dashboard-member-${member.id}`}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <Badge 
                          variant={member.capacityPercentage >= 100 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {member.capacityPercentage}%
                        </Badge>
                      </div>
                      <Progress 
                        value={Math.min(member.capacityPercentage, 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.allocatedHours}h / {member.weeklyHours}h per week
                      </p>
                    </div>
                  </div>
                ))}
                {teamMembers.length > 5 && (
                  <Link href="/team-members">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all {teamMembers.length} members
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Work Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold">Active Work</CardTitle>
            <Link href="/work-items">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {workItems.length === 0 ? (
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No work items yet</p>
                <Link href="/work-items">
                  <Button size="sm">Create Work Item</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {workItems.slice(0, 5).map((item) => {
                  const typeColor = item.type === 'demand' 
                    ? 'bg-blue-500/10 text-blue-500' 
                    : item.type === 'project'
                    ? 'bg-purple-500/10 text-purple-500'
                    : 'bg-green-500/10 text-green-500';

                  return (
                    <div 
                      key={item.id} 
                      className="p-3 border rounded-md hover-elevate"
                      data-testid={`dashboard-work-item-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm flex-1">{item.title}</p>
                        <Badge className={typeColor} variant="secondary">
                          {item.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{item.totalAllocatedHours}h/wk</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{item.allocations.length} assigned</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {workItems.length > 5 && (
                  <Link href="/work-items">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all {workItems.length} items
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Teams Overview */}
      {teams.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-lg font-semibold">Teams</CardTitle>
            <Link href="/teams">
              <Button variant="outline" size="sm">Manage Teams</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map((team) => (
                <div 
                  key={team.id} 
                  className="p-4 border rounded-md"
                  data-testid={`dashboard-team-${team.id}`}
                >
                  <h3 className="font-semibold mb-1">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}