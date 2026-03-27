// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import {
    type BoundsChangedCallback,
    type CenterPositionChangedCallback,
    type ViewportInteractionEndCallback,
    type ZoomChangedCallback,
} from "../../types/common/callbacks.js";

/**
 * Set up map interaction callbacks
 *
 * @remarks
 * This hook sets up event listeners for map interactions like pan and zoom,
 * and calls the provided callbacks when these events occur. It properly
 * cleans up listeners on unmount or when dependencies change.
 *
 * @param map - MapLibre map instance
 * @param callbacks - Callback functions for map events
 *
 * @internal
 */
export function useMapCallbacks(
    map: IMapFacade | null,
    callbacks: {
        onCenterPositionChanged?: CenterPositionChangedCallback;
        onZoomChanged?: ZoomChangedCallback;
        onBoundsChanged?: BoundsChangedCallback;
        onViewportInteractionEnd?: ViewportInteractionEndCallback;
    },
): void {
    const { onCenterPositionChanged, onZoomChanged, onBoundsChanged, onViewportInteractionEnd } = callbacks;

    useEffect(() => {
        if (!map) {
            return;
        }

        const emitViewportSnapshot = () => {
            if (onCenterPositionChanged) {
                const center = map.getCenter();
                onCenterPositionChanged({
                    lat: center.lat,
                    lng: center.lng,
                });
            }

            if (onZoomChanged) {
                onZoomChanged(map.getZoom());
            }

            if (onBoundsChanged) {
                onBoundsChanged(map.getBounds());
            }
        };

        const handleMoveEnd = (event: { originalEvent?: Event }) => {
            emitViewportSnapshot();

            if (event.originalEvent) {
                onViewportInteractionEnd?.();
            }
        };

        emitViewportSnapshot();
        map.on("moveend", handleMoveEnd);

        return () => {
            map.off("moveend", handleMoveEnd);
        };
    }, [map, onCenterPositionChanged, onZoomChanged, onBoundsChanged, onViewportInteractionEnd]);
}
