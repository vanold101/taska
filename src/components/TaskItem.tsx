
import React from 'react';
import { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { MapPin, Check, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { completeTask, deleteTask } = useTaskContext();

  return (
    <div className={cn('task-item', task.completed && 'done', 'animate-fade-in')}>
      <div className="mr-2">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'w-6 h-6 rounded-full border-2',
            task.completed ? 'bg-success border-success text-success-foreground' : 'border-muted-foreground'
          )}
          onClick={() => !task.completed && completeTask(task.id)}
          disabled={task.completed}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </Button>
      </div>
      
      <div className="flex-grow">
        <h3 className={cn('font-medium', task.completed && 'line-through text-muted-foreground')}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="location-badge">
            <MapPin className="h-3 w-3" />
            {task.location.name}
          </span>
          
          {task.dueDate && (
            <span className="location-badge">
              <Calendar className="h-3 w-3" />
              {format(task.dueDate, 'MMM d')}
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
