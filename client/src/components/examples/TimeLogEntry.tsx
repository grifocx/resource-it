import TimeLogEntry from '../TimeLogEntry';

export default function TimeLogEntryExample() {
  const mockWorkItems = [
    { id: "1", title: "Migrate user authentication to OAuth 2.0", type: "project" as const },
    { id: "2", title: "Fix payment gateway timeout issues", type: "om" as const },
    { id: "3", title: "Update CI/CD pipeline for faster deploys", type: "project" as const },
    { id: "4", title: "Database maintenance and cleanup", type: "om" as const },
  ];

  return (
    <div className="p-4 max-w-md">
      <TimeLogEntry 
        workItems={mockWorkItems}
        onSave={(entry) => console.log('Time entry saved:', entry)}
        onCancel={() => console.log('Time entry cancelled')}
      />
    </div>
  );
}