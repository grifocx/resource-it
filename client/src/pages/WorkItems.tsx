import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Pencil, Trash2, Clock, Users, ChevronDown, UserPlus, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WorkItemWithAllocations, InsertWorkItem, WorkItem, Allocation } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkItemSchema, getValidStatusesForType, getDefaultStatusForType, formatStatusLabel } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import AllocationDialog from "@/components/AllocationDialog";
import { format } from "date-fns";

const workItemTypes = [
  { value: "demand", label: "Demand", description: "New feature requests or enhancements" },
  { value: "project", label: "Project", description: "Large initiatives with defined scope" },
  { value: "om", label: "O&M", description: "Operations & Maintenance work" },
] as const;

export default function WorkItems() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [allocationDialog, setAllocationDialog] = useState<{
    open: boolean;
    workItemId: string;
    workItemTitle: string;
    allocation?: Allocation;
  }>({ open: false, workItemId: "", workItemTitle: "" });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: workItems = [], isLoading } = useQuery<WorkItemWithAllocations[]>({
    queryKey: ["/api", "work-items"],
  });

  const form = useForm<InsertWorkItem>({
    resolver: zodResolver(insertWorkItemSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "demand",
      status: "draft",
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertWorkItem) => {
      const response = await apiRequest("POST", "/api/work-items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "work-items"] });
      setShowDialog(false);
      form.reset();
      toast({
        title: "Success",
        description: "Work item created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create work item. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create work item:", error);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertWorkItem }) => {
      const response = await apiRequest("PATCH", `/api/work-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "work-items"] });
      setShowDialog(false);
      setEditingItem(null);
      form.reset();
      toast({
        title: "Success",
        description: "Work item updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update work item. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update work item:", error);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/work-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "work-items"] });
      setDeletingItemId(null);
      toast({
        title: "Success",
        description: "Work item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete work item. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete work item:", error);
      setDeletingItemId(null);
    },
  });

  const deleteAllocationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/allocations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Success",
        description: "Allocation removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove allocation. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete allocation:", error);
    },
  });

  const handleOpenDialog = (item?: WorkItem) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        title: item.title,
        description: item.description || "",
        type: item.type,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      form.reset({
        title: "",
        description: "",
        type: "demand",
        status: "draft",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = (data: InsertWorkItem) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this work item? All allocations will be removed.")) {
      setDeletingItemId(id);
      deleteItemMutation.mutate(id);
    }
  };

  const handleDeleteAllocation = (allocationId: string, memberName: string) => {
    if (confirm(`Remove ${memberName} from this work item?`)) {
      deleteAllocationMutation.mutate(allocationId);
    }
  };

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "demand": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "project": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "om": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    // Demand statuses
    if (status === "draft") return "bg-gray-500/10 text-gray-500";
    if (status === "submitted") return "bg-blue-500/10 text-blue-500";
    if (status === "screened") return "bg-cyan-500/10 text-cyan-500";
    if (status === "qualified-approved") return "bg-green-500/10 text-green-500";
    if (status === "complete") return "bg-emerald-600/10 text-emerald-600";
    if (status === "deferred") return "bg-orange-500/10 text-orange-500";
    if (status === "rejected") return "bg-red-500/10 text-red-500";
    
    // Project statuses
    if (status === "initiating") return "bg-indigo-500/10 text-indigo-500";
    if (status === "planning") return "bg-blue-500/10 text-blue-500";
    if (status === "executing") return "bg-yellow-500/10 text-yellow-500";
    if (status === "delivering") return "bg-green-500/10 text-green-500";
    if (status === "closing") return "bg-emerald-600/10 text-emerald-600";
    
    // O&M statuses
    if (status === "planned") return "bg-blue-500/10 text-blue-500";
    if (status === "active") return "bg-green-500/10 text-green-500";
    if (status === "on-hold") return "bg-orange-500/10 text-orange-500";
    if (status === "completed") return "bg-emerald-600/10 text-emerald-600";
    
    return "bg-gray-500/10 text-gray-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-work-items" />
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Work Items</h1>
            <p className="text-muted-foreground mt-1">
              Manage demands, projects, and O&M work with capacity allocations
            </p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()} 
            data-testid="button-add-work-item"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Work Item
          </Button>
        </div>

        {workItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No work items yet. Create your first item to start allocating capacity.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workItems.map((item) => (
              <Card key={item.id} data-testid={`card-work-item-${item.id}`} className="hover-elevate">
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(item.type)} data-testid={`badge-type-${item.id}`}>
                        {workItemTypes.find(t => t.value === item.type)?.label || item.type}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(item.status)} data-testid={`badge-status-${item.id}`}>
                        {formatStatusLabel(item.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl" data-testid={`text-work-item-title-${item.id}`}>
                      {item.title}
                    </CardTitle>
                    {item.description && (
                      <CardDescription className="mt-2">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDialog(item)}
                      data-testid={`button-edit-work-item-${item.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingItemId === item.id}
                      data-testid={`button-delete-work-item-${item.id}`}
                    >
                      {deletingItemId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span data-testid={`text-allocated-hours-${item.id}`}>
                            {item.totalAllocatedHours} hrs/week allocated
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span data-testid={`text-team-members-count-${item.id}`}>
                            {item.allocations.length} {item.allocations.length === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.allocations.length > 0 && (
                          <div className="flex -space-x-2">
                            {item.allocations.slice(0, 3).map((allocation) => (
                              <Avatar key={allocation.id} className="h-8 w-8 border-2 border-background">
                                <AvatarImage src={allocation.teamMember.avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {allocation.teamMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {item.allocations.length > 3 && (
                              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                                +{item.allocations.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <Collapsible open={expandedItems.has(item.id)} onOpenChange={() => toggleItemExpanded(item.id)}>
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2"
                            data-testid={`button-toggle-allocations-${item.id}`}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`} />
                            Manage Allocations
                          </Button>
                        </CollapsibleTrigger>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setAllocationDialog({
                            open: true,
                            workItemId: item.id,
                            workItemTitle: item.title,
                          })}
                          data-testid={`button-add-allocation-${item.id}`}
                        >
                          <UserPlus className="h-4 w-4" />
                          Assign
                        </Button>
                      </div>

                      <CollapsibleContent className="space-y-2 mt-3">
                        {item.allocations.length === 0 ? (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No team members assigned yet
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {item.allocations.map((allocation) => (
                              <div
                                key={allocation.id}
                                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                                data-testid={`allocation-${allocation.id}`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={allocation.teamMember.avatar || undefined} />
                                    <AvatarFallback>
                                      {allocation.teamMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm" data-testid={`text-member-name-${allocation.id}`}>
                                      {allocation.teamMember.name}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span data-testid={`text-hours-${allocation.id}`}>
                                          {allocation.hoursPerWeek}h/week
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span data-testid={`text-dates-${allocation.id}`}>
                                          {format(new Date(allocation.startDate), 'MMM d, yyyy')}
                                          {allocation.endDate && ` - ${format(new Date(allocation.endDate), 'MMM d, yyyy')}`}
                                        </span>
                                      </div>
                                    </div>
                                    {allocation.notes && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {allocation.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setAllocationDialog({
                                      open: true,
                                      workItemId: item.id,
                                      workItemTitle: item.title,
                                      allocation,
                                    })}
                                    data-testid={`button-edit-allocation-${allocation.id}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteAllocation(allocation.id, allocation.teamMember.name)}
                                    data-testid={`button-delete-allocation-${allocation.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-testid="dialog-work-item-form">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Work Item" : "Add New Work Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Update the work item details below."
                : "Create a new work item to track capacity allocations."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Implement user authentication" 
                        data-testid="input-work-item-title"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Update status to default for new type
                          form.setValue("status", getDefaultStatusForType(value));
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-work-item-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workItemTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => {
                    const selectedType = form.watch("type");
                    const validStatuses = getValidStatusesForType(selectedType);
                    
                    return (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-work-item-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {validStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {formatStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the work item and its objectives"
                        className="resize-none"
                        rows={3}
                        data-testid="input-work-item-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createItemMutation.isPending || updateItemMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingItem ? "Update Work Item" : "Create Work Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AllocationDialog
        open={allocationDialog.open}
        onOpenChange={(open) => setAllocationDialog(prev => ({ ...prev, open }))}
        workItemId={allocationDialog.workItemId}
        workItemTitle={allocationDialog.workItemTitle}
        existingAllocation={allocationDialog.allocation}
      />
    </div>
  );
}