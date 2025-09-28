import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grip, Plus } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  type: "project" | "om";
  priority: "critical" | "high" | "normal" | "low";
  estimatedHours: number;
  assignedTo?: {
    name: string;
    avatar?: string;
  };
}

interface PriorityColumn {
  id: string;
  title: string;
  items: WorkItem[];
  color: string;
}

interface PriorityBoardProps {
  onItemMove?: (itemId: string, fromColumn: string, toColumn: string) => void;
  onAddItem?: (columnId: string) => void;
}

export default function PriorityBoard({ onItemMove, onAddItem }: PriorityBoardProps) {
  const [columns, setColumns] = useState<PriorityColumn[]>([
    {
      id: "critical",
      title: "Critical",
      color: "bg-red-100 dark:bg-red-950",
      items: [
        {
          id: "1",
          title: "Production database outage affecting all users",
          type: "om",
          priority: "critical",
          estimatedHours: 8,
          assignedTo: { name: "Sarah Chen" }
        }
      ]
    },
    {
      id: "high",
      title: "High Priority",
      color: "bg-orange-100 dark:bg-orange-950",
      items: [
        {
          id: "2",
          title: "Security patch deployment for authentication system",
          type: "project",
          priority: "high",
          estimatedHours: 16,
          assignedTo: { name: "Alex Kumar" }
        },
        {
          id: "3",
          title: "Payment gateway timeout issues causing failed transactions",
          type: "om",
          priority: "high",
          estimatedHours: 12
        }
      ]
    },
    {
      id: "normal",
      title: "Normal",
      color: "bg-blue-100 dark:bg-blue-950",
      items: [
        {
          id: "4",
          title: "Implement new reporting dashboard for analytics",
          type: "project",
          priority: "normal",
          estimatedHours: 32,
          assignedTo: { name: "Maria Garcia" }
        },
        {
          id: "5",
          title: "Update CI/CD pipeline for faster deployments",
          type: "project",
          priority: "normal",
          estimatedHours: 20
        }
      ]
    },
    {
      id: "low",
      title: "Low Priority",
      color: "bg-gray-100 dark:bg-gray-950",
      items: [
        {
          id: "6",
          title: "Code documentation improvements",
          type: "project",
          priority: "low",
          estimatedHours: 16
        }
      ]
    }
  ]);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);

  const handleDragStart = (itemId: string, columnId: string) => {
    setDraggedItem(itemId);
    setDraggedFrom(columnId);
    console.log('Drag started:', itemId, 'from', columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedItem || !draggedFrom || draggedFrom === targetColumnId) {
      setDraggedItem(null);
      setDraggedFrom(null);
      return;
    }

    // Move item between columns
    const newColumns = columns.map(column => {
      if (column.id === draggedFrom) {
        return {
          ...column,
          items: column.items.filter(item => item.id !== draggedItem)
        };
      }
      if (column.id === targetColumnId) {
        const itemToMove = columns
          .find(col => col.id === draggedFrom)
          ?.items.find(item => item.id === draggedItem);
        
        if (itemToMove) {
          return {
            ...column,
            items: [...column.items, { ...itemToMove, priority: targetColumnId as any }]
          };
        }
      }
      return column;
    });

    setColumns(newColumns);
    onItemMove?.(draggedItem, draggedFrom, targetColumnId);
    console.log('Item moved:', draggedItem, 'from', draggedFrom, 'to', targetColumnId);
    
    setDraggedItem(null);
    setDraggedFrom(null);
  };

  return (
    <div className="space-y-4" data-testid="priority-board">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Work Prioritization</h2>
        <p className="text-sm text-muted-foreground">
          Drag items between columns to prioritize work
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
              {column.items.map((item) => (
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
                          <Badge variant="outline" className="text-xs">
                            {item.type === "project" ? "Project" : "O&M"}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-medium line-clamp-2 mb-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-mono">{item.estimatedHours}h</span>
                          {item.assignedTo && (
                            <span>{item.assignedTo.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-dashed"
                onClick={() => {
                  onAddItem?.(column.id);
                  console.log('Add item to column:', column.id);
                }}
                data-testid={`button-add-item-${column.id}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}