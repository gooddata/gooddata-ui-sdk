// (C) 2025 GoodData Corporation
import React, { type ReactNode } from "react";

import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

// Error message in AD is 3100 and loader is 3200. We need to be above both
// The chart tooltip is overriden to be 3305, otherwise it's not visible

const overlayController = OverlayController.getInstance(3300);

export function OverlayProvider({ children }: { children: ReactNode }) {
    return (
        <OverlayControllerProvider overlayController={overlayController}>
            {children}
        </OverlayControllerProvider>
    );
}
