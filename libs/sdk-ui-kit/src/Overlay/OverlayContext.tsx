// (C) 2022-2025 GoodData Corporation
import React, { createContext, useContext, useState } from "react";
import { OverlayController } from "./OverlayController.js";
import { v4 as uuid } from "uuid";

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
    children?: React.ReactNode;
}

/**
 * Component for injecting {@link OverlayController} into all components in the application.
 *
 * @internal
 */
export const OverlayControllerProvider: React.FC<IOverlayControllerProviderProps> = ({
    children,
    overlayController,
}) => {
    return <OverlayContext.Provider value={overlayController}>{children}</OverlayContext.Provider>;
};

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
    return overlayController?.getZIndex(uuid);
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
    const zIndex = useOverlayZIndex(overlayId);

    React.useEffect(() => {
        if (!overlayController) {
            return undefined;
        }

        overlayController.addOverlay(overlayId);
        return () => overlayController.removeOverlay(overlayId);
    }, [overlayController, overlayId]);

    return zIndex;
}
