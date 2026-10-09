// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { DashboardCanvasOverlayZIndex } from "./DashboardCanvasOverlayZIndex.js";
import { type IDashboardLayoutProps } from "./types.js";

/**
 * @internal
 */
export function DashboardLayout(props: IDashboardLayoutProps): ReactElement {
    const { LayoutComponent } = useDashboardComponentsContext();

    return (
        <DashboardCanvasOverlayZIndex>
            <LayoutComponent {...props} />
        </DashboardCanvasOverlayZIndex>
    );
}
