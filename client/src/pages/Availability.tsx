import AvailabilityManager from "@/components/AvailabilityManager";

export default function Availability() {
  // todo: remove mock functionality
  const mockData = {
    weeklyHours: 40,
    currentCapacity: 75,
    outOfOffice: [
      {
        start: "2024-12-20",
        end: "2024-12-30",
        reason: "Holiday vacation"
      }
    ]
  };

  return (
    <div className="p-6" data-testid="availability-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Availability</h1>
        <p className="text-muted-foreground">
          Manage your weekly capacity and schedule time off
        </p>
      </div>
      
      <div className="max-w-md">
        <AvailabilityManager 
          initialData={mockData}
          onSave={(data) => console.log('Availability saved:', data)}
        />
      </div>
    </div>
  );
}