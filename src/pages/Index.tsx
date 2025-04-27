import React from 'react';
import { Link } from 'react-router-dom';
import { TaskProvider, useTaskContext } from '@/context/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import TeamHeader from '@/components/TeamHeader';
import LocationBanner from '@/components/LocationBanner';
import { Umbrella, Sparkles, Map, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminSection = () => {
  const { currentUser } = useTaskContext();
  
  if (currentUser?.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="my-4">
      <Link to="/team">
        <Button variant="outline" className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>Manage Team</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
};

const Index = () => {
  return (
    <TaskProvider>
      <div className="min-h-screen">
        <div className="container max-w-md mx-auto py-10 px-4">
          <header className="mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1 className="text-[32px] font-inter font-semibold text-center text-[#121212]">Taska</h1>
            </div>
            <p className="text-muted-foreground text-center text-sm flex items-center justify-center gap-1">
              Where Every Task Has a Place
            </p>
          </header>
          
          <TeamHeader />
          
          <AdminSection />
          
          <div className="my-8">
            <AddTaskForm />
          </div>
          
          <LocationBanner />
          
          <Card className="overflow-hidden border-0 shadow-lg rounded-xl premium-card">
            <CardContent className="p-6">
              <TaskList />
            </CardContent>
          </Card>
          
          <footer className="mt-10 text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Map className="h-3 w-3" />
              <span>Columbus, Ohio</span>
            </div>
            <p>© 2025 Taska - Famka Products, LLC</p>
          </footer>
        </div>
      </div>
    </TaskProvider>
  );
};

export default Index;
