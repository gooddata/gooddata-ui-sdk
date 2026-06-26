// (C) 2025-2026 GoodData Corporation

import { type IDrillEventContext, createFocusHighchartsDatapointEvent } from "@gooddata/sdk-ui";

type IKdaReturnFocusInfo =
    | { type: "chart"; chartId: string; seriesIndex: number; pointIndex: number }
    | { type: "table"; element: HTMLElement | null };

let pendingReturnFocus: IKdaReturnFocusInfo | null = null;

export function storeKdaReturnFocusFromDrillContext(drillContext: IDrillEventContext): void {
    if (drillContext.type === "table") {
        pendingReturnFocus = { type: "table", element: document.activeElement as HTMLElement };
        return;
    }

    const { chartId, seriesIndex, pointIndex } = drillContext;

    if (chartId === undefined || seriesIndex === undefined || pointIndex === undefined) {
        return;
    }

    pendingReturnFocus = { type: "chart", chartId, seriesIndex, pointIndex };
}

export function storeKdaReturnFocusFromActiveElement(): void {
    pendingReturnFocus = { type: "table", element: document.activeElement as HTMLElement };
}

export function returnFocusToKdaTrigger(): void {
    if (!pendingReturnFocus) {
        return;
    }

    const isNavigatingByKeyboard = document.querySelector(":focus-visible") !== null;
    const info = pendingReturnFocus;
    pendingReturnFocus = null;

    if (!isNavigatingByKeyboard) {
        return;
    }

    if (info.type === "chart") {
        window.dispatchEvent(createFocusHighchartsDatapointEvent(info));
    }
    if (info.type === "table") {
        info.element?.focus();
    }
}
