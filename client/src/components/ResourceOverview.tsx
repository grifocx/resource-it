import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, TrendingUp, AlertCircle, User } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  capacity: number;
  assignedHours: number;
  weeklyHours: number;
  currentProject?: string;
  avatar?: string;
}

interface ResourceStats {
  totalTeamMembers: number;
  averageCapacity: number;
  projectHours: number;
  omHours: number;
  overallocatedMembers: number;
}

interface ResourceOverviewProps {
  stats?: ResourceStats;
  teamMembers?: TeamMember[];
}

export default function ResourceOverview({ stats, teamMembers = [] }: ResourceOverviewProps) {
  const defaultStats: ResourceStats = {
    totalTeamMembers: 8,
    averageCapacity: 78,
    projectHours: 245,
    omHours: 87,
    overallocatedMembers: 2
  };

  const effectiveStats = stats || defaultStats;

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 90) return "text-red-500";
    if (capacity >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getCapacityBg = (capacity: number) => {
    if (capacity >= 100) return "bg-red-500";
    if (capacity >= 90) return "bg-orange-500";
    if (capacity >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6" data-testid="resource-overview">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{effectiveStats.totalTeamMembers}</div>
            </div>
            <p className="text-xs text-muted-foreground">Team Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className={`text-2xl font-bold ${getCapacityColor(effectiveStats.averageCapacity)}`}>
                {effectiveStats.averageCapacity}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Avg Capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{effectiveStats.projectHours}</div>
            </div>
            <p className="text-xs text-muted-foreground">Project Hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <div className="text-2xl font-bold text-amber-600">
                {effectiveStats.overallocatedMembers}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Over-allocated</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Capacity Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4" data-testid={`member-overview-${member.id}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{member.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {member.assignedHours}h / {member.weeklyHours}h
                    </span>
                    <Badge 
                      variant={member.capacity >= 100 ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {member.capacity}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress 
                    value={Math.min(member.capacity, 100)} 
                    className="flex-1 h-2"
                  />
                  <div className="text-xs text-muted-foreground min-w-0">
                    {member.currentProject && (
                      <span className="truncate">{member.currentProject}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No team members to display</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Work Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Projects</span>
                <span className="text-sm font-mono">{effectiveStats.projectHours}h</span>
              </div>
              <Progress 
                value={(effectiveStats.projectHours / (effectiveStats.projectHours + effectiveStats.omHours)) * 100} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">O&M Work</span>
                <span className="text-sm font-mono">{effectiveStats.omHours}h</span>
              </div>
              <Progress 
                value={(effectiveStats.omHours / (effectiveStats.projectHours + effectiveStats.omHours)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capacity Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamMembers.filter(m => m.capacity >= 90).length > 0 ? (
                teamMembers
                  .filter(m => m.capacity >= 90)
                  .slice(0, 3)
                  .map((member) => (
                    <div key={member.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{member.name}</span>
                      <Badge variant="destructive" className="text-xs ml-auto">
                        {member.capacity}%
                      </Badge>
                    </div>
                  ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  All team members within healthy capacity range
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}