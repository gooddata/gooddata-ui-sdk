// (C) 2022-2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useLayoutEffect, useState } from "react";

import { v4 as uuid } from "uuid";

import { type OverlayController } from "./OverlayController.js";

/**
 * @internal
 */
export const OverlayContext = createContext<OverlayController | undefined>(undefined);
OverlayContext.displayName = "OverlayContext";

/**
 * Properties for {@link OverlayControllerProvider} component.
 *
 * @internal
 */
export interface IOverlayControllerProviderProps {
    /**
     * Overlay controller singleton class for z-index handling.
     */
    overlayController: OverlayController;

    /**
     * React children
     */
    children?: ReactNode;
}

/**
 * Component for injecting {@link OverlayController} into all components in the application.
 *
 * @internal
 */
export function OverlayControllerProvider({ children, overlayController }: IOverlayControllerProviderProps) {
    return <OverlayContext.Provider value={overlayController}>{children}</OverlayContext.Provider>;
}

/**
 * Hook to get current instance of the {@link OverlayController}
 *
 * @returns an instance of the {@link OverlayController}
 *
 * @internal
 */
export const useOverlayController = (): OverlayController | undefined => {
    return useContext(OverlayContext);
};

const FALLBACK_OVERLAY_Z_INDEX = 5001; // Same as in OverlayController

/**
 * Hook to get the css `z-index` property for given overlay.
 *
 * @param uuid - uuid of the overlay.
 *
 * @returns - `z-index` for given overlay.
 *
 * @internal
 */
export const useOverlayZIndex = (uuid: string): number | undefined => {
    const overlayController = useContext(OverlayContext);
    return overlayController?.getZIndex(uuid) ?? FALLBACK_OVERLAY_Z_INDEX;
};

/**
 * Registers a new overlay and returns its z-index
 *
 * @returns the overlay's z-index
 *
 * @internal
 */
export function useOverlayZIndexWithRegister() {
    const [overlayId] = useState(uuid());
    const overlayController = useOverlayController();
    // Register on commit (before paint), then update local state so the
    // overlay re-renders with its registered z-index. Without this second
    // render, an overlay opened above an already-mounted one would render
    // with the controller's fallback z-index on first paint and slip below
    // the lower overlay (the controller does not trigger re-renders by
    // itself).
    const [zIndex, setZIndex] = useState<number | undefined>(undefined);
    useLayoutEffect(() => {
        if (!overlayController) {
            setZIndex(FALLBACK_OVERLAY_Z_INDEX);
            return undefined;
        }
        overlayController.addOverlay(overlayId);
        setZIndex(overlayController.getZIndex(overlayId));
        return () => overlayController.removeOverlay(overlayId);
    }, [overlayController, overlayId]);
    return zIndex ?? FALLBACK_OVERLAY_Z_INDEX;
}
