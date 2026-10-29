'use client';

import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import io, { Socket } from 'socket.io-client';

export default function AdminDashboard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});
  
  const [buses, setBuses] = useState<{ [id: string]: { lat: number; lng: number, speed: number } }>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [88.3433, 22.5645], // Kolkata
      zoom: 13
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
  }, []);

  useEffect(() => {
    // Connect to NestJS API
    const socket: Socket = io('http://localhost:3000');
    
    socket.on('connect', () => {
      console.log('Connected to fleet tracking service');
      setIsConnected(true);
      socket.emit('room.join', { room: 'admin:fleet' });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('bus.location.updated', (data) => {
      setBuses((prev) => ({
        ...prev,
        [data.busId]: { lat: data.latitude, lng: data.longitude, speed: data.speed }
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync buses state with map markers
  useEffect(() => {
    if (!map.current) return;

    Object.entries(buses).forEach(([id, data]) => {
      // If marker doesn't exist, create it
      if (!markersRef.current[id]) {
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.innerHTML = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; background-color: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); z-index: 10;"></div>
            <div style="position: absolute; top: -24px; background-color: #27272a; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); white-space: nowrap;">
              ${id}
            </div>
          </div>
        `;
        
        // Tailwind animation ping equivalent
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `;
        document.head.appendChild(style);

        markersRef.current[id] = new mapboxgl.Marker(el)
          .setLngLat([data.lng, data.lat])
          .addTo(map.current!);
      } else {
        // Update existing marker position
        markersRef.current[id].setLngLat([data.lng, data.lat]);
      }
    });
  }, [buses]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-zinc-950">
      {/* Mapbox Map Container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Glassmorphism Sidebar */}
      <div className="absolute top-0 left-0 h-full w-80 p-6 pointer-events-none z-10">
        <div className="h-full w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 pointer-events-auto flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">BUSLY <span className="font-light text-zinc-400">Fleet</span></h1>
            <div className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          <h2 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold mb-4">Active Fleet</h2>
          
          <div className="flex-1 overflow-y-auto space-y-3">
            {Object.keys(buses).length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-10">No active buses detected.</div>
            ) : (
              Object.entries(buses).map(([id, data]) => (
                <div key={id} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer" onClick={() => map.current?.flyTo({ center: [data.lng, data.lat], zoom: 15 })}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-zinc-100">{id}</span>
                    <span className="text-xs font-mono text-zinc-400">{data.speed?.toFixed(0)} km/h</span>
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
