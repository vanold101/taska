import React from 'react';
import { MapPin, Navigation, BellRing } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { Location, Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LocationBanner = () => {
  const { tasks = [], nearbyTasks = [] } = useTaskContext();
  
  // Filter active tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // Extract unique locations from tasks
  const uniqueLocations: Record<string, Location & { tasks: Task[] }> = {};
  
  // Group tasks by location name
  tasks.forEach(task => {
    const locationName = task.location.name;
    if (!uniqueLocations[locationName]) {
      uniqueLocations[locationName] = {
        ...task.location,
        tasks: []
      };
    }
    uniqueLocations[locationName].tasks.push(task);
  });
  
  // Convert to array and add display coordinates
  const taskLocations = Object.values(uniqueLocations).map((location, index) => {
    // In a real app, we would use the actual coordinates
    // For now, we'll assign fixed positions in a circular pattern
    const totalPositions = Object.keys(uniqueLocations).length;
    const angle = (index / totalPositions) * 2 * Math.PI;
    const radius = 30; // % distance from center
    const centerX = 50;
    const centerY = 50;
    
    // Check if this location has any nearby tasks
    const hasNearbyTasks = nearbyTasks?.some(task => task.location.name === location.name) || false;
    
    return {
      id: `loc-${index}`,
      name: location.name,
      coordinates: location.coordinates,
      x: centerX + radius * Math.cos(angle), // x position (%)
      y: centerY + radius * Math.sin(angle), // y position (%)
      tasks: location.tasks,
      hasActive: location.tasks.some(task => !task.completed),
      hasCompleted: location.tasks.some(task => task.completed),
      activeCount: location.tasks.filter(task => !task.completed).length,
      completedCount: location.tasks.filter(task => task.completed).length,
      isNearby: hasNearbyTasks
    };
  });
  
  // For demo purposes, simulate user location is near the first location with nearby tasks
  const closestLocation = taskLocations.find(loc => loc.isNearby) || 
                         taskLocations.find(loc => loc.hasActive) || 
                         taskLocations[0];
  
  return (
    <div className="relative h-72 mb-8 rounded-xl overflow-hidden premium-card">
      {/* Static Map Container */}
      <div className="absolute inset-0 bg-[#e6f4f9] z-0">
        {/* Map grid for visual reference */}
        <div className="h-full w-full relative">
          {/* City name */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#84c9e6] font-display font-medium opacity-20 text-4xl whitespace-nowrap">
            Columbus, Ohio
          </div>
          
          {/* Grid lines */}
          <div className="grid grid-cols-6 grid-rows-6 h-full w-full opacity-30">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border border-[#a8d8eb]"></div>
            ))}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-[30%] left-[20%] w-16 h-16 rounded-full bg-[#cceaf6] opacity-30"></div>
          <div className="absolute bottom-[25%] right-[25%] w-20 h-20 rounded-full bg-[#cceaf6] opacity-30"></div>
          
          {/* Main roads */}
          <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-[#a8d8eb] opacity-40"></div>
          <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-[#a8d8eb] opacity-40"></div>
          <div className="absolute top-0 right-0 bottom-[70%] left-[30%] border-b-2 border-r-2 border-[#a8d8eb] opacity-30 rounded-br-3xl"></div>
          
          {/* Task location pins */}
          {taskLocations.map((location) => (
            <div 
              key={location.id}
              className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 ${location.id === closestLocation?.id ? 'z-30' : ''}`}
              style={{ top: `${location.y}%`, left: `${location.x}%` }}
            >
              <div className={`relative group ${location.id === closestLocation?.id ? 'scale-110' : ''}`}>
                <div className={`
                  ${location.id === closestLocation?.id ? 'text-accent animate-pulse' : 'text-primary/80'}
                  ${location.isNearby ? 'animate-bounce' : ''}
                `}>
                  <MapPin className={`h-5 w-5 drop-shadow-sm ${location.isNearby ? 'filter drop-shadow-md' : ''}`} />
                </div>
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white p-1.5 px-2.5 rounded text-xs shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="font-medium mb-1">{location.name}</div>
                  {location.activeCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-primary">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>{location.activeCount} active task{location.activeCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {location.completedCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-success">
                      <div className="w-1.5 h-1.5 bg-success rounded-full" />
                      <span>{location.completedCount} completed</span>
                    </div>
                  )}
                  {location.isNearby && (
                    <div className="flex items-center gap-1 text-[10px] text-accent mt-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      <span>You are nearby!</span>
                    </div>
                  )}
                </div>
                {location.id === closestLocation?.id && (
                  <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[10px] font-semibold bg-accent/90 text-white py-0.5 px-1.5 rounded-full whitespace-nowrap">
                    Closest
                  </span>
                )}
                {location.hasActive && (
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border border-white"></div>
                )}
                {location.hasCompleted && (
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-success rounded-full border border-white"></div>
                )}
                {location.isNearby && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-white animate-pulse">
                    <BellRing className="h-2 w-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* User location (center blue dot) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="relative">
              <div className="h-4 w-4 bg-primary rounded-full shadow-md border-2 border-white"></div>
              <div className="absolute h-10 w-10 bg-primary/20 rounded-full -top-3 -left-3 animate-ping"></div>
              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] bg-primary/80 text-white py-0.5 px-1.5 rounded-full whitespace-nowrap">
                You
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map title overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white/90 via-white/70 to-transparent p-4 backdrop-blur-sm z-40">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <Navigation className="h-4 w-4 text-primary mr-1.5" />
              <h3 className="text-sm font-medium text-primary">Taska Locations</h3>
            </div>
            <p className="text-xs text-muted-foreground ml-5.5">
              {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''} in Columbus, Ohio
            </p>
          </div>
          
          {nearbyTasks && nearbyTasks.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1.5">
                    <BellRing className="h-3 w-3" />
                    {nearbyTasks.length} nearby
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">You have {nearbyTasks.length} tasks nearby!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationBanner;
