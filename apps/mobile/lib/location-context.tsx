import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

export type LocationSource = "home" | "current" | "selected";

export type LocationState = {
  source: LocationSource;
  lat: number | null;
  lng: number | null;
  name: string;
  radiusMiles: number;
};

type LocationContextValue = {
  location: LocationState;
  setSource: (source: LocationSource) => void;
  setSelected: (name: string, lat: number, lng: number) => void;
  setRadius: (miles: number) => void;
  requestCurrentLocation: () => void;
  locationLoading: boolean;
};

const STORAGE_KEY = "hey-location";
const DEFAULT_RADIUS = 25;

const defaultLocation: LocationState = {
  source: "home",
  lat: null,
  lng: null,
  name: "",
  radiusMiles: DEFAULT_RADIUS,
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}

async function loadFromStorage(): Promise<Partial<LocationState> | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveToStorage(state: LocationState) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const profile = useQuery(api.profiles.get);
  const [location, setLocation] = useState<LocationState>(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    async function init() {
      const stored = await loadFromStorage();
      if (stored?.lat != null && stored?.lng != null && stored?.source) {
        setLocation({
          source: stored.source as LocationSource,
          lat: stored.lat,
          lng: stored.lng,
          name: stored.name ?? "",
          radiusMiles: stored.radiusMiles ?? DEFAULT_RADIUS,
        });
        setInitialized(true);
        return;
      }

      // Wait for profile to load
      if (profile === undefined) return;

      if (profile?.homeLat != null && profile?.homeLng != null) {
        const state: LocationState = {
          source: "home",
          lat: profile.homeLat,
          lng: profile.homeLng,
          name: profile.homeLocationName ?? "Home",
          radiusMiles: DEFAULT_RADIUS,
        };
        setLocation(state);
        saveToStorage(state);
      }
      setInitialized(true);
    }

    init();
  }, [profile, initialized]);

  const updateLocation = useCallback((partial: Partial<LocationState>) => {
    setLocation((prev) => {
      const next = { ...prev, ...partial };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setSource = useCallback((source: LocationSource) => {
    if (source === "home") {
      if (profile?.homeLat != null && profile?.homeLng != null) {
        updateLocation({
          source: "home",
          lat: profile.homeLat,
          lng: profile.homeLng,
          name: profile.homeLocationName ?? "Home",
        });
      }
    } else if (source === "current") {
      requestCurrentLocation();
    }
  }, [profile, updateLocation]);

  const setSelected = useCallback((name: string, lat: number, lng: number) => {
    updateLocation({ source: "selected", lat, lng, name });
  }, [updateLocation]);

  const setRadius = useCallback((miles: number) => {
    updateLocation({ radiusMiles: miles });
  }, [updateLocation]);

  const requestCurrentLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      updateLocation({
        source: "current",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        name: "Current Location",
      });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [updateLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setSource,
        setSelected,
        setRadius,
        requestCurrentLocation,
        locationLoading: loading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
