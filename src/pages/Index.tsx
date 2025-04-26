
import React from 'react';
import { TaskProvider } from '@/context/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import TeamHeader from '@/components/TeamHeader';
import LocationBanner from '@/components/LocationBanner';

const Index = () => {
  return (
    <TaskProvider>
      <div className="container max-w-md mx-auto py-6 px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Spot-it-Done</h1>
          <p className="text-muted-foreground text-center">Location-based tasks for teams</p>
        </header>
        
        <TeamHeader />
        
        <div className="my-6">
          <AddTaskForm />
        </div>
        
        <LocationBanner />
        
        <Card>
          <CardContent className="p-4">
            <TaskList />
          </CardContent>
        </Card>
      </div>
    </TaskProvider>
  );
};

export default Index;
