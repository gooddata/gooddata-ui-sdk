// (C) 2025 GoodData Corporation
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * @internal
 * Interface for zoom context state
 */
export interface IZoomContextState {
    /**
     * Current zoom level, where 1 is normal (100%), 2 is 200% zoom, etc.
     */
    zoomLevel: number;

    /**
     * Width of the visual viewport
     */
    viewportWidth: number;

    /**
     * Height of the visual viewport
     */
    viewportHeight: number;

    /**
     * Flag indicating if visual viewport API is supported
     */
    hasVisualViewport: boolean;
}

// Default context values
const defaultZoomState: IZoomContextState = {
    zoomLevel: 1,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    hasVisualViewport: typeof window !== "undefined" && "visualViewport" in window,
};

/**
 * @internal
 * Context for zoom level and viewport info
 */
export const ZoomContext = createContext<IZoomContextState>(defaultZoomState);

/**
 * @internal
 * Props for the ZoomProvider component
 */
export interface ZoomProviderProps {
    children: ReactNode;
}

/**
 * @internal
 * Provider component that monitors zoom level and viewport dimensions
 */
export const ZoomProvider: React.FC<ZoomProviderProps> = ({ children }) => {
    const [zoomState, setZoomState] = useState<IZoomContextState>(defaultZoomState);

    useEffect(() => {
        // Function to update zoom state
        const updateZoomState = () => {
            // Current zoom level
            const zoomLevel = window.devicePixelRatio || 1;

            // Get viewport dimensions
            let viewportWidth: number;
            let viewportHeight: number;

            if (window.visualViewport) {
                // If visual viewport API is supported, use it (more accurate for zoomed content)
                viewportWidth = window.visualViewport.width;
                viewportHeight = window.visualViewport.height;
            } else {
                // Fallback to standard viewport
                viewportWidth = window.innerWidth;
                viewportHeight = window.innerHeight;
            }

            setZoomState({
                zoomLevel,
                viewportWidth,
                viewportHeight,
                hasVisualViewport: !!window.visualViewport,
            });
        };

        // Initial update
        updateZoomState();

        // Add event listeners
        if (window.visualViewport) {
            // Modern API - more accurate for zoom changes
            window.visualViewport.addEventListener("resize", updateZoomState);
            window.visualViewport.addEventListener("scroll", updateZoomState);
        } else {
            // Fallback
            window.addEventListener("resize", updateZoomState);
        }

        // Cleanup
        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener("resize", updateZoomState);
                window.visualViewport.removeEventListener("scroll", updateZoomState);
            } else {
                window.removeEventListener("resize", updateZoomState);
            }
        };
    }, []);

    return <ZoomContext.Provider value={zoomState}>{children}</ZoomContext.Provider>;
};

/**
 * @internal
 * Hook to access zoom level and viewport info
 */
export const useZoom = (): IZoomContextState => {
    const context = useContext(ZoomContext);

    if (context === undefined) {
        throw new Error("useZoom must be used within a ZoomProvider");
    }

    return context;
};

/**
 * @internal
 * Helper hook info it window is zoomed
 * @param baseZoomLevel - The zoom level the component was designed for (default 1)
 * @returns true if window is zoomed, false otherwise
 */
export const useIsZoomed = (baseZoomLevel = 1): boolean => {
    const { zoomLevel } = useZoom();

    return zoomLevel > baseZoomLevel;
};
