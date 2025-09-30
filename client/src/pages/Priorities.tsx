import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Grip } from "lucide-react";
import { useState } from "react";
import type { WorkItemWithAllocations } from "@shared/schema";

type Priority = "critical" | "high" | "normal" | "low";

interface PriorityColumn {
  id: Priority;
  title: string;
  items: WorkItemWithAllocations[];
  color: string;
}

export default function Priorities() {
  const { data: workItems = [], isLoading } = useQuery<WorkItemWithAllocations[]>({
    queryKey: ["/api/work-items"],
  });

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<Priority | null>(null);

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: Priority }) => {
      return apiRequest("PATCH", `/api/work-items/${id}`, { priority });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-items"] });
    },
  });

  const handleDragStart = (itemId: string, priority: Priority) => {
    setDraggedItem(itemId);
    setDraggedFrom(priority);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetPriority: Priority) => {
    e.preventDefault();
    
    if (!draggedItem || !draggedFrom || draggedFrom === targetPriority) {
      setDraggedItem(null);
      setDraggedFrom(null);
      return;
    }

    updatePriorityMutation.mutate({ id: draggedItem, priority: targetPriority });
    
    setDraggedItem(null);
    setDraggedFrom(null);
  };

  const getTypeColor = (type: string) => {
    if (type === "demand") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (type === "project") return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (type === "om") return "bg-green-500/10 text-green-500 border-green-500/20";
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const getTypeLabel = (type: string) => {
    if (type === "demand") return "Demand";
    if (type === "project") return "Project";
    if (type === "om") return "O&M";
    return type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-priorities" />
      </div>
    );
  }

  const columns: PriorityColumn[] = [
    {
      id: "critical",
      title: "Critical",
      color: "bg-red-50 dark:bg-red-950/20",
      items: workItems.filter((item) => item.priority === "critical"),
    },
    {
      id: "high",
      title: "High Priority",
      color: "bg-orange-50 dark:bg-orange-950/20",
      items: workItems.filter((item) => item.priority === "high"),
    },
    {
      id: "normal",
      title: "Normal",
      color: "bg-blue-50 dark:bg-blue-950/20",
      items: workItems.filter((item) => item.priority === "normal"),
    },
    {
      id: "low",
      title: "Low Priority",
      color: "bg-gray-50 dark:bg-gray-950/20",
      items: workItems.filter((item) => item.priority === "low"),
    },
  ];

  return (
    <div className="h-full p-6" data-testid="priorities-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Capacity Planning</h1>
        <p className="text-muted-foreground">
          Drag and drop work items between priority levels to organize your team's focus
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((column) => (
          <Card
            key={column.id}
            className={`${column.color} border-2 border-dashed border-transparent transition-colors`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            data-testid={`column-${column.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {column.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {column.items.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {column.items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No items
                </p>
              ) : (
                column.items.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-move bg-card hover-elevate"
                    draggable
                    onDragStart={() => handleDragStart(item.id, column.id)}
                    data-testid={`priority-item-${item.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Grip className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(item.type)}>
                              {getTypeLabel(item.type)}
                            </Badge>
                          </div>
                          <h4 className="text-xs font-medium line-clamp-2 mb-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono">
                              {item.totalAllocatedHours.toFixed(1)}h/week
                            </span>
                            {item.allocations && item.allocations.length > 0 && (
                              <span>
                                {item.allocations.length} {item.allocations.length === 1 ? "person" : "people"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
