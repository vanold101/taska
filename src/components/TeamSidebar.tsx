
import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { Team, TeamMember } from '@/types';
import { useMediaQuery } from '@/hooks/use-mobile';
import { toast } from 'sonner';

export const TeamSidebar = () => {
  const { teams, addTeam, currentTeam, setCurrentTeam, currentUser } = useTaskContext();
  const [newTeamName, setNewTeamName] = useState('');
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }
    
    addTeam({
      name: newTeamName,
      members: currentUser ? [currentUser] : []
    });
    
    setNewTeamName('');
    setCreateTeamOpen(false);
  };
  
  const handleSwitchTeam = (team: Team) => {
    setCurrentTeam(team);
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  if (isMobile && !isOpen) {
    return (
      <Button 
        className="fixed top-4 left-4 z-50 rounded-full w-10 h-10 p-0 bg-primary/90 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    );
  }
  
  const sidebarContent = (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-lg">Teams</h2>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <div className="space-y-1 px-3">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleSwitchTeam(team)}
              className={`w-full flex items-center p-2 rounded-md transition-colors ${
                currentTeam?.id === team.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-sidebar-muted/10'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 font-medium">
                {team.name.charAt(0)}
              </div>
              <span className="truncate">{team.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex gap-2 items-center justify-start">
              <PlusCircle className="h-4 w-4" />
              <span>New Team</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <Button onClick={handleAddTeam} className="w-full">
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {currentUser && (
          <div className="flex items-center mt-3 p-2">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-sidebar-muted truncate capitalize">{currentUser.role}</p>
            </div>
          </div>
        )}
      </div>
      
      {isMobile && (
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
  
  return isMobile ? (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 left-0 w-64 z-50">
        {sidebarContent}
      </div>
    </div>
  ) : (
    <div className="hidden md:block w-64 shrink-0">
      {sidebarContent}
    </div>
  );
};
