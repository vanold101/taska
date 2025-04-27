
import React from 'react';
import { MapPin } from 'lucide-react';

const TaskMap = () => {
  return (
    <div className="relative w-full h-64 bg-accent/10 rounded-lg border-2 border-dashed border-accent flex items-center justify-center mb-6">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
        <p className="text-muted-foreground">Map view coming soon!</p>
        <p className="text-sm text-muted-foreground">Connect to Supabase to enable location features</p>
      </div>
    </div>
  );
};

export default TaskMap;
