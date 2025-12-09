// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useCallback, useContext, useState } from "react";

/**
 * Context for managing legend item visibility state.
 *
 * @remarks
 * This context manages which legend items are enabled/visible for filtering.
 *
 * @alpha
 */
interface IGeoLegendContext {
    /**
     * URIs of enabled legend items.
     *
     * @remarks
     * `null` signals that all items are currently enabled. An empty array means the user explicitly
     * disabled every legend item (the map remains unfiltered, but legend items render as disabled).
     */
    enabledLegendItems: string[] | null;

    /**
     * Updates the enabled legend items
     */
    setEnabledLegendItems: (items: string[] | null) => void;

    /**
     * Toggles a legend item's enabled state
     *
     * @param uri - The URI of the legend item to toggle
     * @param allUris - All available legend item URIs (for toggle logic)
     */
    toggleLegendItem: (uri: string, allUris: string[]) => void;
}

const GeoLegendContext = createContext<IGeoLegendContext | undefined>(undefined);

/**
 * Pure function to compute next enabled items state after toggling.
 *
 * @remarks
 * This logic is extracted for testability and clarity:
 * - `null` means all items are enabled (initial state)
 * - Empty array means all items are disabled
 * - Array with URIs means only those items are enabled
 *
 * @param prev - Previous enabled items state
 * @param uri - URI of the item being toggled
 * @param allUris - All available URIs
 * @returns New enabled items state
 *
 * @internal
 */
export function computeNextEnabledItems(
    prev: string[] | null,
    uri: string,
    allUris: string[],
): string[] | null {
    if (prev === null) {
        return allUris.filter((itemUri) => itemUri !== uri);
    }

    if (prev.includes(uri)) {
        return prev.filter((item) => item !== uri);
    }

    const newEnabled = [...prev, uri];
    return newEnabled.length === allUris.length ? null : newEnabled;
}

/**
 * Provider for legend item visibility state management.
 *
 * @remarks
 * This provider manages which legend items are visible/enabled for filtering.
 *
 * @alpha
 */
export function GeoLegendProvider({ children }: { children: ReactNode }) {
    const [enabledLegendItems, setEnabledLegendItems] = useState<string[] | null>(null);

    const toggleLegendItem = useCallback((uri: string, allUris: string[]) => {
        setEnabledLegendItems((prev) => computeNextEnabledItems(prev, uri, allUris));
    }, []);

    return (
        <GeoLegendContext.Provider
            value={{
                enabledLegendItems,
                setEnabledLegendItems,
                toggleLegendItem,
            }}
        >
            {children}
        </GeoLegendContext.Provider>
    );
}

/**
 * Hook to access legend item visibility state and controls.
 *
 * @remarks
 * Use this hook to manage which legend items are visible/enabled for filtering.
 *
 * @returns Legend context
 * @throws Error if used outside of GeoLegendProvider
 *
 * @alpha
 */
export function useGeoLegend(): IGeoLegendContext {
    const context = useContext(GeoLegendContext);

    if (context === undefined) {
        throw new Error("useGeoLegend must be used within a GeoLegendProvider");
    }

    return context;
}
