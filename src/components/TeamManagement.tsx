import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaskContext, TaskProvider } from '@/context/TaskContext';
import { TeamMember, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { AlertCircle, Edit, Plus, Trash2, User, UserPlus, X, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { v4 as uuidv4 } from 'uuid';

const TeamManagementContent: React.FC = () => {
  const { team, updateTeam, currentUser } = useTaskContext();
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'member',
    avatar: ''
  });
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  // Create a Team object for display purposes
  const teamObj: Team = {
    id: 'team-1',
    name: 'Product Team',
    members: team || []
  };

  // Check if user has admin rights
  if (currentUser?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">Only administrators can access team management features.</p>
        <Link to="/">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  const resetNewMember = () => {
    setNewMember({
      name: '',
      email: '',
      role: 'member',
      avatar: ''
    });
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const newTeamMember: TeamMember = {
        id: uuidv4(),
        name: newMember.name,
        role: newMember.role as 'admin' | 'member' | 'manager',
        avatar: newMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMember.name}`,
        contact: {
          type: 'email',
          value: newMember.email
        }
      };
      
      // Just add to the team array, no members property
      updateTeam([...team, newTeamMember]);
      
      resetNewMember();
      setIsAddMemberDialogOpen(false);
    }
  };

  const handleEditMember = () => {
    if (!memberToEdit) return;
    
    // Update the team array directly
    updateTeam(
      team.map(member => member.id === memberToEdit.id ? memberToEdit : member)
    );
    
    setMemberToEdit(null);
    setIsEditMemberDialogOpen(false);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    // Filter the team array directly
    updateTeam(
      team.filter(member => member.id !== memberToRemove.id)
    );
    
    setMemberToRemove(null);
    setIsRemoveDialogOpen(false);
  };

  const startEditMember = (member: TeamMember) => {
    setMemberToEdit({...member});
    setIsEditMemberDialogOpen(true);
  };

  const startRemoveMember = (member: TeamMember) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  const adminCount = team.filter(m => m.role === 'admin').length;

  return (
    <div className="container mx-auto py-4 max-w-4xl">
      <Link to="/" className="inline-flex items-center mb-6 text-primary hover:underline">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{teamObj.name}</h1>
            <p className="text-muted-foreground">Manage your team and access settings</p>
          </div>
          <TabsList className="grid grid-cols-2 w-[300px]">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="settings">Team Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">
              Members ({team.length})
            </h2>
            <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a new member to join your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={newMember.role}
                      onValueChange={(value) => setNewMember({...newMember, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="avatar">Avatar URL (optional)</Label>
                    <Input 
                      id="avatar" 
                      value={newMember.avatar}
                      onChange={(e) => setNewMember({...newMember, avatar: e.target.value})}
                      placeholder="https://example.com/avatar.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to generate an avatar automatically
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember} disabled={!newMember.name || !newMember.email}>
                    Add Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border">
            <div className="grid grid-cols-12 text-xs text-muted-foreground font-medium p-4 border-b">
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y">
              {team.map((member) => (
                <div key={member.id} className="grid grid-cols-12 items-center p-4 hover:bg-muted/40">
                  <div className="col-span-5 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                    </div>
                  </div>
                  <div className="col-span-4 text-sm text-muted-foreground">
                    {member.email || member.contact?.value || ''}
                  </div>
                  <div className="col-span-2">
                    <Badge 
                      variant={member.role === 'admin' ? "default" : "outline"}
                      className={member.role === 'admin' ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" : ""}
                    >
                      {member.role === 'admin' ? 'Admin' : (member.role === 'manager' ? 'Manager' : 'Member')}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => startEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => startRemoveMember(member)}
                      disabled={member.role === 'admin' && adminCount <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>
                Update your team information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" defaultValue={teamObj.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="team-description">Team Description</Label>
                <Input id="team-description" defaultValue="A collaborative task management team" />
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Team deletion</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Deleting a team will permanently remove all team data, including tasks and member assignments. 
                    This action cannot be undone.
                  </p>
                  <Button variant="outline" className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100">
                    Delete Team
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberDialogOpen} onOpenChange={setIsEditMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update team member information.
            </DialogDescription>
          </DialogHeader>
          {memberToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  value={memberToEdit.name}
                  onChange={(e) => setMemberToEdit({...memberToEdit, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={memberToEdit.email || memberToEdit.contact?.value || ''}
                  onChange={(e) => {
                    const emailValue = e.target.value;
                    setMemberToEdit({
                      ...memberToEdit, 
                      email: emailValue,
                      contact: {
                        ...memberToEdit.contact,
                        value: emailValue,
                        type: 'email'
                      }
                    });
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={memberToEdit.role}
                  onValueChange={(value: 'admin' | 'manager' | 'member') => {
                    // Prevent changing role if this would leave the team with no admins
                    if (value !== 'admin' && memberToEdit.role === 'admin' && adminCount <= 1) {
                      return;
                    }
                    setMemberToEdit({...memberToEdit, role: value});
                  }}
                  disabled={memberToEdit.role === 'admin' && adminCount <= 1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {memberToEdit.role === 'admin' && adminCount <= 1 && (
                  <p className="text-xs text-amber-500">
                    Cannot change role: team must have at least one admin
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-avatar">Avatar URL</Label>
                <Input 
                  id="edit-avatar" 
                  value={memberToEdit.avatar}
                  onChange={(e) => setMemberToEdit({...memberToEdit, avatar: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditMember} 
              disabled={!memberToEdit?.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from the team? 
              They will lose access to all team tasks and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const TeamManagement: React.FC = () => {
  return (
    <TaskProvider>
      <TeamManagementContent />
    </TaskProvider>
  );
};

export default TeamManagement; 