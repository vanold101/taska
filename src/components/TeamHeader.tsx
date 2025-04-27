
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TeamHeader = () => {
  const { team, addTeamMember } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'manager' | 'member'>('member');

  const handleInvite = () => {
    if (!newMemberName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    addTeamMember({
      id: Date.now().toString(),
      name: newMemberName,
      role: newMemberRole,
      avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${Date.now()}`,
    });

    setNewMemberName('');
    setNewMemberRole('member');
    setOpen(false);
    toast.success(`${newMemberName} has been invited to the team as ${newMemberRole}`);
  };

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
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="ml-1" title="Invite team member">
              <UserPlus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
              <DialogDescription>
                Add a new member to the team with specific permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="col-span-3"
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={newMemberRole} onValueChange={(value: 'admin' | 'manager' | 'member') => setNewMemberRole(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-full px-1">
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Admin:</strong> Full control over team and tasks
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Manager:</strong> Can add/remove tasks only
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Member:</strong> Can only mark tasks as complete/incomplete
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite}>Invite Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeamHeader;
