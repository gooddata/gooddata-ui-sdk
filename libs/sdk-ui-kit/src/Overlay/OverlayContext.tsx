// (C) 2022 GoodData Corporation
import React, { createContext, useContext } from "react";
import { OverlayController } from "./OverlayController";

/**
 * @internal
 */
export const OverlayContext = createContext<IOverlayControllerProviderProps>({
    overlayController: undefined,
    overlaysRootId: undefined,
    portalsRootId: undefined,
});
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
     * Html element id that wraps content where overlays will be rendered
     * This element has to has position defined as relative
     */
    overlaysRootId?: string;

    /**
     * Html element id that is inside of overlaysRootId element and is used to render overlays in it
     */
    portalsRootId?: string;
}

/**
 * Component for injecting {@link OverlayController} into all components in the application.
 *
 * @internal
 */
export const OverlayControllerProvider: React.FC<IOverlayControllerProviderProps> = (props) => {
    const { children, ...resProps } = props;

    return <OverlayContext.Provider value={resProps}>{children}</OverlayContext.Provider>;
};

/**
 * Hook to get current instance of the {@link IOverlayControllerProviderProps}
 *
 * @returns an instance of the {@link IOverlayControllerProviderProps}
 *
 * @internal
 */
export const useOverlayController = (): IOverlayControllerProviderProps => {
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
export const useOverlayZIndex = (uuid: string): number => {
    const { overlayController } = useContext(OverlayContext);
    return overlayController.getZIndex(uuid);
};
