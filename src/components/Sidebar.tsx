import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Users, 
  Settings, 
  LogOut, 
  CheckSquare, 
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Team } from '@/types';

interface SidebarProps {
  onManageTeam: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onManageTeam }) => {
  const { team, currentUser } = useTaskContext();
  const [activeSection, setActiveSection] = useState<'tasks' | 'team'>('tasks');
  const [expanded, setExpanded] = useState({
    tasks: true,
    team: true
  });

  // Mock teams for the demo - in a real app, this would come from a context or API
  const mockTeams: Team[] = [
    team,
    {
      id: 'team-2',
      name: 'Marketing Team',
      members: []
    },
    {
      id: 'team-3',
      name: 'Design Team',
      members: []
    }
  ];

  // In a real app, this would actually switch teams via context or API
  const switchTeam = (teamId: string) => {
    console.log(`Switching to team: ${teamId}`);
    // Would update the context/state here
  };

  const toggleSection = (section: 'tasks' | 'team') => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section]
    });
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="h-screen w-56 bg-muted/30 border-r flex flex-col">
      {/* Team Selector (like Discord server selector) */}
      <div className="p-3 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-2 hover:bg-muted/60 rounded-md">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">{team.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <div className="p-2 text-xs text-muted-foreground">
              Switch Team
            </div>
            {mockTeams.map((t) => (
              <DropdownMenuItem 
                key={t.id} 
                onClick={() => switchTeam(t.id)}
                className={cn(
                  "flex items-center gap-2 p-2", 
                  t.id === team.id && "bg-primary/10 text-primary"
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={t.id === team.id ? "bg-primary text-primary-foreground" : ""}>
                    {t.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{t.name}</span>
                {t.id === team.id && (
                  <CheckSquare className="h-4 w-4 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 p-2">
              <Plus className="h-4 w-4" />
              <span>Create New Team</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Sidebar Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
        {/* Tasks Section */}
        <div>
          <div 
            className="flex items-center justify-between p-1 hover:bg-muted/60 rounded-md cursor-pointer text-sm text-muted-foreground"
            onClick={() => toggleSection('tasks')}
          >
            {expanded.tasks ? 
              <ChevronDown className="h-3.5 w-3.5" /> : 
              <ChevronRight className="h-3.5 w-3.5" />
            }
            <span className="font-medium uppercase text-xs flex-1 ml-1">Tasks</span>
          </div>
          
          {expanded.tasks && (
            <div className="mt-1 space-y-0.5 pl-4">
              <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/80 cursor-pointer text-sm">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span>All Tasks</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/80 cursor-pointer text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Calendar</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/80 cursor-pointer text-sm">
                <RefreshCw className="h-4 w-4 text-accent" />
                <span>Rotating Tasks</span>
              </div>
            </div>
          )}
        </div>

        {/* Team Section */}
        <div>
          <div 
            className="flex items-center justify-between p-1 hover:bg-muted/60 rounded-md cursor-pointer text-sm text-muted-foreground"
            onClick={() => toggleSection('team')}
          >
            {expanded.team ? 
              <ChevronDown className="h-3.5 w-3.5" /> : 
              <ChevronRight className="h-3.5 w-3.5" />
            }
            <span className="font-medium uppercase text-xs flex-1 ml-1">Team</span>
          </div>
          
          {expanded.team && (
            <div className="mt-1 space-y-0.5 pl-4">
              {team.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/80 cursor-pointer text-sm"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                  {member.role === 'admin' && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 rounded">Admin</span>
                  )}
                </div>
              ))}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-xs mt-2" 
                  size="sm"
                  onClick={onManageTeam}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Manage Team
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="p-2 border-t flex items-center justify-between">
        {currentUser && (
          <div className="flex items-center gap-2 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{currentUser.name}</div>
              <div className="text-xs text-muted-foreground truncate">{currentUser.role}</div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 