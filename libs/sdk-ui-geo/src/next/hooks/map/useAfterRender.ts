// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Check if map is fully idle (loaded and tiles ready)
 *
 * @remarks
 * Pure function that checks if the map is in an idle state, meaning both
 * the style and tiles are loaded and ready for rendering.
 *
 * @param map - MapLibre map instance
 * @returns true if map is idle, false otherwise
 *
 * @internal
 */
function isMapFullyIdle(map: MapLibreMap): boolean {
    // Check if tiles are loaded (if method exists)
    const tilesLoaded =
        typeof (map as unknown as { areTilesLoaded?: () => boolean }).areTilesLoaded === "function"
            ? (map as unknown as { areTilesLoaded: () => boolean }).areTilesLoaded()
            : true;

    return map.loaded() && tilesLoaded;
}

/**
 * Schedule callback to run asynchronously
 *
 * @remarks
 * Pure function that schedules a callback to run on the next frame or tick.
 * Prefers requestAnimationFrame for smoother rendering, falls back to setTimeout.
 *
 * @param callback - Function to schedule
 *
 * @internal
 */
function scheduleAsync(callback: () => void): void {
    if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(callback);
    } else {
        setTimeout(callback, 0);
    }
}

/**
 * Calls afterRender callback when map finishes rendering
 *
 * @remarks
 * This hook listens to the map's "idle" event and calls the afterRender
 * callback once. This is used by the Analytical Designer to know when
 * the chart has finished rendering and can remove the loading spinner.
 *
 * The callback is only called once per resetSignal change to avoid repeated calls.
 *
 * @param map - MapLibre map instance
 * @param afterRender - Callback to call when rendering is complete
 * @param resetSignal - Value that indicates the map should re-signal completion (e.g., execution object)
 *
 * @internal
 */
export function useAfterRender(
    map: MapLibreMap | null,
    afterRender?: () => void,
    resetSignal?: unknown,
): void {
    const hasCalledRef = useRef(false);
    const lastResetSignalRef = useRef(resetSignal);

    // Reset the "called" flag when resetSignal changes
    useEffect(() => {
        if (resetSignal !== lastResetSignalRef.current) {
            hasCalledRef.current = false;
            lastResetSignalRef.current = resetSignal;
        }
    }, [resetSignal]);

    // Set up idle listener and invoke callbacks
    useEffect(() => {
        // Guard: skip if no map, already called, or no callbacks
        if (!map || hasCalledRef.current || !afterRender) {
            return;
        }

        const invokeCallbacks = () => {
            // Double-check we haven't called yet (race condition guard)
            if (hasCalledRef.current) {
                return;
            }

            hasCalledRef.current = true;

            // Invoke callbacks
            if (afterRender) {
                afterRender();
            }
        };

        const handleIdle = () => {
            map.off("idle", handleIdle);
            invokeCallbacks();
        };

        // Register idle listener
        map.on("idle", handleIdle);

        // If already idle, trigger immediately (async to avoid sync effects)
        if (isMapFullyIdle(map)) {
            scheduleAsync(handleIdle);
        }

        return () => {
            map.off("idle", handleIdle);
        };
    }, [map, afterRender, resetSignal]);
}
