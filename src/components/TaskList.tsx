
import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskItem from './TaskItem';
import { Task } from '../types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin } from 'lucide-react';

const TaskList: React.FC = () => {
  const { tasks } = useTaskContext();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    return task.completed;
  });

  // Group tasks by location
  const tasksByLocation: Record<string, Task[]> = {};
  filteredTasks.forEach((task) => {
    const locationName = task.location.name;
    if (!tasksByLocation[locationName]) {
      tasksByLocation[locationName] = [];
    }
    tasksByLocation[locationName].push(task);
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger 
            value="all" 
            onClick={() => setFilter('all')}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            onClick={() => setFilter('active')}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            onClick={() => setFilter('completed')}
            className="data-[state=active]:bg-success data-[state=active]:text-success-foreground"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-2">
          {Object.entries(tasksByLocation).map(([location, locationTasks]) => (
            <div key={location} className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {location}
              </h3>
              <div className="space-y-2">
                {locationTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-2 mt-2">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active tasks
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2 mt-2">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No completed tasks
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskList;
