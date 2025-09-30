import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, BarChart3, AlertCircle, Users, Clock } from "lucide-react";
import type { WorkItemWithAllocations, TeamMemberWithStats } from "@shared/schema";
import { formatStatusLabel } from "@shared/schema";

export default function Reports() {
  const { data: workItems = [], isLoading: isLoadingWorkItems } = useQuery<WorkItemWithAllocations[]>({
    queryKey: ["/api/work-items"],
  });

  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery<TeamMemberWithStats[]>({
    queryKey: ["/api/team-members"],
  });

  const isLoading = isLoadingWorkItems || isLoadingMembers;

  // Calculate metrics
  const overallocatedMembers = teamMembers.filter(m => m.capacityPercentage > 100);
  const totalAllocated = teamMembers.reduce((sum, m) => sum + m.allocatedHours, 0);
  const activeWorkItems = workItems.filter(w => {
    const activeStatuses = ['executing', 'active', 'in-progress', 'planned', 'planning', 'delivering'];
    return activeStatuses.some(s => w.status.includes(s));
  });
  const unallocatedWork = workItems.filter(w => w.totalAllocatedHours === 0);

  // Group work items by type and status
  const workByType = workItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, WorkItemWithAllocations[]>);

  const getTypeColor = (type: string) => {
    if (type === "demand") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (type === "project") return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (type === "om") return "bg-green-500/10 text-green-500 border-green-500/20";
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage > 100) return "text-red-500";
    if (percentage > 85) return "text-orange-500";
    return "text-green-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-reports" />
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze resource utilization and work pipeline status
          </p>
        </div>

        <Tabs defaultValue="utilization" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="utilization" data-testid="tab-utilization">
              <TrendingUp className="h-4 w-4 mr-2" />
              Resource Utilization
            </TabsTrigger>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Work Pipeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="utilization" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-members">{teamMembers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {overallocatedMembers.length} overallocated
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Allocated Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-allocated">{totalAllocated.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    hours per week
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overallocation Alerts</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500" data-testid="text-overallocated">{overallocatedMembers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    members at risk
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Team Member Capacity Table */}
            <Card>
              <CardHeader>
                <CardTitle>Team Member Capacity</CardTitle>
                <CardDescription>
                  Current allocation status for all team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No team members found</p>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-4" data-testid={`member-capacity-${member.id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{member.name}</p>
                            {member.capacityPercentage > 100 && (
                              <Badge variant="destructive" className="text-xs">
                                Overallocated
                              </Badge>
                            )}
                          </div>
                          <Progress value={Math.min(member.capacityPercentage, 100)} className="h-2" />
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className={`text-sm font-semibold ${getCapacityColor(member.capacityPercentage)}`}>
                            {member.capacityPercentage.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.allocatedHours}/{member.weeklyHours} hrs
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Allocation by Work Type */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation by Work Type</CardTitle>
                <CardDescription>
                  Hours allocated across different work categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(workByType).map(([type, items]) => {
                    const totalHours = items.reduce((sum, item) => sum + item.totalAllocatedHours, 0);
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(type)}>
                            {type === 'demand' ? 'Demand' : type === 'project' ? 'Project' : 'O&M'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{items.length} items</span>
                        </div>
                        <span className="font-semibold">{totalHours.toFixed(1)} hrs/week</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Work Items</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-work-items">{workItems.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeWorkItems.length} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unallocated Backlog</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500" data-testid="text-unallocated">{unallocatedWork.length}</div>
                  <p className="text-xs text-muted-foreground">
                    items need allocation
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Work Types</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-work-types">{Object.keys(workByType).length}</div>
                  <p className="text-xs text-muted-foreground">
                    categories tracked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Work Items by Type and Status */}
            <Card>
              <CardHeader>
                <CardTitle>Work Items by Type</CardTitle>
                <CardDescription>
                  Breakdown of work items across demands, projects, and O&M
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(workByType).map(([type, items]) => {
                    const statusGroups = items.reduce((acc, item) => {
                      if (!acc[item.status]) acc[item.status] = [];
                      acc[item.status].push(item);
                      return acc;
                    }, {} as Record<string, WorkItemWithAllocations[]>);

                    return (
                      <div key={type} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(type)}>
                            {type === 'demand' ? 'Demand' : type === 'project' ? 'Project' : 'O&M'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{items.length} total</span>
                        </div>
                        <div className="pl-4 space-y-2">
                          {Object.entries(statusGroups).map(([status, statusItems]) => (
                            <div key={status} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {formatStatusLabel(status)}
                              </span>
                              <span className="font-medium">{statusItems.length}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Unallocated Work Items */}
            {unallocatedWork.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Unallocated Work Items</CardTitle>
                  <CardDescription>
                    Items that need team member assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unallocatedWork.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`unallocated-${item.id}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(item.type)}>
                              {item.type === 'demand' ? 'Demand' : item.type === 'project' ? 'Project' : 'O&M'}
                            </Badge>
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Status: {formatStatusLabel(item.status)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
