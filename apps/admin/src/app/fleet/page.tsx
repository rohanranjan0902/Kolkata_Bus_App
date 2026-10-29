'use client';

import React, { useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiYnVzbHkiLCJhIjoiY2x4eXh5eHl6MHl4eHl4eHl4eHl4eHl4eSJ9.dummy'; // Placeholder

export default function LiveFleet() {
  const [viewState, setViewState] = useState({
    longitude: 85.8245,
    latitude: 20.2961,
    zoom: 11
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg z-10 p-4">
        <h2 className="text-xl font-bold mb-4">BUSLY ADMIN</h2>
        <ul className="space-y-2">
          <li className="font-semibold text-blue-600">Live Fleet</li>
          <li>Buses</li>
          <li>Drivers</li>
          <li>Routes</li>
        </ul>
      </div>
      <div className="flex-1 relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <Marker longitude={85.8245} latitude={20.2961} color="blue" />
        </Map>
      </div>
    </div>
  );
}
