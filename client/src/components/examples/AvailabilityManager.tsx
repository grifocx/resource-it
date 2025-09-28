import AvailabilityManager from '../AvailabilityManager';

export default function AvailabilityManagerExample() {
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
    <div className="p-4 max-w-md">
      <AvailabilityManager 
        initialData={mockData}
        onSave={(data) => console.log('Availability saved:', data)}
      />
    </div>
  );
}