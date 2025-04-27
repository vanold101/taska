
import React from 'react';
import { TaskProvider } from '@/context/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import TeamHeader from '@/components/TeamHeader';
import LocationBanner from '@/components/LocationBanner';
import { Star, Sparkles, Map } from 'lucide-react';

const Index = () => {
  return (
    <TaskProvider>
      <div className="container max-w-md mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2 animate-bounce">
            <Star className="h-8 w-8 text-yellow-400 drop-shadow-md" />
            <h1 className="text-3xl font-semibold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Taska</h1>
            <Star className="h-8 w-8 text-yellow-400 drop-shadow-md" />
          </div>
          <p className="text-muted-foreground text-center flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4 text-primary" />
            Level up your productivity!
          </p>
        </header>
        
        <TeamHeader />
        
        <div className="my-6">
          <AddTaskForm />
        </div>
        
        <LocationBanner />
        
        <Card className="overflow-hidden border-2 border-primary/10 shadow-lg rounded-xl">
          <CardContent className="p-5">
            <TaskList />
          </CardContent>
        </Card>
        
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Map className="h-3 w-3" />
            <span>Locations powered by Mapbox</span>
          </div>
          <p>© 2025 Taska - Gamify your productivity</p>
        </footer>
      </div>
    </TaskProvider>
  );
};

export default Index;
