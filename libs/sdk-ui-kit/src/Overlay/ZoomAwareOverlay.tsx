// (C) 2025 GoodData Corporation
import React, { ReactElement } from "react";
import { Overlay } from "./Overlay.js";
import { ZoomProvider } from "../ZoomContext/ZoomContext.js";
import { IOverlayProps } from "./typings.js";

/**
 * @internal
 * ZoomAwareOverlay wraps the standard Overlay component with a ZoomProvider
 * to ensure all children components have access to zoom information and can
 * adjust their rendering accordingly.
 */
export const ZoomAwareOverlay = <T extends HTMLElement = HTMLElement>(
    props: IOverlayProps<T>,
): ReactElement => {
    return (
        <ZoomProvider>
            <Overlay<T> {...props} />
        </ZoomProvider>
    );
};
