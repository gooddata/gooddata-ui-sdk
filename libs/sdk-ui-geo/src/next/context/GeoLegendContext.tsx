// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useState } from "react";

import { PositionType } from "@gooddata/sdk-ui-vis-commons";

/**
 * Context for managing legend state and behavior.
 *
 * @remarks
 * This context manages which legend items are enabled/visible, the legend position,
 * and responsive layout behavior for smaller screens.
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

    /**
     * Position of the legend relative to the chart
     */
    legendPosition: PositionType;

    /**
     * Updates the legend position
     */
    setLegendPosition: (position: PositionType) => void;

    /**
     * Whether the legend is in responsive mode (horizontal layout on small screens)
     */
    isResponsive: boolean;

    /**
     * Updates the responsive state
     */
    setIsResponsive: (responsive: boolean) => void;

    /**
     * Whether the legend should show in a popup on small screens
     */
    showPopup: boolean;

    /**
     * Updates the popup state
     */
    setShowPopup: (show: boolean) => void;
}

const GeoLegendContext = createContext<IGeoLegendContext | undefined>(undefined);

/**
 * Provider for legend state management.
 *
 * @remarks
 * This provider manages the state of the legend including which items are visible,
 * the legend position, and responsive behavior.
 *
 * @alpha
 */
export function GeoLegendProvider({ children }: { children: ReactNode }) {
    const [enabledLegendItems, setEnabledLegendItems] = useState<string[] | null>(null);
    const [legendPosition, setLegendPosition] = useState<PositionType>("top");
    const [isResponsive, setIsResponsive] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const toggleLegendItem = (uri: string, allUris: string[]) => {
        setEnabledLegendItems((prev) => {
            // All items are enabled; disable the clicked one by tracking all others explicitly.
            if (prev === null) {
                return allUris.filter((itemUri) => itemUri !== uri);
            }

            // If the item is enabled, disable it
            if (prev.includes(uri)) {
                const newEnabled = prev.filter((item) => item !== uri);
                return newEnabled.length === 0 ? [] : newEnabled;
            }

            // If the item is disabled, enable it
            const newEnabled = [...prev, uri];
            return newEnabled.length === allUris.length ? null : newEnabled;
        });
    };

    return (
        <GeoLegendContext.Provider
            value={{
                enabledLegendItems,
                setEnabledLegendItems,
                toggleLegendItem,
                legendPosition,
                setLegendPosition,
                isResponsive,
                setIsResponsive,
                showPopup,
                setShowPopup,
            }}
        >
            {children}
        </GeoLegendContext.Provider>
    );
}

/**
 * Hook to access legend state and controls.
 *
 * @remarks
 * Use this hook to manage legend visibility, position, and responsive behavior.
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
