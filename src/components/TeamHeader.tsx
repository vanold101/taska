
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaskContext } from '@/context/TaskContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Mail, Phone, Settings } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Team } from '@/types';

const TeamHeader = () => {
  const { team, addTeamMember, currentUser } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'manager' | 'member'>('member');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');

  // Ensure team is always an array before using array methods
  const teamMembers = Array.isArray(team) ? team : [];

  // Create a Team object from the teamMembers array for display purposes
  const teamObj: Team = {
    id: 'team-1',
    name: 'Product Team',
    members: teamMembers
  };

  const validateContact = (type: 'email' | 'phone', value: string) => {
    if (type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return /^\+?\d{10,}$/.test(value);
  };

  const handleInvite = () => {
    if (!newMemberName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (!validateContact(contactType, contactValue)) {
      toast.error(`Please enter a valid ${contactType}`);
      return;
    }

    addTeamMember({
      name: newMemberName,
      role: newMemberRole,
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${newMemberName}`,
      contact: {
        type: contactType,
        value: contactValue
      }
    });

    setNewMemberName('');
    setNewMemberRole('member');
    setContactValue('');
    setOpen(false);
    toast.success(`${newMemberName} has been invited to the team as ${newMemberRole}`);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="flex items-center justify-between bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
      <div>
        <h2 className="text-xl font-bold text-[#111827]">{teamObj.name}</h2>
        <p className="text-sm text-gray-600">
          {teamObj.members.length} members
        </p>
      </div>
      <div className="flex items-center -space-x-2">
        {teamObj.members.slice(0, 3).map((member) => (
          <Avatar key={member.id} className="border-2 border-white">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
        {teamObj.members.length > 3 && (
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium border-2 border-white">
            +{teamObj.members.length - 3}
          </div>
        )}
        
        {isAdmin && (
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="ml-1" title="Invite team member">
                  <UserPlus className="h-5 w-5 text-[#3B82F6]" />
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
                    <Label className="text-right">
                      Contact via
                    </Label>
                    <RadioGroup
                      className="col-span-3 flex gap-4"
                      value={contactType}
                      onValueChange={(value: 'email' | 'phone') => setContactType(value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <Label htmlFor="phone" className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact" className="text-right">
                      {contactType === 'email' ? 'Email' : 'Phone'}
                    </Label>
                    <Input
                      id="contact"
                      type={contactType === 'email' ? 'email' : 'tel'}
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      className="col-span-3"
                      placeholder={contactType === 'email' ? 'john@example.com' : '+1234567890'}
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
                    <p className="text-xs text-gray-600 mt-2">
                      <strong>Admin:</strong> Full control over team and tasks
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Manager:</strong> Can add/remove tasks only
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Member:</strong> Can only mark tasks as complete/incomplete
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleInvite} className="bg-[#3B82F6] hover:bg-[#2563EB]">
                    Invite Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Link to="/team">
              <Button size="icon" variant="ghost" className="ml-1" title="Manage team">
                <Settings className="h-5 w-5 text-[#3B82F6]" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamHeader;
