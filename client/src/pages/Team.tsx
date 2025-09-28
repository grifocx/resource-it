import TeamMemberCard from "@/components/TeamMemberCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// todo: remove mock functionality
const mockTeamMembers = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Senior DevOps Engineer", 
    skills: ["Kubernetes", "AWS", "Docker", "Python", "Terraform", "Ansible"],
    currentCapacity: 95,
    weeklyHours: 40
  },
  {
    id: "2", 
    name: "Alex Kumar",
    role: "Full Stack Developer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "GraphQL"],
    currentCapacity: 75,
    weeklyHours: 40
  },
  {
    id: "3",
    name: "Maria Garcia", 
    role: "Frontend Engineer",
    skills: ["React", "CSS", "JavaScript", "Figma", "Tailwind"],
    currentCapacity: 60,
    weeklyHours: 40
  },
  {
    id: "4",
    name: "David Kim",
    role: "Backend Developer", 
    skills: ["Java", "Spring", "MySQL", "Redis", "Kafka"],
    currentCapacity: 105,
    weeklyHours: 40
  },
  {
    id: "5",
    name: "Emma Wilson",
    role: "QA Engineer",
    skills: ["Selenium", "Jest", "Cypress", "Testing", "Automation"],
    currentCapacity: 45,
    weeklyHours: 40
  },
  {
    id: "6",
    name: "James Rodriguez", 
    role: "Security Engineer",
    skills: ["Security", "Penetration Testing", "OWASP", "Compliance"],
    currentCapacity: 80,
    weeklyHours: 40
  }
];

export default function Team() {
  return (
    <div className="p-6 space-y-6" data-testid="team-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage team capacity and view current assignments
          </p>
        </div>
        <Button data-testid="button-add-team-member">
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTeamMembers.map((member) => (
          <TeamMemberCard 
            key={member.id} 
            member={member}
            onClick={() => console.log('View member details:', member.name)}
          />
        ))}
      </div>
    </div>
  );
}