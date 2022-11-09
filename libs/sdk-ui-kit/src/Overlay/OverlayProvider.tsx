// (C) 2022 GoodData Corporation
import React, { useEffect, useState } from "react";
import { OverlayController } from "./OverlayController";
import { OverlayControllerProvider } from "./OverlayContext";
import { v4 as uuid } from "uuid";
import throttle from "lodash/throttle";
import CustomEventPolyfill from "custom-event"; // TODO: FET-772 Remove IE-specific polyfills, upgrade blocked dependencies

const fireGoodstrapScrollEvent = (
    node: HTMLElement,
    windowInstance = { dispatchEvent: (_event: Event) => true },
) => {
    windowInstance.dispatchEvent(
        new CustomEventPolyfill("goodstrap.scrolled", {
            // this will close dropdowns with closeOnParentScroll=true
            bubbles: true,
            detail: {
                node,
            },
        }),
    );
};

/**
 * This is custom dom goodstrap event, it is used by Overlay to handle CloseOnParentScroll
 * This event is throttled by default
 * @internal
 */
export const handleOnScrollEvent = throttle(
    (node: HTMLElement) => fireGoodstrapScrollEvent(node, window),
    500,
);

/**
 * Props of OverlayProvider
 * @internal
 */
export interface IOverlayProviderProps {
    /**
     * if True than component listen on window scroll and fire event to close all overlays
     */
    fireGlobalScrollEvent?: boolean;
}

/**
 * This is Overlay wrapper it render dom structure for rendering portals and overlays.
 * It also renders OverlayControllerProvider to handle z-indexes and define elements where portals should be rendered.
 *
 * @internal
 */
export const OverlayProvider: React.FC<IOverlayProviderProps> = (props) => {
    const { children, fireGlobalScrollEvent = true } = props;
    const [elementRef, setElementRef] = useState<HTMLDivElement>(null);
    // we need unique id for each component
    const [generatedId] = useState(uuid());

    useEffect(() => {
        if (fireGlobalScrollEvent && elementRef) {
            const handler = () => handleOnScrollEvent(elementRef);
            window.addEventListener("scroll", handler);

            return () => {
                window.removeEventListener("scroll", handler);
            };
        }
    }, [fireGlobalScrollEvent, elementRef]);

    const overlaysRootId = `overlays-root-${generatedId}`;
    const portalsRootId = `portals-root-${generatedId}`;

    return (
        <OverlayControllerProvider
            overlayController={OverlayController.getInstance()}
            overlaysRootId={overlaysRootId}
            portalsRootId={portalsRootId}
        >
            {/* 
                This element represents the first element with relative position and is part of the scroll area. 
                Position relative is essential for portals because portal position (absolute) is calculated from this element. 
                Result of this that overlays are moving as scroll content.   
            */}
            <div id={overlaysRootId} style={{ position: "relative" }} ref={setElementRef}>
                {children}
                {/* This element is wrapper for all portals rendered by overlays. */}
                <div id={portalsRootId} />
            </div>
        </OverlayControllerProvider>
    );
};
