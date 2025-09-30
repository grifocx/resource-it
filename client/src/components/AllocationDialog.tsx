import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertAllocation, Allocation, TeamMember } from "@shared/schema";
import { insertAllocationSchema } from "@shared/schema";
import { format } from "date-fns";

interface AllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workItemId: string;
  workItemTitle: string;
  existingAllocation?: Allocation;
}

export default function AllocationDialog({
  open,
  onOpenChange,
  workItemId,
  workItemTitle,
  existingAllocation,
}: AllocationDialogProps) {
  const { toast } = useToast();
  const isEditing = !!existingAllocation;

  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api", "team-members"],
    enabled: open,
  });

  const form = useForm<InsertAllocation>({
    resolver: zodResolver(insertAllocationSchema),
    defaultValues: {
      workItemId,
      teamMemberId: "",
      hoursPerWeek: "0",
      startDate: new Date(),
      endDate: undefined,
      notes: "",
    },
  });

  // Update form when existingAllocation changes
  useEffect(() => {
    if (existingAllocation && open) {
      form.reset({
        workItemId: existingAllocation.workItemId,
        teamMemberId: existingAllocation.teamMemberId,
        hoursPerWeek: existingAllocation.hoursPerWeek,
        startDate: new Date(existingAllocation.startDate),
        endDate: existingAllocation.endDate ? new Date(existingAllocation.endDate) : undefined,
        notes: existingAllocation.notes,
      });
    } else if (!existingAllocation && open) {
      form.reset({
        workItemId,
        teamMemberId: "",
        hoursPerWeek: "0",
        startDate: new Date(),
        endDate: undefined,
        notes: "",
      });
    }
  }, [existingAllocation, open, workItemId, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertAllocation) => {
      const response = await apiRequest("POST", "/api/allocations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "work-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "team-members"] });
      onOpenChange(false);
      form.reset();
      toast({
        title: "Success",
        description: "Allocation created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create allocation. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create allocation:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertAllocation) => {
      const response = await apiRequest("PATCH", `/api/allocations/${existingAllocation?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "work-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "team-members"] });
      onOpenChange(false);
      form.reset();
      toast({
        title: "Success",
        description: "Allocation updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update allocation. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update allocation:", error);
    },
  });

  const onSubmit = (data: InsertAllocation) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-allocation">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {isEditing ? "Edit Allocation" : "Assign Team Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the allocation details below."
              : `Assign a team member to work on "${workItemTitle}".`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingMembers || isPending}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-team-member">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem
                          key={member.id}
                          value={member.id}
                          data-testid={`option-member-${member.id}`}
                        >
                          {member.name} ({member.role})
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
              name="hoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Per Week</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="168"
                      placeholder="e.g., 10"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isPending}
                      data-testid="input-hours-per-week"
                    />
                  </FormControl>
                  <FormDescription>
                    How many hours per week will be allocated
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        disabled={isPending}
                        data-testid="input-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                        }
                        disabled={isPending}
                        data-testid="input-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this allocation..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isPending}
                      data-testid="input-notes"
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
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-allocation">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"} Allocation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
