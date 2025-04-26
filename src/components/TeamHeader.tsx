
import { useTaskContext } from '@/context/TaskContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TeamHeader = () => {
  const { team } = useTaskContext();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold">{team.name}</h2>
        <p className="text-sm text-muted-foreground">
          {team.members.length} members
        </p>
      </div>
      <div className="flex items-center -space-x-2">
        {team.members.slice(0, 3).map((member) => (
          <Avatar key={member.id} className="border-2 border-background">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
        {team.members.length > 3 && (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium border-2 border-background">
            +{team.members.length - 3}
          </div>
        )}
        <Button size="icon" variant="ghost" className="ml-1" title="Invite team member">
          <UserPlus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default TeamHeader;
