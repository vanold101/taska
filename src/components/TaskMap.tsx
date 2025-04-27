import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTaskContext } from '@/context/TaskContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Columbus, Ohio coordinates as [longitude, latitude] tuple
const COLUMBUS_CENTER: [number, number] = [-82.9988, 39.9612];

// Sample store locations around Columbus
const STORE_LOCATIONS = [
  { name: "Kroger - Dublin", coordinates: [-83.1140, 40.0992] as [number, number], tasks: 3 },
  { name: "Target - Easton", coordinates: [-82.9179, 40.0515] as [number, number], tasks: 2 },
  { name: "Whole Foods - Upper Arlington", coordinates: [-83.0620, 40.0266] as [number, number], tasks: 1 },
  { name: "Walmart Supercenter", coordinates: [-82.9625, 39.9420] as [number, number], tasks: 4 },
  { name: "Trader Joe's", coordinates: [-83.0204, 40.0559] as [number, number], tasks: 2 }
];

// Temporary user location (can be anywhere)
const USER_LOCATION: [number, number] = [-83.0007, 39.9614]; // Downtown Columbus

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
    if (!mapContainer.current) return;

    // Calculate closest location to user before initializing map
    const closest = findClosestLocation();
    setClosestLocation(closest);

    // Normally we would use an environment variable for the token
    // For demo purposes, using a temporary public token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsczRtbnptazBnb3gyanA2ajM1cXYwdWsifQ.a9QFV0UvdplfDOJgaRF8-Q';
    
    setIsLoadingMap(true);
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: COLUMBUS_CENTER,
      zoom: 11,
    });

    map.current.on('load', () => {
      if (!map.current) return;
      setMapLoaded(true);
      setIsLoadingMap(false);

      // Add store markers
      STORE_LOCATIONS.forEach(store => {
        const el = document.createElement('div');
        
        // Highlight the closest location
        if (store.name === closestLocation) {
          el.className = 'store-marker closest-marker';
        } else {
          el.className = 'store-marker';
        }
        
        el.innerHTML = `
          <div class="marker-pin ${store.name === closestLocation ? 'closest' : ''}">
            <div class="marker-content">
              <span class="marker-count">${store.tasks}</span>
            </div>
          </div>
        `;
        
        // Create popup with more details
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <strong>${store.name}</strong>
            <br>${store.tasks} task${store.tasks !== 1 ? 's' : ''}
            ${store.name === closestLocation ? '<div class="closest-tag">Closest to you!</div>' : ''}
          `);
        
        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(store.coordinates)
          .setPopup(popup)
          .addTo(map.current as mapboxgl.Map);
      });

      // Add user location marker
      const userEl = document.createElement('div');
      userEl.className = 'user-marker';
      
      new mapboxgl.Marker(userEl)
        .setLngLat(USER_LOCATION)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<strong>You are here</strong>'))
        .addTo(map.current as mapboxgl.Map);
      
      // Add a pulsing dot animation to user location
      const size = 100;
      const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),
        onAdd: function() {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
        },
        render: function() {
          const duration = 1000;
          const t = (performance.now() % duration) / duration;
          const radius = (size / 2) * 0.3;
          const outerRadius = (size / 2) * 0.7 * t + radius;
          const context = this.context;

          // Draw the outer circle
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          context.fillStyle = `rgba(239, 68, 68, ${1 - t})`;
          context.fill();

          // Update this image's data with data from the canvas
          this.data = context.getImageData(0, 0, this.width, this.height).data;

          // Keep the map repainting
          map.current?.triggerRepaint();

          // Return `true` to let the map know that the image was updated
          return true;
        }
      };
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, [closestLocation]);

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
      <div className="relative w-full h-64 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-center mb-6 overflow-hidden">
        <div className="text-center">
          <div className="animate-spin mb-3">
            <Navigation className="h-8 w-8 text-primary mx-auto" />
          </div>
          <div className="space-y-3">
            <p className="text-muted-foreground font-medium">Fetching nearby tasks...</p>
            <div className="flex justify-center gap-1.5">
              <Skeleton className="h-2 w-16 rounded-full bg-primary/20" />
              <Skeleton className="h-2 w-10 rounded-full bg-primary/15" />
              <Skeleton className="h-2 w-12 rounded-full bg-primary/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg mb-2 bg-primary/5 border border-primary/20">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {closestLocation && (
          <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 shadow-sm flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">Closest: {closestLocation}</span>
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 shadow-sm">
          Columbus, Ohio
        </div>
      </div>
      
      {/* Task count badge */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-muted-foreground">
          {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''} across {STORE_LOCATIONS.length} locations
        </span>
        
        {closestLocation && (
          <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            <span>Closest: {closestLocation}</span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TaskMap;
