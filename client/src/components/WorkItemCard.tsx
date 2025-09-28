import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, AlertCircle, User, Calendar } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  type: "project" | "om"; // O&M = Operations & Maintenance
  priority: "critical" | "high" | "normal" | "low";
  estimatedHours: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: "todo" | "in-progress" | "review" | "done";
  dueDate?: string;
  description: string;
}

interface WorkItemCardProps {
  item: WorkItem;
  onClick?: () => void;
  onAssign?: (itemId: string) => void;
  onLogTime?: (itemId: string) => void;
}

export default function WorkItemCard({ item, onClick, onAssign, onLogTime }: WorkItemCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-priority-critical";
      case "high": return "bg-priority-high"; 
      case "normal": return "bg-priority-normal";
      case "low": return "bg-priority-low";
      default: return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "review": return "bg-yellow-500";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="hover-elevate cursor-pointer" onClick={onClick} data-testid={`card-work-item-${item.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {item.type === "project" ? "Project" : "O&M"}
              </Badge>
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
              <span className="text-xs text-muted-foreground capitalize">
                {item.priority}
              </span>
            </div>
            <CardTitle className="text-sm font-medium line-clamp-2" data-testid={`text-item-title-${item.id}`}>
              {item.title}
            </CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs ${getStatusColor(item.status)}`}
            data-testid={`badge-status-${item.id}`}
          >
            {item.status.replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{item.estimatedHours}h est.</span>
            </div>
            {item.dueDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{item.dueDate}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.assignedTo ? (
                <div className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.assignedTo.avatar} alt={item.assignedTo.name} />
                    <AvatarFallback className="text-xs">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {item.assignedTo.name}
                  </span>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign?.(item.id);
                    console.log(`Assign item ${item.id}`);
                  }}
                  data-testid={`button-assign-${item.id}`}
                >
                  Assign
                </Button>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onLogTime?.(item.id);
                console.log(`Log time for item ${item.id}`);
              }}
              data-testid={`button-log-time-${item.id}`}
            >
              Log Time
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}