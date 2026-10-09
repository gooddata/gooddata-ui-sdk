// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { OverlayZIndexContext, useContainingOverlayZIndex } from "@gooddata/sdk-ui-kit";

import { DASHBOARD_OVERLAYS_FILTER_Z_INDEX } from "../../constants/zIndex.js";

export function DashboardCanvasOverlayZIndex({ children }: { children: ReactNode }) {
    const containingOverlayZIndex = useContainingOverlayZIndex();
    if (containingOverlayZIndex !== undefined) {
        return children;
    }
    return (
        <OverlayZIndexContext.Provider value={DASHBOARD_OVERLAYS_FILTER_Z_INDEX}>
            {children}
        </OverlayZIndexContext.Provider>
    );
}
