
import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const [mapLoaded, setMapLoaded] = React.useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Normally we would use an environment variable for the token
    // For demo purposes, using a temporary public token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsczRtbnptazBnb3gyanA2ajM1cXYwdWsifQ.a9QFV0UvdplfDOJgaRF8-Q';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: COLUMBUS_CENTER,
      zoom: 11,
    });

    map.current.on('load', () => {
      if (!map.current) return;
      setMapLoaded(true);

      // Add store markers
      STORE_LOCATIONS.forEach(store => {
        const el = document.createElement('div');
        el.className = 'store-marker';
        el.innerHTML = `
          <div class="marker-pin">
            <div class="marker-content">
              <span class="marker-count">${store.tasks}</span>
            </div>
          </div>
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>${store.name}</strong><br>${store.tasks} task(s)`);
        
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
        .addTo(map.current as mapboxgl.Map);
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, []);

  if (!mapLoaded) {
    return (
      <div className="relative w-full h-64 bg-accent/5 rounded-lg border border-accent/20 flex items-center justify-center mb-6 overflow-hidden animate-pulse">
        <div className="text-center animate-pulse">
          <div className="animate-spin mb-3">
            <Navigation className="h-8 w-8 text-accent mx-auto" />
          </div>
          <p className="text-muted-foreground font-medium">Fetching nearby tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg mb-6 bg-accent/5 border border-accent/20">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 shadow-sm">
        Columbus, Ohio
      </div>
    </div>
  );
};

export default TaskMap;
