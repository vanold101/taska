import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTaskContext } from '@/context/TaskContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Columbus, Ohio coordinates as [number, number] tuple for TypeScript
const COLUMBUS_CENTER: [number, number] = [-82.9988, 39.9612];

// Sample store locations around Columbus with proper typing
const STORE_LOCATIONS: Array<{
  name: string;
  coordinates: [number, number];
  tasks: number;
}> = [
  { name: "Kroger - Dublin", coordinates: [-83.1140, 40.0992], tasks: 3 },
  { name: "Target - Easton", coordinates: [-82.9179, 40.0515], tasks: 2 },
  { name: "Whole Foods - Upper Arlington", coordinates: [-83.0620, 40.0266], tasks: 1 },
  { name: "Walmart Supercenter", coordinates: [-82.9625, 39.9420], tasks: 4 },
  { name: "Trader Joe's", coordinates: [-83.0204, 40.0559], tasks: 2 }
];

// Temporary user location with proper typing
const USER_LOCATION: [number, number] = [-83.0007, 39.9614];

const TaskMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [closestLocation, setClosestLocation] = useState<string | null>(null);

  // Get tasks from context
  const { tasks } = useTaskContext();
  const activeTasks = tasks.filter(task => !task.completed);

  useEffect(() => {
    // Simulate loading for a more polished UX
    const loadingTimer = setTimeout(() => {
      // Calculate closest location to user before initializing map
      const closest = findClosestLocation();
      setClosestLocation(closest);
      setIsLoadingMap(false);
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (isLoadingMap || !mapContainer.current) return;

    // Normally we would use an environment variable for the token
    // For demo purposes, using a temporary public token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsczRtbnptazBnb3gyanA2ajM1cXYwdWsifQ.a9QFV0UvdplfDOJgaRF8-Q';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: COLUMBUS_CENTER,
      zoom: 11,
      pitch: 45,
    });

    map.current.on('load', () => {
      if (!map.current) return;
      setMapLoaded(true);

      // Add store markers with updated styling
      STORE_LOCATIONS.forEach(store => {
        const el = document.createElement('div');
        const isClosest = store.name === closestLocation;
        
        el.className = `store-marker ${isClosest ? 'closest-marker' : ''}`;
        el.innerHTML = `
          <div class="marker-pin ${isClosest ? 'closest' : ''}" style="background: ${isClosest ? '#EF4444' : '#3B82F6'}">
            <div class="marker-content">
              <span class="marker-count" style="color: ${isClosest ? '#EF4444' : '#3B82F6'}">${store.tasks}</span>
            </div>
          </div>
        `;
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong style="color: #111827">${store.name}</strong>
              <br>
              <span style="color: #6B7280">${store.tasks} task${store.tasks !== 1 ? 's' : ''}</span>
              ${isClosest ? '<div class="closest-tag" style="color: #EF4444; margin-top: 4px;">Closest to you!</div>' : ''}
            </div>
          `);
        
        new mapboxgl.Marker(el)
          .setLngLat(store.coordinates)
          .setPopup(popup)
          .addTo(map.current);
      });

      // Add user location marker
      const userEl = document.createElement('div');
      userEl.className = 'user-marker';
      userEl.style.background = '#EF4444';
      userEl.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.3)';
      
      new mapboxgl.Marker(userEl)
        .setLngLat(USER_LOCATION)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          '<strong style="color: #111827">You are here</strong>'
        ))
        .addTo(map.current);
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, [isLoadingMap, closestLocation]);

  // Function to find the closest location to the user
  const findClosestLocation = (): string => {
    let closestDist = Infinity;
    let closestName = "";
    
    // Calculate distance to each location
    STORE_LOCATIONS.forEach(store => {
      const dist = calculateDistance(
        USER_LOCATION[1], 
        USER_LOCATION[0], 
        store.coordinates[1], 
        store.coordinates[0]
      );
      
      if (dist < closestDist) {
        closestDist = dist;
        closestName = store.name;
      }
    });
    
    return closestName;
  };
  
  // Haversine formula to calculate distance between two coordinates (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  if (isLoadingMap) {
    return (
      <div className="relative w-full h-64 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="mb-3">
            <MapPin className="h-8 w-8 text-[#3B82F6] mx-auto" />
          </div>
          <div className="space-y-3">
            <p className="text-[#111827] font-medium">Loading map...</p>
            <div className="flex justify-center gap-1.5">
              <Skeleton className="h-2 w-16 rounded-full bg-[#E5E7EB]" />
              <Skeleton className="h-2 w-10 rounded-full bg-[#E5E7EB]" />
              <Skeleton className="h-2 w-12 rounded-full bg-[#E5E7EB]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg mb-2 bg-[#F9FAFB] border border-[#E5E7EB]">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {closestLocation && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-[#E5E7EB] shadow-sm flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#3B82F6]" />
            <span className="text-[#111827]">Closest: {closestLocation}</span>
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-[#E5E7EB] shadow-sm">
          Columbus, Ohio
        </div>
      </div>
      
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-gray-600">
          {STORE_LOCATIONS.reduce((acc, loc) => acc + loc.tasks, 0)} tasks across {STORE_LOCATIONS.length} locations
        </span>
        
        {closestLocation && (
          <Badge variant="outline" className="bg-[#F9FAFB] text-xs border-[#E5E7EB] flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#3B82F6]" />
            <span className="text-[#111827]">Closest: {closestLocation}</span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TaskMap;
