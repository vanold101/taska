import { Task, Location } from '@/types';

// Calculate distance between two sets of coordinates in meters using the Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Check if a location is within a specified radius of another location
export const isWithinRadius = (
  userLocation: { latitude: number; longitude: number },
  targetLocation: { latitude: number; longitude: number },
  radiusInMeters: number
): boolean => {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude
  );
  
  return distance <= radiusInMeters;
};

// Find tasks near the user's current location
export const findNearbyTasks = (
  tasks: Task[],
  userLocation: { latitude: number; longitude: number },
  radiusInMeters: number = 1000 // Default 1km radius
): Task[] => {
  // Filter for active tasks that have coordinates
  return tasks.filter(task => {
    if (task.completed || !task.location.coordinates) return false;
    
    return isWithinRadius(
      userLocation,
      task.location.coordinates,
      task.location.radius || radiusInMeters
    );
  });
};

// Mock user location for demo purposes (Columbus, OH coordinates)
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  // In a real app, we would use the browser's geolocation API
  // navigator.geolocation.getCurrentPosition()
  
  // For demo purposes, return a mock position in Columbus, OH
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        coords: {
          latitude: 39.9612,
          longitude: -82.9988,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      } as GeolocationPosition);
    }, 500);
  });
};

// Set up geofencing for task locations
export const setupGeofencing = (
  tasks: Task[],
  onEnter: (task: Task) => void
): (() => void) => {
  // In a real implementation, we would use the Geolocation API's watchPosition
  // to continuously monitor the user's location
  
  let watching = true;
  const watchId = setInterval(async () => {
    if (!watching) return;
    
    try {
      const position = await getCurrentPosition();
      const userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // Check each task with coordinates
      tasks.forEach(task => {
        if (task.completed || !task.location.coordinates) return;
        
        const isNearby = isWithinRadius(
          userLocation,
          task.location.coordinates,
          task.location.radius || 300 // Default 300m radius
        );
        
        if (isNearby) {
          onEnter(task);
        }
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, 30000); // Check every 30 seconds
  
  // Return a cleanup function
  return () => {
    watching = false;
    clearInterval(watchId);
  };
};

// Store user's last known location
let lastKnownLocation: { latitude: number; longitude: number } | null = null;

// Get user's last known location or fetch current position
export const getUserLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  if (lastKnownLocation) {
    return lastKnownLocation;
  }
  
  try {
    const position = await getCurrentPosition();
    lastKnownLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    return lastKnownLocation;
  } catch (error) {
    console.error('Error getting user location:', error);
    // Default to Columbus, OH
    return { latitude: 39.9612, longitude: -82.9988 };
  }
};

// Update location coordinates for a task (would normally be from a map picker)
export const setTaskCoordinates = (
  location: Location,
  coordinates: { latitude: number; longitude: number },
  radius: number = 300
): Location => {
  return {
    ...location,
    coordinates,
    radius
  };
}; 