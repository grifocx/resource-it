import PriorityBoard from '../PriorityBoard';

export default function PriorityBoardExample() {
  return (
    <div className="p-6">
      <PriorityBoard 
        onItemMove={(itemId, fromColumn, toColumn) => 
          console.log(`Moved item ${itemId} from ${fromColumn} to ${toColumn}`)
        }
        onAddItem={(columnId) => console.log(`Add item to ${columnId}`)}
      />
    </div>
  );
}