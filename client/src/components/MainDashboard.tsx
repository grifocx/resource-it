import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamMemberCard from "./TeamMemberCard";
import WorkItemCard from "./WorkItemCard";
import ResourceOverview from "./ResourceOverview";
import TimeLogEntry from "./TimeLogEntry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Clock, 
  Plus, 
  TrendingUp, 
  Users, 
  Workflow,
  Calendar
} from "lucide-react";

// todo: remove mock functionality and integrate with real API
const mockTeamMembers = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Senior DevOps Engineer", 
    email: "sarah.chen@company.com",
    skills: ["Kubernetes", "AWS", "Docker", "Python", "Terraform"],
    currentCapacity: 95,
    weeklyHours: 40,
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedHours: 38,
    currentProject: "OAuth Migration"
  },
  {
    id: "2", 
    name: "Alex Kumar",
    role: "Full Stack Developer",
    email: "alex.kumar@company.com",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    currentCapacity: 75,
    weeklyHours: 40,
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedHours: 30,
    currentProject: "Payment Gateway"
  },
  {
    id: "3",
    name: "Maria Garcia", 
    role: "Frontend Engineer",
    email: "maria.garcia@company.com",
    skills: ["React", "CSS", "JavaScript", "Figma"],
    currentCapacity: 60,
    weeklyHours: 40,
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedHours: 24,
    currentProject: "Dashboard UI"
  },
  {
    id: "4",
    name: "David Kim",
    role: "Backend Developer", 
    email: "david.kim@company.com",
    skills: ["Java", "Spring", "MySQL", "Redis"],
    currentCapacity: 105,
    weeklyHours: 40,
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedHours: 42,
    currentProject: "API Refactoring"
  }
];

const mockWorkItems = [
  {
    id: "1",
    title: "Migrate user authentication to OAuth 2.0 with PKCE flow", 
    type: "project" as const,
    priority: "high" as const,
    estimatedHours: 16,
    assignedTo: { id: "1", name: "Alex Kumar" },
    status: "in-progress" as const,
    dueDate: "Mar 15",
    description: "Replace current session-based auth with modern OAuth 2.0 implementation for better security and user experience"
  },
  {
    id: "2",
    title: "Fix payment gateway timeout issues",
    type: "om" as const,
    priority: "critical" as const, 
    estimatedHours: 8,
    assignedTo: { id: "1", name: "Sarah Chen" },
    status: "in-progress" as const,
    dueDate: "Mar 10",
    description: "Investigate and resolve timeout issues causing failed transactions in payment processing"
  },
  {
    id: "3", 
    title: "Update CI/CD pipeline for faster deployments",
    type: "project" as const,
    priority: "normal" as const,
    estimatedHours: 20,
    status: "todo" as const,
    dueDate: "Mar 20", 
    description: "Optimize build processes and deployment workflows to reduce deployment time from 15 minutes to under 5 minutes"
  }
];

const mockTimeLogItems = [
  { id: "1", title: "OAuth Migration Project", type: "project" as const },
  { id: "2", title: "Payment Gateway O&M", type: "om" as const },
  { id: "3", title: "CI/CD Pipeline Updates", type: "project" as const },
  { id: "4", title: "Database Maintenance", type: "om" as const }
];

const mockResourceStats = {
  totalTeamMembers: 8,
  averageCapacity: 84,
  projectHours: 276,
  omHours: 94,
  overallocatedMembers: 2
};

export default function MainDashboard() {
  const [showTimeLog, setShowTimeLog] = useState(false);

  return (
    <div className="p-6 space-y-6" data-testid="main-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IT Resource Manager</h1>
          <p className="text-muted-foreground">
            Track team capacity, prioritize work, and manage resource allocation
          </p>
        </div>
        <Dialog open={showTimeLog} onOpenChange={setShowTimeLog}>
          <DialogTrigger asChild>
            <Button data-testid="button-quick-log-time-main">
              <Clock className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Quick Time Entry</DialogTitle>
            </DialogHeader>
            <TimeLogEntry 
              workItems={mockTimeLogItems}
              onSave={(entry) => {
                console.log('Time entry saved:', entry);
                setShowTimeLog(false);
              }}
              onCancel={() => setShowTimeLog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">8</div>
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
                <div className="text-2xl font-bold">84%</div>
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
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">Active Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">370h</div>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Team Capacity</h2>
            <Badge variant="outline">
              {mockTeamMembers.filter(m => m.currentCapacity >= 90).length} over-allocated
            </Badge>
          </div>
          <div className="space-y-3">
            {mockTeamMembers.slice(0, 4).map((member) => (
              <TeamMemberCard 
                key={member.id} 
                member={member}
                onClick={() => console.log('View member details:', member.name)}
              />
            ))}
          </div>
        </div>

        {/* Active Work Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Priority Work</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          <div className="space-y-3">
            {mockWorkItems.map((item) => (
              <WorkItemCard 
                key={item.id}
                item={item}
                onClick={() => console.log('View work item:', item.title)}
                onAssign={(id) => console.log('Assign work item:', id)}
                onLogTime={(id) => console.log('Log time for:', id)}
              />
            ))}
          </div>
        </div>

        {/* Resource Overview */}
        <div>
          <ResourceOverview 
            stats={mockResourceStats}
            teamMembers={mockTeamMembers}
          />
        </div>
      </div>
    </div>
  );
}