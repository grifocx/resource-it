import PriorityBoard from "@/components/PriorityBoard";

export default function Priorities() {
  return (
    <div className="p-6" data-testid="priorities-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Work Prioritization</h1>
        <p className="text-muted-foreground">
          Drag and drop work items between priority levels to organize your team's focus
        </p>
      </div>
      
      <PriorityBoard 
        onItemMove={(itemId, fromColumn, toColumn) => 
          console.log(`Moved item ${itemId} from ${fromColumn} to ${toColumn}`)
        }
        onAddItem={(columnId) => console.log(`Add item to ${columnId}`)}
      />
    </div>
  );
}