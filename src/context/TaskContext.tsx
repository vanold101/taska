
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
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (memberId: string) => void;
  currentUser: TeamMember | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [team, setTeam] = useState<Team>(mockTeam);
  
  // For simplicity, we'll set the first team member as the current user (usually would be from auth)
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(mockTeam.members[0]);

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
    
    // Also load team from localStorage if available
    const savedTeam = localStorage.getItem('team');
    if (savedTeam) {
      try {
        const parsedTeam = JSON.parse(savedTeam);
        setTeam(parsedTeam);
        // Set the first admin as current user or fall back to the first member
        const admin = parsedTeam.members.find((m: TeamMember) => m.role === 'admin');
        setCurrentUser(admin || parsedTeam.members[0]);
      } catch (e) {
        console.error('Error parsing team from localStorage:', e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Save team to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('team', JSON.stringify(team));
  }, [team]);

  // Check if user has permission to perform an action
  const hasPermission = (action: 'add' | 'delete' | 'update' | 'complete') => {
    if (!currentUser) return false;
    
    switch (currentUser.role) {
      case 'admin':
        return true;
      case 'manager':
        return action === 'add' || action === 'delete' || action === 'update';
      case 'member':
        return action === 'complete';
      default:
        return false;
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!hasPermission('add')) {
      toast.error('You do not have permission to add tasks');
      return;
    }
    
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setTasks([...tasks, newTask]);
    toast.success('Task added successfully');
  };

  const completeTask = (taskId: string) => {
    if (!hasPermission('complete')) {
      toast.error('You do not have permission to complete tasks');
      return;
    }
    
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
    toast.success('Task completed!');
  };

  const deleteTask = (taskId: string) => {
    if (!hasPermission('delete')) {
      toast.error('You do not have permission to delete tasks');
      return;
    }
    
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success('Task deleted');
  };

  const updateTask = (updatedTask: Task) => {
    if (!hasPermission('update')) {
      toast.error('You do not have permission to update tasks');
      return;
    }
    
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
  
  const addTeamMember = (member: TeamMember) => {
    if (currentUser?.role !== 'admin') {
      toast.error('Only admins can add team members');
      return;
    }
    
    setTeam({
      ...team,
      members: [...team.members, member]
    });
  };
  
  const removeTeamMember = (memberId: string) => {
    if (currentUser?.role !== 'admin') {
      toast.error('Only admins can remove team members');
      return;
    }
    
    // Cannot remove yourself
    if (memberId === currentUser.id) {
      toast.error('You cannot remove yourself from the team');
      return;
    }
    
    setTeam({
      ...team,
      members: team.members.filter(m => m.id !== memberId)
    });
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
        addTeamMember,
        removeTeamMember,
        currentUser,
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
