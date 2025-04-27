
import { Task, Team } from '@/types';

export const mockTeam: Team = {
  id: 'team-1',
  name: 'Product Team',
  members: [
    {
      id: 'user-1',
      name: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Alex',
      role: 'admin',
      contact: { type: 'email', value: 'alex@example.com' }
    },
    {
      id: 'user-2',
      name: 'Sam Wilson',
      avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sam',
      role: 'manager',
      contact: { type: 'phone', value: '+1234567890' }
    },
    {
      id: 'user-3',
      name: 'Taylor Lee',
      avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Taylor',
      role: 'member',
      contact: { type: 'email', value: 'taylor@example.com' }
    },
    {
      id: 'user-4',
      name: 'Jordan Smith',
      avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Jordan',
      role: 'member',
      contact: { type: 'email', value: 'jordan@example.com' }
    }
  ]
};

// Mock tasks data
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Buy groceries for the week',
    description: 'Get fruits, vegetables, milk, and bread',
    location: { name: 'Kroger - Dublin' },
    completed: false,
    createdAt: new Date('2025-04-20T10:00:00'),
    assignedTo: [mockTeam.members[0], mockTeam.members[1]],
    createdBy: mockTeam.members[0].id
  },
  {
    id: 'task-2',
    title: 'Pick up new office supplies',
    description: 'Notebooks, pens, and printer paper',
    location: { name: 'Target - Easton' },
    completed: true,
    createdAt: new Date('2025-04-21T14:30:00'),
    assignedTo: [mockTeam.members[1]],
    createdBy: mockTeam.members[0].id
  },
  {
    id: 'task-3',
    title: 'Get organic coffee beans',
    description: 'For the office coffee machine',
    location: { name: 'Whole Foods - Upper Arlington' },
    completed: false,
    createdAt: new Date('2025-04-22T09:15:00'),
    assignedTo: [mockTeam.members[2]],
    createdBy: mockTeam.members[1].id
  },
  {
    id: 'task-4',
    title: 'Pick up quarterly report printouts',
    description: 'From the print shop near the office',
    location: { name: 'Walmart Supercenter' },
    completed: false,
    createdAt: new Date('2025-04-23T16:45:00'),
    dueDate: new Date('2025-04-25T17:00:00'),
    assignedTo: [mockTeam.members[0], mockTeam.members[3]],
    createdBy: mockTeam.members[0].id
  },
  {
    id: 'task-5',
    title: 'Get snacks for team meeting',
    description: 'Chips, cookies, and drinks',
    location: { name: "Trader Joe's" },
    completed: false,
    createdAt: new Date('2025-04-24T11:30:00'),
    dueDate: new Date('2025-04-26T09:00:00'),
    assignedTo: [mockTeam.members[2]],
    createdBy: mockTeam.members[1].id
  }
];
