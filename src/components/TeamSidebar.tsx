import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Team } from '@/types';

export function TeamSidebar() {
  const { team } = useTaskContext();
  
  // Mock teams for the demo - in a real app, this would come from a context or API
  const teams: Team[] = [
    {
      id: 'team-1',
      name: 'Product Team',
      members: team
    },
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
  
  // Current team is the first one
  const currentTeam = teams[0];

  // In a real implementation, this would update the context
  const setCurrentTeam = (team: Team) => {
    console.log(`Switching to team: ${team.id}`);
  };

  return (
    <div className="h-full w-56 flex flex-col bg-muted/40 border-r">
      <div className="p-2">
        <h2 className="text-lg font-semibold mb-2 px-2 font-inter">Teams</h2>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-1 p-2">
            {teams?.map((team) => (
              <Button
                key={team.id}
                variant={team.id === currentTeam?.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-normal font-inter",
                  team.id === currentTeam?.id && "font-medium"
                )}
                onClick={() => setCurrentTeam(team)}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage 
                    src={`https://avatar.vercel.sh/${team.name}.png`} 
                    alt={team.name} 
                  />
                  <AvatarFallback>
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {team.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button variant="outline" size="sm" className="w-full font-inter font-semibold">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>
    </div>
  );
} 