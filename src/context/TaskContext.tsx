import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Task, TeamMember, Team, Location, RecurrencePattern } from '../types';
import { mockTasks, mockTeam } from '../data/mockData';
import { toast } from "sonner";
import { addDays, addMonths, addWeeks, addYears, format, isAfter, isSameDay, startOfDay } from 'date-fns';
import { setupGeofencing, findNearbyTasks, getUserLocation } from '@/services/LocationService';
import { v4 as uuidv4 } from 'uuid';

export interface TaskContextType {
  tasks: Task[];
  team: TeamMember[];
  teams: Team[];
  currentUser: TeamMember | null;
  currentTeam: Team | null;
  nearbyTasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  updateTeam: (updatedMembers: TeamMember[]) => void;
  setCurrentTeam: (team: Team) => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 'team-1',
      name: 'Product Team',
      members: mockTeam.members
    },
    {
      id: 'team-2',
      name: 'Marketing Team',
      members: []
    },
    {
      id: 'team-3',
      name: 'Design Team',
      members: []
    }
  ]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  
  // For simplicity, we'll set the first team member as the current user (usually would be from auth)
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(mockTeam.members[0]);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [team, setTeam] = useState<TeamMember[]>(mockTeam.members);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const geofencingRef = useRef<(() => void) | null>(null);
  
  // Set initial currentTeam
  useEffect(() => {
    if (teams.length > 0 && !currentTeam) {
      setCurrentTeam(teams[0]);
    }
  }, [teams, currentTeam]);

  // Load teams from localStorage on component mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      try {
        const parsedTeams = JSON.parse(savedTeams);
        setTeams(parsedTeams);
        // Set the first team as current
        if (parsedTeams.length > 0) {
          setCurrentTeam(parsedTeams[0]);
        }
      } catch (e) {
        console.error('Error parsing teams from localStorage:', e);
      }
    }
    
    // Also load tasks from localStorage if available
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
        const admin = parsedTeam.find((m: TeamMember) => m.role === 'admin');
        setCurrentUser(admin || parsedTeam[0]);
      } catch (e) {
        console.error('Error parsing team from localStorage:', e);
      }
    }
  }, []);

  // Setup geofencing whenever tasks change
  useEffect(() => {
    // First, clean up the previous geofencing
    if (geofencingRef.current) {
      geofencingRef.current();
      geofencingRef.current = null;
    }
    
    // Only set up geofencing for tasks with coordinates
    const tasksWithCoordinates = tasks.filter(task => 
      !task.completed && task.location.coordinates);
    
    if (tasksWithCoordinates.length) {
      geofencingRef.current = setupGeofencing(tasksWithCoordinates, (task) => {
        // Show notification when user enters a task's geofence
        toast.info(
          <div>
            <p className="font-medium">You're near a task!</p>
            <p className="text-sm">{task.title}</p>
            <p className="text-xs text-muted-foreground">at {task.location.name}</p>
          </div>,
          {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => console.log("Viewing task", task.id)
            }
          }
        );
      });
    }
    
    // Clean up geofencing when component unmounts
    return () => {
      if (geofencingRef.current) {
        geofencingRef.current();
        geofencingRef.current = null;
      }
    };
  }, [tasks]);
  
  // Periodically check for nearby tasks
  useEffect(() => {
    const checkNearbyTasks = async () => {
      try {
        const userLocation = await getUserLocation();
        const nearby = findNearbyTasks(
          tasks.filter(t => !t.completed), 
          userLocation
        );
        setNearbyTasks(nearby);
      } catch (error) {
        console.error('Error finding nearby tasks:', error);
      }
    };
    
    // Check on initial load
    checkNearbyTasks();
    
    // Check every 2 minutes
    const intervalId = setInterval(checkNearbyTasks, 2 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [tasks]);

  // Check for recurring tasks that need new instances generated every time tasks are loaded or changed
  useEffect(() => {
    checkAndGenerateRecurringTasks();
  }, [tasks]);

  // Check and generate recurring task instances for tasks that are completed
  const checkAndGenerateRecurringTasks = () => {
    const today = startOfDay(new Date());
    const recurringTasksToGenerate: string[] = [];
    
    tasks.forEach(task => {
      if (task.recurrence && task.recurrence.type !== 'none' && task.completed) {
        // If the task is completed and has recurrence pattern, check if we need to create next instance
        if (!tasks.some(t => 
          t.parentTaskId === task.id && 
          !t.completed && 
          t.dueDate && 
          isAfter(t.dueDate, today))) {
          // No future instances exist, create one
          recurringTasksToGenerate.push(task.id);
        }
      }
    });
    
    // Generate all needed tasks (outside the previous loop to avoid modifying while iterating)
    recurringTasksToGenerate.forEach(taskId => {
      generateNextRecurringTask(taskId);
    });
  };

  // Calculate the next occurrence date based on recurrence pattern
  const calculateNextOccurrence = (task: Task): Date | undefined => {
    if (!task.dueDate || !task.recurrence || task.recurrence.type === 'none') return undefined;
    
    const dueDate = new Date(task.dueDate);
    
    switch (task.recurrence.type) {
      case 'daily':
        return addDays(dueDate, task.recurrence.interval);
      
      case 'weekly':
        return addWeeks(dueDate, task.recurrence.interval);
      
      case 'monthly':
        return addMonths(dueDate, task.recurrence.interval);
      
      case 'yearly':
        return addYears(dueDate, task.recurrence.interval);
      
      default:
        return undefined;
    }
  };

  // Generate the next instance of a recurring task
  const generateNextRecurringTask = (taskId: string) => {
    const parentTask = tasks.find(t => t.id === taskId);
    if (!parentTask || !parentTask.recurrence || parentTask.recurrence.type === 'none') return;
    
    const nextDueDate = calculateNextOccurrence(parentTask);
    if (!nextDueDate) return;
    
    // Handle rotation if enabled
    let assignedMembers = [...parentTask.assignedTo];
    let rotation = parentTask.rotation;
    
    if (rotation && rotation.enabled && rotation.memberIds.length > 1) {
      // Calculate next index in rotation
      const nextIndex = (rotation.currentIndex + 1) % rotation.memberIds.length;
      
      // Find the team member for this rotation
      const nextMemberId = rotation.memberIds[nextIndex];
      const nextMember = team.find(m => m.id === nextMemberId);
      
      // Update assigned members for this new task instance
      if (nextMember) {
        assignedMembers = [nextMember];
      }
      
      // Update rotation for the new task
      rotation = {
        ...rotation,
        currentIndex: nextIndex
      };
    }
    
    const newTask: Task = {
      ...parentTask,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date(),
      dueDate: nextDueDate,
      parentTaskId: parentTask.id,
      assignedTo: assignedMembers,
      rotation
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    // Notify about the next occurrence and who's responsible
    if (rotation && rotation.enabled) {
      const assignee = assignedMembers[0]?.name || "Someone";
      toast.success(
        <div>
          <p>Recurring task created!</p>
          <p className="text-sm font-medium mt-1">{assignee} is responsible for the next occurrence.</p>
          <p className="text-xs text-muted-foreground">Due on {format(nextDueDate, 'PP')}</p>
        </div>,
        { duration: 5000 }
      );
    } else {
      console.log(`Generated next instance of recurring task: ${parentTask.title} due on ${format(nextDueDate, 'PP')}`);
    }
  };

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Save teams to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

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

  // Update the addTask function to associate tasks with the current team
  const addTask = (taskData: Omit<Task, 'id'>) => {
    if (!hasPermission('add')) {
      toast.error('You do not have permission to add tasks');
      return;
    }
    
    if (!currentTeam) {
      toast.error('No team selected');
      return;
    }
    
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      teamId: currentTeam.id, // Associate task with current team
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
    
    // After marking as completed, check if it's a recurring task
    const completedTask = tasks.find(t => t.id === taskId);
    if (completedTask?.recurrence && completedTask.recurrence.type !== 'none') {
      toast.success('Recurring task completed! Next instance will be created.');
    } else {
      toast.success('Task completed!');
    }
  };

  // New function to toggle task completion (can complete or uncomplete)
  const toggleTaskCompletion = (taskId: string) => {
    if (!hasPermission('complete')) {
      toast.error('You do not have permission to modify tasks');
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
    
    if (task.completed) {
      toast.info('Task marked as incomplete');
    } else {
      // Check if it's a recurring task
      if (task.recurrence && task.recurrence.type !== 'none') {
        toast.success('Recurring task completed! Next instance will be created.');
      } else {
        toast.success('Task completed!');
      }
    }
  };

  const deleteTask = (taskId: string) => {
    if (!hasPermission('delete')) {
      toast.error('You do not have permission to delete tasks');
      return;
    }
    
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    // If this is a recurring parent task, ask if they want to delete all instances
    const hasChildTasks = tasks.some(t => t.parentTaskId === taskId);
    
    if (hasChildTasks) {
      // In a real app, we would show a confirmation dialog here
      // For now, just delete all related tasks
      setTasks(tasks.filter((task) => task.id !== taskId && task.parentTaskId !== taskId));
      toast.success('Recurring task and all its instances deleted');
    } else {
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success('Task deleted');
    }
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    if (!hasPermission('update')) {
      toast.error('You do not have permission to update tasks');
      return;
    }
    
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, ...task } : t
      )
    );
    toast.success('Task updated');
  };

  // Filter tasks to show only those belonging to the current team
  const getTeamTasks = useCallback(() => {
    if (!currentTeam) return [];
    return tasks.filter(task => task.teamId === currentTeam.id);
  }, [tasks, currentTeam]);

  // Get nearby tasks for the current team
  const getNearbyTasks = async (currentLocation: Location): Promise<Task[]> => {
    // If location has coordinates, use real distance calculation
    if (currentLocation.coordinates) {
      try {
        const userLocation = await getUserLocation();
        return findNearbyTasks(tasks.filter(t => !t.completed), userLocation);
      } catch (error) {
        console.error('Error finding nearby tasks:', error);
        return [];
      }
    }
    
    // Fallback to mock behavior if no coordinates
    return tasks.filter((task) => !task.completed);
  };
  
  // Handle team switching
  const handleSetCurrentTeam = (team: Team) => {
    setCurrentTeam(team);
    // Update the current team members
    if (team.members && team.members.length > 0) {
      setTeam(team.members);
    } else {
      // If team has no members yet, add the current user
      const updatedTeam = {
        ...team,
        members: currentUser ? [currentUser] : []
      };
      updateTeamInList(updatedTeam);
    }
    toast.success(`Switched to ${team.name}`);
  };

  // Add a new team
  const addTeam = (teamData: Omit<Team, 'id'>) => {
    if (!hasPermission('add')) {
      toast.error('You do not have permission to create teams');
      return;
    }
    
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
    };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    setCurrentTeam(newTeam);
    toast.success(`Team "${newTeam.name}" created`);
  };

  // Update a team in the teams list
  const updateTeamInList = (updatedTeam: Team) => {
    const teamIndex = teams.findIndex(t => t.id === updatedTeam.id);
    if (teamIndex !== -1) {
      const newTeams = [...teams];
      newTeams[teamIndex] = updatedTeam;
      setTeams(newTeams);
      
      // If this is the current team, update it
      if (currentTeam && currentTeam.id === updatedTeam.id) {
        setCurrentTeam(updatedTeam);
        setTeam(updatedTeam.members || []);
      }
    }
  };

  // Function to add team member to the current team
  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    if (currentUser?.role !== 'admin') {
      toast.error('Only admins can add team members');
      return;
    }
    
    if (!currentTeam) {
      toast.error('No team selected');
      return;
    }
    
    const newMember = {
      ...member,
      id: uuidv4()
    };
    
    // Add to current team members
    const updatedMembers = [...team, newMember];
    setTeam(updatedMembers);
    
    // Also update the current team in the teams list
    if (currentTeam) {
      const updatedTeam = {
        ...currentTeam,
        members: updatedMembers
      };
      updateTeamInList(updatedTeam);
    }
    
    toast.success(`Added ${newMember.name} to the team`);
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
    
    const updatedMembers = team.filter(m => m.id !== memberId);
    setTeam(updatedMembers);
    
    // Also update the current team in the teams list
    if (currentTeam) {
      const updatedTeam = {
        ...currentTeam,
        members: updatedMembers
      };
      updateTeamInList(updatedTeam);
    }
    
    toast.success('Team member removed');
  };

  const updateTeam = useCallback((updatedMembers: TeamMember[]) => {
    if (currentUser?.role !== 'admin') {
      toast.error('Only admins can update the team');
      return;
    }
    
    setTeam(updatedMembers);
    localStorage.setItem('team', JSON.stringify(updatedMembers));
    
    // Also update the current team in the teams list
    if (currentTeam) {
      const updatedTeam = {
        ...currentTeam,
        members: updatedMembers
      };
      updateTeamInList(updatedTeam);
    }
    
    toast.success('Team updated');
  }, [currentUser, currentTeam]);

  return (
    <TaskContext.Provider
      value={{
        tasks: getTeamTasks(), // Only return tasks for current team
        team,
        teams,
        currentUser,
        currentTeam,
        nearbyTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addTeamMember,
        removeTeamMember,
        updateTeam,
        setCurrentTeam: handleSetCurrentTeam,
        addTeam,
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
