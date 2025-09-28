import TeamMemberCard from '../TeamMemberCard';

export default function TeamMemberCardExample() {
  const mockMember = {
    id: "1",
    name: "Sarah Chen",
    role: "Senior DevOps Engineer",
    skills: ["Kubernetes", "AWS", "Docker", "Python", "Terraform"],
    currentCapacity: 85,
    weeklyHours: 40,
    avatar: undefined
  };

  return (
    <div className="p-4 max-w-sm">
      <TeamMemberCard 
        member={mockMember} 
        onClick={() => console.log('TeamMember card clicked')} 
      />
    </div>
  );
}