import React, { useEffect } from 'react';
import { MapPin, Navigation, BellRing } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { Location, Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationBanner.module.css';

// Fix for leaflet marker icons
const userIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `<div class="h-4 w-4 bg-primary rounded-full shadow-md border-2 border-white"></div>
         <div class="absolute h-10 w-10 bg-primary/20 rounded-full -top-3 -left-3 animate-ping"></div>`,
  iconSize: L.point(10, 10),
  iconAnchor: L.point(5, 5)
});

const createLocationIcon = (isNearby: boolean, isActive: boolean) => {
  const markerColor = isNearby ? 'text-accent' : (isActive ? 'text-primary' : 'text-muted');
  const animationClass = isNearby ? 'animate-bounce' : '';
  
  return new L.DivIcon({
    className: `location-marker ${animationClass}`,
    html: `<div class="${markerColor}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>`,
    iconSize: L.point(24, 24),
    iconAnchor: L.point(12, 24),
    popupAnchor: L.point(0, -24)
  });
};

// Custom component to set the map view to user's location
const MapCenterAdjuster = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);
  
  return null;
};

const LocationBanner = () => {
  const { tasks = [], nearbyTasks = [] } = useTaskContext();
  
  // Filter active tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // Extract unique locations from tasks with valid coordinates
  const taskLocations = tasks
    .filter(task => task.location && task.location.coordinates)
    .reduce((locations, task) => {
      const locationName = task.location.name;
      
      if (!locations[locationName]) {
        locations[locationName] = {
          ...task.location,
          tasks: [],
          hasActive: false,
          hasCompleted: false,
          activeCount: 0,
          completedCount: 0,
          isNearby: false
        };
      }
      
      locations[locationName].tasks.push(task);
      
      if (!task.completed) {
        locations[locationName].hasActive = true;
        locations[locationName].activeCount += 1;
      } else {
        locations[locationName].hasCompleted = true;
        locations[locationName].completedCount += 1;
      }
      
      // Check if this location has any nearby tasks
      if (nearbyTasks?.some(nearbyTask => nearbyTask.location.name === locationName)) {
        locations[locationName].isNearby = true;
      }
      
      return locations;
    }, {} as Record<string, any>);
  
  // Convert to array
  const locationArray = Object.values(taskLocations);
  
  // Columbus, OH coordinates (default center)
  const defaultCenter: [number, number] = [39.9612, -82.9988];
  
  // For demo purposes, simulate user location as the default center
  const userLocation = defaultCenter;
  
  // Find the closest location for demonstration
  const closestLocation = locationArray.find(loc => loc.isNearby) || 
                          locationArray.find(loc => loc.hasActive) || 
                          locationArray[0];
  
  if (locationArray.length === 0) {
    return (
      <div className="relative h-72 mb-8 rounded-xl overflow-hidden flex items-center justify-center bg-muted/30">
        <p>No locations with coordinates found.</p>
      </div>
    );
  }

  return (
    <div className="relative h-72 mb-8 rounded-xl overflow-hidden premium-card">
      {/* Leaflet Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          className={styles.mapContainer}
          // @ts-ignore - Props issue with react-leaflet types
          center={defaultCenter}
          zoom={12}
        >
          <TileLayer
            // @ts-ignore - Props issue with react-leaflet types
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Adjust center based on user location */}
          <MapCenterAdjuster center={userLocation} zoom={12} />
          
          {/* User location marker */}
          <Marker 
            position={userLocation}
            // @ts-ignore - Props issue with react-leaflet types
            icon={userIcon}
          >
            <Popup>Your current location</Popup>
          </Marker>
          
          {/* Task location markers */}
          {locationArray.map((location, index) => {
            // Skip locations without coordinates
            if (!location.coordinates || !location.coordinates.latitude || !location.coordinates.longitude) {
              return null;
            }
            
            const position: [number, number] = [location.coordinates.latitude, location.coordinates.longitude];
            const locationIcon = createLocationIcon(location.isNearby, location.hasActive);
            
            return (
              <React.Fragment key={`loc-${index}`}>
                {/* Location marker */}
                <Marker 
                  position={position}
                  // @ts-ignore - Props issue with react-leaflet types
                  icon={locationIcon}
                >
                  <Popup>
                    <div className="font-medium mb-1">{location.name}</div>
                    {location.activeCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>{location.activeCount} active task{location.activeCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {location.completedCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <div className="w-1.5 h-1.5 bg-success rounded-full" />
                        <span>{location.completedCount} completed</span>
                      </div>
                    )}
                  </Popup>
                </Marker>
                
                {/* Geofence circle around locations */}
                {location.radius && (
                  <Circle 
                    center={position} 
                    pathOptions={{ 
                      fillColor: location.isNearby ? '#7c3aed' : '#3b82f6', 
                      fillOpacity: 0.1, 
                      color: location.isNearby ? '#7c3aed' : '#3b82f6',
                      opacity: 0.5,
                      weight: 1
                    }}
                    // @ts-ignore - radius prop issue with types
                    radius={location.radius}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
      
      {/* Map title overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white/90 via-white/70 to-transparent p-4 backdrop-blur-sm z-40">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <Navigation className="h-4 w-4 text-primary mr-1.5" />
              <h3 className="text-sm font-medium text-primary">Taska Locations</h3>
            </div>
            <p className="text-xs text-muted-foreground ml-5.5">
              {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''} in Columbus, Ohio
            </p>
          </div>
          
          {nearbyTasks && nearbyTasks.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1.5">
                    <BellRing className="h-3 w-3" />
                    {nearbyTasks.length} nearby
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">You have {nearbyTasks.length} tasks nearby!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Map controls overlay */}
      <div className="absolute bottom-3 right-3 z-40">
        <div className="bg-white rounded-md shadow-md p-1 flex flex-col gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open('https://www.openstreetmap.org', '_blank')}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationBanner;
