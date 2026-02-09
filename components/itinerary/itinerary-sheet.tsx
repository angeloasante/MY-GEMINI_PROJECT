"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  InfoWindow,
  Libraries,
} from "@react-google-maps/api";

const GOOGLE_MAPS_LIBRARIES: Libraries = ["places"];

interface Activity {
  time?: string;
  title: string;
  type: "flight" | "hotel" | "restaurant" | "attraction" | "transport" | "other";
  location?: string;
  description?: string;
  duration?: string;
  price?: string;
  tips?: string[];
  // Support both formats: coordinates tuple or separate lat/lng
  coordinates?: [number, number];
  latitude?: number;
  longitude?: number;
  image?: string;
  photos?: string[];
  rating?: number;
  phone?: string;
  phoneNumber?: string;
  website?: string;
  googleMapsUrl?: string;
  openNow?: boolean;
  openingHours?: string[];
  editorialSummary?: string;
}

interface Day {
  day_number: number;
  title: string;
  date: string;
  activities: Activity[];
}

interface Itinerary {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travel_style?: string;
  budget_level?: string;
  days: Day[];
}

interface ItinerarySheetProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary;
}

// Dark mode map styles
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8c8c8c" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];

function getTypeIcon(type: Activity["type"]) {
  switch (type) {
    case "flight": return "✈️";
    case "hotel": return "🏨";
    case "restaurant": return "🍽️";
    case "attraction": return "🏛️";
    case "transport": return "🚕";
    default: return "📍";
  }
}

