import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { insertTeamMemberSchema, type InsertTeamMember, type TeamMember, type Team } from "@shared/schema";

interface TeamMemberFormProps {
  member?: TeamMember;
  onSave: (member: InsertTeamMember) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const commonRoles = [
  "Senior DevOps Engineer",
  "Full Stack Developer",
  "Frontend Engineer", 
  "Backend Developer",
  "QA Engineer",
  "Security Engineer",
  "Data Engineer",
  "Product Manager",
  "UI/UX Designer"
];

const commonSkills = [
  "React", "Node.js", "TypeScript", "JavaScript", "Python", "Java",
  "Kubernetes", "Docker", "AWS", "Azure", "GCP", "Terraform",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST API",
  "Jest", "Cypress", "Selenium", "Testing", "CI/CD", "Git",
  "Figma", "CSS", "Tailwind", "Spring", "Django", "Flask"
];

export default function TeamMemberForm({ member, onSave, onCancel, isLoading = false }: TeamMemberFormProps) {
  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState<string[]>(member?.skills || []);

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api", "teams"],
  });

  const form = useForm<InsertTeamMember>({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: {
      name: member?.name || "",
      role: member?.role || "",
      email: member?.email || "",
      teamId: member?.teamId || null,
      skills: member?.skills || [],
      weeklyHours: member?.weeklyHours || 40,
      isActive: member?.isActive ?? true,
    },
  });

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      form.setValue("skills", updatedSkills);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    form.setValue("skills", updatedSkills);
  };

  const handleSubmit = (data: InsertTeamMember) => {
    onSave({ ...data, skills });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" data-testid="input-member-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    data-testid="input-member-email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-member-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
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
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-member-team">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Optional - assign member to a team</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weeklyHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Hours</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="80" 
                    placeholder="40" 
                    data-testid="input-member-weekly-hours"
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Standard weekly availability</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Skills Section */}
        <div className="space-y-3">
          <FormLabel>Skills & Technologies</FormLabel>
          
          {/* Add New Skill */}
          <div className="flex gap-2">
            <Select value={newSkill} onValueChange={setNewSkill}>
              <SelectTrigger className="flex-1" data-testid="select-skill">
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {commonSkills
                  .filter(skill => !skills.includes(skill))
                  .map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addSkill(newSkill)}
              disabled={!newSkill || skills.includes(newSkill)}
              data-testid="button-add-skill"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Custom Skill Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Or type a custom skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(newSkill);
                }
              }}
              data-testid="input-custom-skill"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addSkill(newSkill)}
              disabled={!newSkill || skills.includes(newSkill)}
              data-testid="button-add-custom-skill"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={() => removeSkill(skill)}
                    data-testid={`button-remove-skill-${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            data-testid="button-cancel-member"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-save-member"
          >
            {isLoading ? "Saving..." : member ? "Update Member" : "Add Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
}