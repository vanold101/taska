
import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { 
  PlusCircle, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Team, TeamMember } from '@/types';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function TeamSidebar() {
  const { team, teams, currentUser, currentTeam, setCurrentTeam, addTeam, updateTeam } = useTaskContext();
  const [newTeamName, setNewTeamName] = useState("");
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  const [expanded, setExpanded] = useState({
    channels: true,
    members: true
  });

  const toggleSection = (section: 'channels' | 'members') => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section]
    });
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }

    addTeam({
      name: newTeamName,
      members: currentUser ? [currentUser] : []
    });

    setNewTeamName("");
    setShowNewTeamDialog(false);
    toast.success(`Team "${newTeamName}" created!`);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="h-full flex flex-col">
      {/* Server List Section (Discord-style) */}
      <div className="w-[72px] bg-[#111827] border-r border-[#2D3748] flex flex-col items-center pt-4 pb-2 space-y-3">
        {teams?.map((t) => (
          <TooltipProvider key={t.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full relative hover:rounded-2xl transition-all duration-200",
                    t.id === currentTeam?.id ? "bg-[#3B82F6] text-white" : "bg-[#1F2937] text-gray-300 hover:bg-[#3B82F6]/80 hover:text-white"
                  )}
                  onClick={() => setCurrentTeam(t)}
                >
                  {t.id === currentTeam?.id && (
                    <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  <span className="text-xl font-semibold">
                    {t.name.substring(0, 2).toUpperCase()}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
          <DialogTrigger asChild>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-[#1F2937] text-[#10B981] hover:rounded-2xl transition-all duration-200 hover:bg-[#10B981]/20"
                  >
                    <PlusCircle className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Create New Team</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Input 
                placeholder="Team name" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Button type="submit" onClick={handleCreateTeam}>Create Team</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Channel List Section */}
      <div className="w-60 bg-[#1E293B] flex flex-col h-full">
        {currentTeam && (
          <>
            <div className="p-3 border-b border-[#2D3748] shadow-sm">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between px-2 text-white hover:bg-[#2D3748]"
                  >
                    <span className="font-semibold truncate">{currentTeam.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem className="cursor-pointer flex gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Team Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="cursor-pointer flex gap-2 text-[#EF4444]">
                    <LogOut className="h-4 w-4" />
                    <span>Leave Team</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ScrollArea className="flex-1 px-3 py-2">
              {/* Channels Section */}
              <div className="mb-4">
                <div 
                  className="flex items-center text-[#E5E7EB]/70 text-xs font-semibold px-2 py-1.5 cursor-pointer select-none"
                  onClick={() => toggleSection('channels')}
                >
                  {expanded.channels ? 
                    <ChevronDown className="h-3.5 w-3.5 mr-1" /> : 
                    <ChevronRight className="h-3.5 w-3.5 mr-1" />
                  }
                  <span className="uppercase">Tasks</span>
                </div>

                {expanded.channels && (
                  <div className="mt-1 space-y-0.5">
                    <Button
                      variant="ghost"
                      className="w-full justify-start pl-6 py-1 h-8 text-sm text-[#E5E7EB]/90 hover:text-white hover:bg-[#2D3748]"
                    >
                      <CheckSquare className="h-4 w-4 mr-2 text-[#3B82F6]" />
                      <span>All Tasks</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start pl-6 py-1 h-8 text-sm text-[#E5E7EB]/90 hover:text-white hover:bg-[#2D3748]"
                    >
                      <CheckSquare className="h-4 w-4 mr-2 text-[#F59E0B]" />
                      <span>Important</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start pl-6 py-1 h-8 text-sm text-[#E5E7EB]/90 hover:text-white hover:bg-[#2D3748]"
                    >
                      <CheckSquare className="h-4 w-4 mr-2 text-[#10B981]" />
                      <span>Completed</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Members Section */}
              <div>
                <div 
                  className="flex items-center text-[#E5E7EB]/70 text-xs font-semibold px-2 py-1.5 cursor-pointer select-none"
                  onClick={() => toggleSection('members')}
                >
                  {expanded.members ? 
                    <ChevronDown className="h-3.5 w-3.5 mr-1" /> : 
                    <ChevronRight className="h-3.5 w-3.5 mr-1" />
                  }
                  <span className="uppercase">Members</span>
                  {isAdmin && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 ml-auto text-[#E5E7EB]/70 hover:text-white hover:bg-[#2D3748]"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-3">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Invite Member</h4>
                          <Input placeholder="Email address" />
                          <Button size="sm" className="w-full">Send Invite</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {expanded.members && (
                  <div className="mt-1 space-y-0.5">
                    {currentTeam.members?.map((member: TeamMember) => (
                      <div 
                        key={member.id}
                        className="flex items-center gap-2 px-6 py-1.5 rounded-md hover:bg-[#2D3748] text-[#E5E7EB]/90 hover:text-white group"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                        {member.role === 'admin' && (
                          <span className="ml-auto text-[0.65rem] bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded-sm">ADMIN</span>
                        )}
                        {member.role === 'manager' && (
                          <span className="ml-auto text-[0.65rem] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded-sm">MANAGER</span>
                        )}
                      </div>
                    ))}

                    {isAdmin && currentTeam.members?.length < 3 && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start pl-6 py-1 h-8 text-sm text-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/10"
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                        <span>Invite Members</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* User Section */}
            {currentUser && (
              <div className="p-2 border-t border-[#2D3748] mt-auto">
                <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#2D3748] group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-[#3B82F6] text-white">
                      {currentUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
                    <div className="text-xs text-[#E5E7EB]/60 truncate">{currentUser.role}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-auto h-7 w-7 rounded-full opacity-70 hover:opacity-100 hover:bg-[#3B82F6]/20 hover:text-[#3B82F6]"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-[#EF4444]">Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
