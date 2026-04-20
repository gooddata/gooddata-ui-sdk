// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { ZoomProvider } from "../ZoomContext/ZoomContext.js";
import { Overlay } from "./Overlay.js";
import { type IOverlayProps } from "./typings.js";

/**
 * @internal
 * ZoomAwareOverlay wraps the standard Overlay component with a ZoomProvider
 * to ensure all children components have access to zoom information and can
 * adjust their rendering accordingly.
 */
export function ZoomAwareOverlay<T extends HTMLElement = HTMLElement>(props: IOverlayProps<T>): ReactElement {
    return (
        <ZoomProvider>
            <Overlay<T> {...props} />
        </ZoomProvider>
    );
}
