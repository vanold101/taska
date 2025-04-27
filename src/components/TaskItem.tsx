import React from 'react';
import { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { MapPin, Check, Calendar, Users, RotateCcw, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask, team } = useTaskContext();

  // Get recurrence text description
  const getRecurrenceText = () => {
    if (!task.recurrence || task.recurrence.type === 'none') return null;
    
    switch (task.recurrence.type) {
      case 'daily':
        return `Repeats every ${task.recurrence.interval === 1 ? 'day' : `${task.recurrence.interval} days`}`;
        
      case 'weekly':
        return `Repeats every ${task.recurrence.interval === 1 ? 'week' : `${task.recurrence.interval} weeks`}`;
        
      case 'monthly':
        return `Repeats every ${task.recurrence.interval === 1 ? 'month' : `${task.recurrence.interval} months`}`;
        
      case 'yearly':
        return `Repeats every ${task.recurrence.interval === 1 ? 'year' : `${task.recurrence.interval} years`}`;
        
      default:
        return null;
    }
  };
  
  // Get rotation text description
  const getRotationText = () => {
    if (!task.rotation || !task.rotation.enabled || task.rotation.memberIds.length < 2) return null;
    
    // Get team member names for the rotation
    const memberNames = task.rotation.memberIds.map(id => {
      const member = team.find(m => m.id === id);
      return member ? member.name : 'Unknown';
    });
    
    // Find the current member in rotation
    const currentIndex = task.rotation.currentIndex;
    const currentMemberName = memberNames[currentIndex] || 'Unknown';
    
    // Find the next member in rotation
    const nextIndex = (currentIndex + 1) % memberNames.length;
    const nextMemberName = memberNames[nextIndex] || 'Unknown';
    
    return {
      members: memberNames,
      current: currentMemberName,
      next: nextMemberName,
      total: memberNames.length
    };
  };
  
  const recurrenceText = getRecurrenceText();
  const rotationInfo = getRotationText();
  const isRecurring = !!recurrenceText;
  const isRotating = !!rotationInfo;
  const isInstance = !!task.parentTaskId;

  return (
    <div className={cn('task-item', task.completed && 'done', 'animate-fade-in')}>
      <div className="mr-2">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'w-6 h-6 rounded-full border-2',
            task.completed ? 'bg-success border-success text-success-foreground hover:bg-success/90' : 'border-muted-foreground'
          )}
          onClick={() => toggleTaskCompletion(task.id)}
          title={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </Button>
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center gap-1.5">
          <h3 className={cn(
            'font-inter text-base font-normal text-[#1A1A1A]', 
            task.completed && 'line-through text-[#B0B0B0]'
          )}>
            {task.title}
          </h3>
          
          {isRecurring && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-primary">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{recurrenceText}</p>
                  {isInstance && <p className="text-xs text-muted-foreground">This is a recurring task instance</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isRotating && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-accent">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium">Rotating task</p>
                  <p className="text-xs">Currently assigned to: {rotationInfo.current}</p>
                  <p className="text-xs text-muted-foreground">Next: {rotationInfo.next}</p>
                  <div className="mt-1 pt-1 border-t border-border">
                    <p className="text-xs">Rotation order:</p>
                    <p className="text-xs text-muted-foreground">{rotationInfo.members.join(' → ')}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 font-inter">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="location-badge">
            <MapPin className="h-3 w-3" />
            {task.location.name}
          </span>
          
          {task.dueDate && (
            <span className="location-badge font-inter text-sm text-[#666666]">
              <Calendar className="h-3 w-3" />
              Due by {format(task.dueDate, 'h:mm a')}
            </span>
          )}
          
          {task.assignedTo.length > 0 && (
            <span className="location-badge">
              <Users className="h-3 w-3" />
              {task.assignedTo.length === 1
                ? task.assignedTo[0].name
                : `${task.assignedTo[0].name} +${task.assignedTo.length - 1}`}
            </span>
          )}
          
          {isRecurring && (
            <span className="location-badge bg-primary/10 text-primary border-primary/20">
              <RotateCcw className="h-3 w-3" />
              Recurring
            </span>
          )}
          
          {isRotating && (
            <span className="location-badge bg-accent/10 text-accent border-accent/20">
              <RefreshCw className="h-3 w-3" />
              Rotating
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => deleteTask(task.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
