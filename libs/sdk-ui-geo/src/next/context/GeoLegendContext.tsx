// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useState } from "react";

/**
 * Per-layer enabled items state.
 *
 * @remarks
 * Each layer has its own enabled items state:
 * - `null` means all items are enabled (initial state for that layer)
 * - Empty array means all items are disabled
 * - Array with URIs means only those items are enabled
 *
 * @alpha
 */
export type EnabledItemsByLayer = Map<string, string[] | null>;

/**
 * Context for managing legend item and layer visibility state.
 *
 * @remarks
 * This context manages which legend items and layers are enabled/visible for filtering.
 * Legend items are now tracked per-layer to allow independent filtering when multiple
 * layers share the same segment-by attribute.
 *
 * @alpha
 */
interface IGeoLegendContext {
    /**
     * Per-layer enabled legend items.
     *
     * @remarks
     * Map from layerId to enabled items for that layer.
     * If a layer is not in the map, all its items are enabled (initial state).
     * `null` value for a layer means all items are enabled.
     * Empty array means all items are disabled.
     */
    enabledItemsByLayer: EnabledItemsByLayer;

    /**
     * Updates the enabled legend items for a specific layer.
     *
     * @param layerId - The ID of the layer
     * @param items - The enabled items (null = all enabled)
     */
    setEnabledItemsForLayer: (layerId: string, items: string[] | null) => void;

    /**
     * Toggles a legend item's enabled state for a specific layer.
     *
     * @param layerId - The ID of the layer containing the item
     * @param uri - The URI of the legend item to toggle
     * @param allUrisForLayer - All available legend item URIs for that layer
     */
    toggleLegendItem: (layerId: string, uri: string, allUrisForLayer: string[]) => void;

    /**
     * Set of layer IDs that are currently hidden.
     *
     * @remarks
     * Layers not in this set are visible. Empty set means all layers are visible.
     */
    hiddenLayers: Set<string>;

    /**
     * Toggles a layer's visibility on the map.
     *
     * @param layerId - The ID of the layer to toggle
     */
    toggleLayerVisibility: (layerId: string) => void;
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
 * @param prev - Previous enabled items state for a layer
 * @param uri - URI of the item being toggled
 * @param allUris - All available URIs for that layer
 * @returns New enabled items state for that layer
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
 * Provider for legend item and layer visibility state management.
 *
 * @remarks
 * This provider manages which legend items and layers are visible/enabled for filtering.
 * Legend items are tracked per-layer to allow independent filtering.
 *
 * @alpha
 */
export function GeoLegendProvider({ children }: { children: ReactNode }) {
    const [enabledItemsByLayer, setEnabledItemsByLayer] = useState<EnabledItemsByLayer>(new Map());
    const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());

    const setEnabledItemsForLayer = useCallback((layerId: string, items: string[] | null) => {
        setEnabledItemsByLayer((prev) => {
            const next = new Map(prev);
            if (items === null) {
                // null means all enabled - remove from map to indicate default state
                next.delete(layerId);
            } else {
                next.set(layerId, items);
            }
            return next;
        });
    }, []);

    const toggleLegendItem = useCallback((layerId: string, uri: string, allUrisForLayer: string[]) => {
        setEnabledItemsByLayer((prev) => {
            const next = new Map(prev);
            const currentItems = prev.get(layerId) ?? null;
            const newItems = computeNextEnabledItems(currentItems, uri, allUrisForLayer);
            if (newItems === null) {
                // null means all enabled - remove from map to indicate default state
                next.delete(layerId);
            } else {
                next.set(layerId, newItems);
            }
            return next;
        });
    }, []);

    const toggleLayerVisibility = useCallback((layerId: string) => {
        setHiddenLayers((prev) => {
            const next = new Set(prev);
            if (next.has(layerId)) {
                next.delete(layerId);
            } else {
                next.add(layerId);
            }
            return next;
        });
    }, []);

    return (
        <GeoLegendContext.Provider
            value={{
                enabledItemsByLayer,
                setEnabledItemsForLayer,
                toggleLegendItem,
                hiddenLayers,
                toggleLayerVisibility,
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
