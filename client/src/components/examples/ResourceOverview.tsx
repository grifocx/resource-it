import ResourceOverview from '../ResourceOverview';

export default function ResourceOverviewExample() {
  const mockTeamMembers = [
    {
      id: "1",
      name: "Sarah Chen",
      role: "Senior DevOps",
      capacity: 95,
      assignedHours: 38,
      weeklyHours: 40,
      currentProject: "OAuth Migration"
    },
    {
      id: "2",
      name: "Alex Kumar",
      role: "Full Stack Developer",
      capacity: 75,
      assignedHours: 30,
      weeklyHours: 40,
      currentProject: "Payment Gateway"
    },
    {
      id: "3",
      name: "Maria Garcia",
      role: "Frontend Engineer",
      capacity: 60,
      assignedHours: 24,
      weeklyHours: 40,
      currentProject: "Dashboard UI"
    },
    {
      id: "4",
      name: "David Kim",
      role: "Backend Developer",
      capacity: 105,
      assignedHours: 42,
      weeklyHours: 40,
      currentProject: "API Refactoring"
    }
  ];

  const mockStats = {
    totalTeamMembers: 8,
    averageCapacity: 84,
    projectHours: 276,
    omHours: 94,
    overallocatedMembers: 2
  };

  return (
    <div className="p-6">
      <ResourceOverview 
        stats={mockStats}
        teamMembers={mockTeamMembers}
      />
    </div>
  );
}