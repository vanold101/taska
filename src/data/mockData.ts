
import { Task, TeamMember, Team } from '../types';

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'You',
    avatar: 'https://ui-avatars.com/api/?name=You&background=3B82F6&color=fff',
  },
  {
    id: '2',
    name: 'Alex Kim',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Kim&background=10B981&color=fff',
  },
  {
    id: '3',
    name: 'Jamie Smith',
    avatar: 'https://ui-avatars.com/api/?name=Jamie+Smith&background=F59E0B&color=fff',
  },
];

export const mockTeam: Team = {
  id: '1',
  name: 'Household',
  members: mockTeamMembers,
};

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Pick up milk and eggs',
    description: '2% milk and a dozen eggs',
    location: {
      name: 'Kroger',
      coordinates: {
        latitude: 33.7490,
        longitude: -84.3880,
      },
      radius: 100,
    },
    completed: false,
    createdAt: new Date('2025-04-25T10:00:00'),
    assignedTo: [mockTeamMembers[0], mockTeamMembers[1]],
    createdBy: '1',
  },
  {
    id: '2',
    title: 'Return library books',
    location: {
      name: 'Public Library',
      coordinates: {
        latitude: 33.7590,
        longitude: -84.3920,
      },
      radius: 200,
    },
    completed: false,
    createdAt: new Date('2025-04-24T15:30:00'),
    dueDate: new Date('2025-04-30'),
    assignedTo: [mockTeamMembers[0]],
    createdBy: '1',
  },
  {
    id: '3',
    title: 'Pick up dry cleaning',
    location: {
      name: 'Cleaners on Main',
      coordinates: {
        latitude: 33.7520,
        longitude: -84.3850,
      },
      radius: 50,
    },
    completed: true,
    createdAt: new Date('2025-04-23T09:15:00'),
    assignedTo: [mockTeamMembers[2]],
    createdBy: '3',
  },
  {
    id: '4',
    title: 'Buy dog food',
    description: 'Premium kibble, large bag',
    location: {
      name: 'Pet Supplies Plus',
      coordinates: {
        latitude: 33.7530,
        longitude: -84.3890,
      },
      radius: 100,
    },
    completed: false,
    createdAt: new Date('2025-04-25T11:45:00'),
    assignedTo: [mockTeamMembers[0], mockTeamMembers[2]],
    createdBy: '1',
  },
];
