export interface Location {
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  radius?: number; // in meters
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
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
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
