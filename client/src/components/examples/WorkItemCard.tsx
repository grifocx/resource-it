import WorkItemCard from '../WorkItemCard';

export default function WorkItemCardExample() {
  const mockItem = {
    id: "1",
    title: "Migrate user authentication to OAuth 2.0 with PKCE flow",
    type: "project" as const,
    priority: "high" as const,
    estimatedHours: 16,
    assignedTo: {
      id: "1",
      name: "Alex Kumar",
      avatar: undefined
    },
    status: "in-progress" as const,
    dueDate: "Mar 15",
    description: "Replace current session-based auth with modern OAuth 2.0 implementation for better security and user experience"
  };

  return (
    <div className="p-4 max-w-sm">
      <WorkItemCard 
        item={mockItem} 
        onClick={() => console.log('WorkItem card clicked')}
        onAssign={(id) => console.log(`Assign item ${id}`)}
        onLogTime={(id) => console.log(`Log time for item ${id}`)}
      />
    </div>
  );
}