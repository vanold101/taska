
import React from 'react';
import { Link } from 'react-router-dom';
import { useTaskContext } from '@/context/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import TeamHeader from '@/components/TeamHeader';
import LocationBanner from '@/components/LocationBanner';
import { Umbrella, Sparkles, Map, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const AdminSection = () => {
  const { currentUser } = useTaskContext();
  
  if (currentUser?.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="my-4">
      <Link to="/team">
        <Button variant="outline" className="w-full flex items-center justify-between border-dashed">
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
  const { currentTeam } = useTaskContext();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f4f9] to-[#d0ebf5]">
      <div className="container max-w-md mx-auto py-10 px-4">
        <header className="mb-10 text-center">
          <div className="inline-block mb-3 relative">
            <h1 className="text-[32px] font-inter font-semibold text-center text-[#121212]">Taska</h1>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] rounded-full flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            Where Every Task Has a Place
          </p>
        </header>
        
        {currentTeam && <TeamHeader />}
        
        <AdminSection />
        
        <div className="my-8">
          <div className="add-task-container transform hover:scale-[1.01] transition-all duration-200">
            <AddTaskForm />
          </div>
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
  );
};

export default Index;
