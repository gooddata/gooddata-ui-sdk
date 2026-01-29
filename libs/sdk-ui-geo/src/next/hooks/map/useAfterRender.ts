// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef } from "react";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

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
function isMapFullyIdle(map: IMapFacade): boolean {
    return map.loaded() && map.areTilesLoaded();
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
 * @param resetSignal - Layer executions that indicate the map should re-signal completion
 *
 * @internal
 */
export function useAfterRender(
    map: IMapFacade | null,
    afterRender?: () => void,
    resetSignal?: ILayerExecutionRecord[],
): void {
    const hasCalledRef = useRef(false);
    const lastResetSignalRef = useRef<ILayerExecutionRecord[] | undefined>(resetSignal);

    useEffect(() => {
        if (resetSignal !== lastResetSignalRef.current) {
            hasCalledRef.current = false;
            lastResetSignalRef.current = resetSignal;
        }
    }, [resetSignal]);

    useEffect(() => {
        if (!map || hasCalledRef.current || !afterRender) {
            return;
        }

        const invokeCallbacks = () => {
            if (hasCalledRef.current) {
                return;
            }
            hasCalledRef.current = true;
            afterRender?.();
        };

        const handleIdle = () => {
            map.off("idle", handleIdle);
            invokeCallbacks();
        };

        map.on("idle", handleIdle);
        if (isMapFullyIdle(map)) {
            scheduleAsync(handleIdle);
        }

        return () => {
            map.off("idle", handleIdle);
        };
    }, [map, afterRender, resetSignal]);
}