function getTypeColor(type: Activity["type"]) {
  switch (type) {
    case "flight": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "hotel": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "restaurant": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "attraction": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "transport": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

export function ItinerarySheet({ isOpen, onClose, itinerary }: ItinerarySheetProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [infoWindowActivity, setInfoWindowActivity] = useState<Activity | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Current day's activities
  const currentDay = useMemo(() => {
    return itinerary.days.find(d => d.day_number === selectedDay) || itinerary.days[0];
  }, [itinerary.days, selectedDay]);

  const currentActivities = useMemo(() => {
    return currentDay?.activities || [];
  }, [currentDay]);

  // Helper to get coordinates from activity (supports both formats)
  const getCoords = useCallback((a: Activity): { lat: number; lng: number } | null => {
    // Check for separate lat/lng first (enriched format)
    if (a.latitude !== undefined && a.longitude !== undefined && a.latitude !== 0 && a.longitude !== 0) {
      return { lat: a.latitude, lng: a.longitude };
    }
    // Fall back to coordinates tuple
    if (a.coordinates && a.coordinates[0] !== 0 && a.coordinates[1] !== 0) {
      return { lat: a.coordinates[0], lng: a.coordinates[1] };
    }
    return null;
  }, []);

  // Get activities with valid coordinates
  const activitiesWithCoords = useMemo(() => {
    return currentActivities.filter(a => getCoords(a) !== null);
  }, [currentActivities, getCoords]);

  // Calculate map center
  const center = useMemo(() => {
    if (activitiesWithCoords.length === 0) {
      return { lat: 41.9028, lng: 12.4964 }; // Default to Rome
    }
    const avgLat = activitiesWithCoords.reduce((sum, a) => {
      const coords = getCoords(a);
      return sum + (coords?.lat || 0);
    }, 0) / activitiesWithCoords.length;
    const avgLng = activitiesWithCoords.reduce((sum, a) => {
      const coords = getCoords(a);
      return sum + (coords?.lng || 0);
    }, 0) / activitiesWithCoords.length;
    return { lat: avgLat, lng: avgLng };
  }, [activitiesWithCoords, getCoords]);

  // Store map reference
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Fit bounds when activities change
  useEffect(() => {
    if (mapRef.current && activitiesWithCoords.length > 0 && isLoaded) {
      const bounds = new google.maps.LatLngBounds();
      activitiesWithCoords.forEach(a => {
        const coords = getCoords(a);
        if (coords) {
          bounds.extend(coords);
        }
      });
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [activitiesWithCoords, isLoaded, getCoords]);

  // Fetch directions for route
  useEffect(() => {
    if (!isLoaded || activitiesWithCoords.length < 2) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    // Build waypoints using getCoords
    const waypoints = activitiesWithCoords.slice(1, -1).map(a => {
      const coords = getCoords(a);
      return {
        location: coords!,
        stopover: true,
      };
    });

    const originCoords = getCoords(activitiesWithCoords[0]);
    const destCoords = getCoords(activitiesWithCoords[activitiesWithCoords.length - 1]);
    
    if (!originCoords || !destCoords) return;

    directionsService.route(
      {
        origin: originCoords,
        destination: destCoords,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, activitiesWithCoords]);

  // Get marker icon
  const getMarkerIcon = (type: Activity["type"], isActive: boolean) => {
    const colors: Record<string, { bg: string; border: string }> = {
      flight: { bg: "#3b82f6", border: "#60a5fa" },
      hotel: { bg: "#8b5cf6", border: "#a78bfa" },
      restaurant: { bg: "#f59e0b", border: "#fbbf24" },
      attraction: { bg: "#10b981", border: "#34d399" },
      transport: { bg: "#6366f1", border: "#818cf8" },
    };
    const color = colors[type] || colors.attraction;

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isActive ? color.border : color.bg,
      fillOpacity: 1,
      strokeColor: isActive ? "#fff" : color.border,
      strokeWeight: isActive ? 3 : 2,
      scale: isActive ? 14 : 10,
    };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-zinc-900 rounded-t-3xl shadow-2xl"
            style={{ height: "90vh", maxHeight: "90vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{itinerary.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {itinerary.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {itinerary.days.length} days
                    </span>
                    {itinerary.budget_level && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        {itinerary.budget_level}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Day Tabs */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {itinerary.days.map(day => (
                  <button
                    key={day.day_number}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day.day_number);
                      setSelectedActivity(null);
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedDay === day.day_number
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    Day {day.day_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row h-[calc(100%-140px)] overflow-hidden">
              {/* Activities List */}
              <div className="w-full md:w-96 md:border-r border-b md:border-b-0 border-zinc-800 overflow-y-auto flex-shrink-0 max-h-[50%] md:max-h-full">
                {currentDay && (
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{currentDay.title}</h3>
                    <p className="text-sm text-zinc-500 mb-4">{formatDate(currentDay.date)}</p>

                    <div className="space-y-3">
                      {currentActivities.map((activity, index) => (
                        <motion.div
                          key={`${activity.title}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                            selectedActivity === activity
                              ? "bg-zinc-700 ring-2 ring-blue-500"
                              : "bg-zinc-800/50 hover:bg-zinc-800"
                          }`}
                          onClick={() => {
                            setSelectedActivity(activity);
                            if (activity.coordinates && mapRef.current) {
                              mapRef.current.panTo({ lat: activity.coordinates[0], lng: activity.coordinates[1] });
                              mapRef.current.setZoom(16);
                            }
                          }}
                        >
                          {/* Timeline connector */}
                          {index < currentActivities.length - 1 && (
                            <div className="absolute left-6 top-full w-0.5 h-3 bg-zinc-700" />
                          )}

                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs border ${getTypeColor(activity.type)}`}>
                                  {getTypeIcon(activity.type)} {activity.type}
                                </span>
                                <span className="text-xs text-zinc-500">{activity.time}</span>
                              </div>
                              <h4 className="text-sm font-semibold text-white truncate">{activity.title}</h4>
                              <p className="text-xs text-zinc-400 truncate">{activity.location}</p>
                              {activity.price && (
                                <p className="text-xs text-blue-400 mt-1">{activity.price}</p>
                              )}
                            </div>
                          </div>

                          {/* Expanded details */}
                          {selectedActivity === activity && activity.description && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-3 pt-3 border-t border-zinc-700"
                            >
                              <p className="text-sm text-zinc-300">{activity.description}</p>
                              {activity.duration && (
                                <p className="text-xs text-zinc-500 mt-2">Duration: {activity.duration}</p>
                              )}
                              {activity.tips && activity.tips.length > 0 && (
                                <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                  <p className="text-xs text-amber-400 font-medium mb-1">💡 Tips</p>
                                  <ul className="text-xs text-zinc-400 space-y-0.5">
                                    {activity.tips.map((tip, i) => (
                                      <li key={i}>• {tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="flex-1 relative min-h-[250px] md:min-h-0">
                {loadError ? (
                  <div className="flex items-center justify-center h-full text-red-400">
                    Failed to load map
                  </div>
                ) : !isLoaded ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-zinc-400">Loading map...</span>
                    </div>
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={center}
                    zoom={13}
                    onLoad={onMapLoad}
                    options={{
                      styles: darkMapStyles,
                      disableDefaultUI: true,
                      zoomControl: true,
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {/* Directions route */}
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          suppressMarkers: true,
                          polylineOptions: {
                            strokeColor: "#3b82f6",
                            strokeWeight: 4,
                            strokeOpacity: 0.8,
                          },
                        }}
                      />
                    )}

                    {/* Activity markers */}
                    {activitiesWithCoords.map((activity, index) => {
                      const coords = getCoords(activity);
                      if (!coords) return null;
                      return (
                        <Marker
                          key={`${activity.title}-${index}`}
                          position={coords}
                          onClick={() => setInfoWindowActivity(activity)}
                          icon={getMarkerIcon(activity.type, selectedActivity === activity)}
                          label={{
                            text: String(currentActivities.indexOf(activity) + 1),
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}
                        />
                      );
                    })}

                    {/* Info Window */}
                    {infoWindowActivity && getCoords(infoWindowActivity) && (
                      <InfoWindow
                        position={getCoords(infoWindowActivity)!}
                        onCloseClick={() => setInfoWindowActivity(null)}
                        options={{ maxWidth: 280 }}
                      >
                        <div style={{ fontFamily: "system-ui, sans-serif" }}>
                          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", color: "#1a1a1a" }}>
                            {infoWindowActivity.title}
                          </h3>
                          <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                            {infoWindowActivity.location}
                          </p>
                          {(infoWindowActivity.description || infoWindowActivity.editorialSummary) && (
                            <p style={{ fontSize: "12px", color: "#444", marginBottom: "8px" }}>
                              {infoWindowActivity.editorialSummary || infoWindowActivity.description}
                            </p>
                          )}
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {infoWindowActivity.duration && (
                              <span style={{ fontSize: "11px", color: "#888" }}>⏱️ {infoWindowActivity.duration}</span>
                            )}
                            {infoWindowActivity.price && (
                              <span style={{ fontSize: "11px", color: "#3b82f6" }}>💰 {infoWindowActivity.price}</span>
                            )}
                            {infoWindowActivity.rating && (
                              <span style={{ fontSize: "11px", color: "#f59e0b" }}>⭐ {infoWindowActivity.rating}</span>
                            )}
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                )}

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (mapRef.current && activitiesWithCoords.length > 0) {
                        const bounds = new google.maps.LatLngBounds();
                        activitiesWithCoords.forEach(a => {
                          const coords = getCoords(a);
                          if (coords) {
                            bounds.extend(coords);
                          }
                        });
                        mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    title="Fit all markers"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>

                {/* No coordinates message */}
                {activitiesWithCoords.length === 0 && isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <p className="text-zinc-400 text-sm">Location data is being processed</p>
                      <p className="text-zinc-600 text-xs mt-1">Activities will appear on the map shortly</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}