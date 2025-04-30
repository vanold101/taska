export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  createdBy: string;
  assignedTo: TeamMember[];
  dueDate?: Date;
  location: Location;
  parentTaskId?: string;
  recurrence?: RecurrencePattern;
  rotation?: RotationPattern;
  teamId: string; // Add this to associate tasks with teams
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'member';
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Location {
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // For weekly recurrence, e.g., [1, 3, 5] for Mon, Wed, Fri
  dayOfMonth?: number; // For monthly recurrence
  month?: number; // For yearly recurrence
  day?: number; // For yearly recurrence
}

export interface RotationPattern {
  enabled: boolean;
  memberIds: string[];
  currentIndex: number;
}
