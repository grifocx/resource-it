import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User } from "lucide-react";
import type { TeamMemberWithStats } from "@shared/schema";

interface TeamMemberCardProps {
  member: TeamMemberWithStats;
  onClick?: () => void;
}

export default function TeamMemberCard({ member, onClick }: TeamMemberCardProps) {
  const getCapacityColor = (capacity: number) => {
    if (capacity >= 90) return "bg-capacity-full";
    if (capacity >= 70) return "bg-capacity-high";
    if (capacity >= 40) return "bg-capacity-medium";
    return "bg-capacity-low";
  };

  const getCapacityLabel = (capacity: number) => {
    if (capacity >= 90) return "At Capacity";
    if (capacity >= 70) return "Busy";
    if (capacity >= 40) return "Available";
    return "Light Load";
  };

  return (
    <Card className="hover-elevate cursor-pointer" onClick={onClick} data-testid={`card-team-member-${member.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatar || undefined} alt={member.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate" data-testid={`text-member-name-${member.id}`}>
              {member.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground" data-testid={`text-member-role-${member.id}`}>
              {member.role}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {getCapacityLabel(member.currentCapacity)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-mono">{member.currentCapacity}%</span>
            </div>
            <Progress 
              value={member.currentCapacity} 
              className="h-2"
              data-testid={`progress-capacity-${member.id}`}
            />
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{member.weeklyHours}h/week</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
                data-testid={`badge-skill-${member.id}-${index}`}
              >
                {skill}
              </Badge>
            ))}
            {member.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{member.skills.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}