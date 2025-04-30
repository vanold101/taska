export interface Location {
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  radius?: number; // in meters
}

export type RecurrencePattern = 
  | { type: 'none' }
  | { type: 'daily'; interval: number }
  | { type: 'weekly'; interval: number; daysOfWeek: number[] }
  | { type: 'monthly'; interval: number; dayOfMonth: number }
  | { type: 'yearly'; interval: number; month: number; day: number };

export interface RotationPattern {
  enabled: boolean;
  memberIds: string[];  // IDs of team members in rotation order
  currentIndex: number; // Current position in the rotation
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  location: Location;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  assignedTo: TeamMember[];
  createdBy: string; // TeamMember id
  recurrence?: RecurrencePattern;
  parentTaskId?: string; // For recurring task instances
  rotation?: RotationPattern; // For tasks that rotate between team members
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
  email?: string;
  contact: {
    type: 'email' | 'phone';
    value: string;
  };
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}
