
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TeamMember, Team, Location } from '../types';
import { mockTasks, mockTeam } from '../data/mockData';
import { toast } from "sonner";

interface TaskContextType {
  tasks: Task[];
  team: Team;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (task: Task) => void;
  getNearbyTasks: (currentLocation: Location) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [team] = useState<Team>(mockTeam);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
        setTasks(parsedTasks);
      } catch (e) {
        console.error('Error parsing tasks from localStorage:', e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setTasks([...tasks, newTask]);
    toast.success('Task added successfully');
  };

  const completeTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
    toast.success('Task completed!');
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success('Task deleted');
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    toast.success('Task updated');
  };

  const getNearbyTasks = (currentLocation: Location) => {
    // For mock purposes, just return all non-completed tasks
    // In a real app, this would calculate distance between coordinates
    return tasks.filter((task) => !task.completed);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        team,
        addTask,
        completeTask,
        deleteTask,
        updateTask,
        getNearbyTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
