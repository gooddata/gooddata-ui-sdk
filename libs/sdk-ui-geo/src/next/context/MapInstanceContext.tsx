// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useState } from "react";

import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Context for sharing map instance across components
 *
 * @internal
 */
const MapInstanceContext = createContext<
    | {
          map: MapLibreMap | null;
          setMap: (map: MapLibreMap | null) => void;
      }
    | undefined
>(undefined);

/**
 * Provider for map instance context
 *
 * @remarks
 * This context provides access to the MapLibre map instance across
 * the component tree. It's used by hooks and components that need
 * to interact with the map.
 *
 * @internal
 */
export function MapInstanceProvider({ children }: { children: ReactNode }) {
    const [map, setMap] = useState<MapLibreMap | null>(null);

    return <MapInstanceContext.Provider value={{ map, setMap }}>{children}</MapInstanceContext.Provider>;
}

/**
 * Hook to access map instance from context
 *
 * @remarks
 * Returns the current MapLibre map instance, or null if not yet initialized.
 * Components using this hook will re-render when the map instance changes.
 *
 * @returns Current map instance or null
 * @throws Error if used outside MapInstanceProvider
 *
 * @internal
 */
export function useMapInstance(): MapLibreMap | null {
    const context = useContext(MapInstanceContext);

    if (context === undefined) {
        throw new Error("useMapInstance must be used within MapInstanceProvider");
    }

    return context.map;
}

/**
 * Hook to set map instance in context
 *
 * @remarks
 * Returns a function to update the map instance in context.
 * Typically called once during map initialization.
 *
 * @returns Function to set map instance
 * @throws Error if used outside MapInstanceProvider
 *
 * @internal
 */
export function useSetMapInstance(): (map: MapLibreMap | null) => void {
    const context = useContext(MapInstanceContext);

    if (context === undefined) {
        throw new Error("useSetMapInstance must be used within MapInstanceProvider");
    }

    return context.setMap;
}
