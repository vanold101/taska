import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { format, isSameDay } from 'date-fns';
import { DayPicker, DayContentProps } from 'react-day-picker';
import { Calendar, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TaskItem from './TaskItem';

import 'react-day-picker/dist/style.css';

const TaskCalendar = () => {
  const { tasks } = useTaskContext();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  
  // Filter active tasks with due dates
  const tasksWithDueDate = tasks.filter(task => task.dueDate);
  
  // Get tasks for the selected day
  const selectedDayTasks = selectedDay 
    ? tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), selectedDay))
    : [];
  
  // Create an array of dates that have tasks
  const taskDates = tasksWithDueDate.map(task => new Date(task.dueDate as Date));
  
  // Custom day renderer to show dots under days with tasks
  const dayWithTasksStyle = { 
    backgroundColor: 'rgba(37, 144, 196, 0.1)',
    borderRadius: '0',
    color: 'hsl(var(--primary))',
    fontWeight: 'bold'
  };
  
  // Function to check if a day has tasks
  const isDayWithTasks = (day: Date) => {
    return taskDates.some(taskDate => isSameDay(taskDate, day));
  };

  // Modify the day content to add a dot for days with tasks
  const DayWithTasksContent = (props: DayContentProps) => {
    const { date } = props;
    // Count tasks for this day
    const tasksForDay = tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), date));
    const activeTasksCount = tasksForDay.filter(task => !task.completed).length;
    const completedTasksCount = tasksForDay.filter(task => task.completed).length;
    
    if (tasksForDay.length > 0) {
      return (
        <div className="relative">
          <div>{format(date, 'd')}</div>
          <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
            {activeTasksCount > 0 && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            )}
            {completedTasksCount > 0 && (
              <div className="w-1.5 h-1.5 bg-success rounded-full" />
            )}
          </div>
        </div>
      );
    }
    
    return <div>{format(date, 'd')}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 shadow-sm">
        <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          Task Calendar
        </h3>
        
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            modifiers={{ withTasks: day => isDayWithTasks(day) }}
            modifiersStyles={{ withTasks: dayWithTasksStyle }}
            components={{
              DayContent: DayWithTasksContent,
            }}
            styles={{
              caption: { color: 'hsl(var(--primary))' },
              day: { margin: '0.2em' },
              nav_button: { color: 'hsl(var(--primary))' },
              head_row: { color: 'hsl(var(--muted-foreground))' },
            }}
            className="bg-white/50 rounded-lg p-3 mx-auto"
            footer={
              <div className="mt-2 text-xs flex justify-between text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Active Tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Completed Tasks</span>
                </div>
              </div>
            }
          />
        </div>
      </div>
      
      {selectedDay && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-foreground flex items-center gap-2">
              Tasks for {format(selectedDay, 'PPP')}
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedDay(new Date())}
              className="text-xs text-muted-foreground"
            >
              Today
            </Button>
          </div>
          
          {selectedDayTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedDayTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card className="py-6 text-center text-muted-foreground flex flex-col items-center gap-2">
              <CheckCircle className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p>No tasks scheduled for this day</p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2 text-xs"
                onClick={() => {
                  // Would open add task modal with selected date
                  // For now, just log it
                  console.log('Add task for', format(selectedDay, 'PPP'));
                }}
              >
                Add a task
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCalendar; 