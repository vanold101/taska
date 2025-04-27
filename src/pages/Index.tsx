
import React from 'react';
import { TaskProvider } from '@/context/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import TeamHeader from '@/components/TeamHeader';
import LocationBanner from '@/components/LocationBanner';
import { Star } from 'lucide-react';

const Index = () => {
  return (
    <TaskProvider>
      <div className="container max-w-md mx-auto py-6 px-4">
        <header className="mb-6 animate-bounce">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-center">Taska</h1>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-muted-foreground text-center">Level up your productivity!</p>
        </header>
        
        <TeamHeader />
        
        <div className="my-6">
          <AddTaskForm />
        </div>
        
        <LocationBanner />
        
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardContent className="p-4">
            <TaskList />
          </CardContent>
        </Card>
      </div>
    </TaskProvider>
  );
};

export default Index;
