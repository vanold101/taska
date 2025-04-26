
import React from 'react';
import { MapPin } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { Task } from '@/types';

// In a real app, this would use geolocation APIs
const LocationBanner = () => {
  // Simulate that we're at "Kroger"
  const currentLocation = { name: "Kroger" };
  
  const { tasks } = useTaskContext();
  
  const nearbyTasks = tasks.filter(
    task => !task.completed && task.location.name === currentLocation.name
  );

  if (nearbyTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="bg-primary/20 p-2 rounded-full mt-1">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">You're at {currentLocation.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You have {nearbyTasks.length} task{nearbyTasks.length !== 1 ? 's' : ''} to complete here
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationBanner;
