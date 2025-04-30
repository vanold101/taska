
import { Task, Team } from '@/types';

export const mockTeam: Team = {
  id: 'team-1',
  name: 'Product Team',
  members: [
    {
      id: 'user-1',
      name: 'Admin User',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Admin',
      role: 'admin',
      email: 'admin@company.com',
      contact: { type: 'email', value: 'admin@company.com' }
    }
  ]
};

// Columbus, OH coordinates: 39.9612° N, 82.9988° W
const columbusCoords = {
  latitude: 39.9612,
  longitude: -82.9988
};

// Mock locations with coordinates around Columbus
const locations = {
  'Kroger - Dublin': {
    name: 'Kroger - Dublin',
    coordinates: { latitude: 40.0992, longitude: -83.1141 },
    radius: 300
  },
  'Target - Easton': {
    name: 'Target - Easton',
    coordinates: { latitude: 40.0503, longitude: -82.9151 },
    radius: 300
  },
  'Whole Foods - Upper Arlington': {
    name: 'Whole Foods - Upper Arlington',
    coordinates: { latitude: 40.0359, longitude: -83.0621 },
    radius: 300
  },
  "Office - Downtown": {
    name: "Office - Downtown",
    coordinates: { latitude: 39.9615, longitude: -82.9990 },  // Very close to mock user position
    radius: 300
  }
};

// Mock tasks data
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Buy groceries for the week',
    description: 'Get fruits, vegetables, milk, and bread',
    location: locations['Kroger - Dublin'],
    completed: false,
    createdAt: new Date('2025-04-20T10:00:00'),
    assignedTo: [mockTeam.members[0]],
    createdBy: mockTeam.members[0].id,
    teamId: mockTeam.id, // Add team ID
    recurrence: { type: 'weekly', interval: 1, daysOfWeek: [1] } // Repeats every Monday
  },
  {
    id: 'task-2',
    title: 'Pick up new office supplies',
    description: 'Notebooks, pens, and printer paper',
    location: locations['Target - Easton'],
    completed: true,
    createdAt: new Date('2025-04-21T14:30:00'),
    assignedTo: [mockTeam.members[0]],
    createdBy: mockTeam.members[0].id,
    teamId: mockTeam.id // Add team ID
  },
  {
    id: 'task-3',
    title: 'Get organic coffee beans',
    description: 'For the office coffee machine',
    location: locations['Whole Foods - Upper Arlington'],
    completed: false,
    createdAt: new Date('2025-04-22T09:15:00'),
    assignedTo: [mockTeam.members[0]],
    createdBy: mockTeam.members[0].id,
    teamId: mockTeam.id, // Add team ID
    recurrence: { type: 'monthly', interval: 1, dayOfMonth: 15 } // Repeats on the 15th of each month
  }
];
