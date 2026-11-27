// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { resolveTooltipZIndex } from "@gooddata/sdk-ui-charts";
import { Overlay, OverlayZIndexContext, useContainingOverlayZIndex } from "@gooddata/sdk-ui-kit";

import { DashboardLayout } from "./DashboardLayout.js";

function TooltipZIndexProbe({ testId }: { testId: string }) {
    const zIndex = resolveTooltipZIndex({ containingOverlayZIndex: useContainingOverlayZIndex() });
    return <span data-testid={testId}>{zIndex}</span>;
}

function LayoutWithChartAndOverlay() {
    return (
        <>
            <TooltipZIndexProbe testId="canvas" />
            <Overlay zIndex={9000}>
                <TooltipZIndexProbe testId="overlay" />
            </Overlay>
        </>
    );
}

vi.mock("../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({ LayoutComponent: LayoutWithChartAndOverlay }),
}));

describe("DashboardLayout", () => {
    it("should place chart tooltips on the canvas above the sticky filter bar", () => {
        render(<DashboardLayout />);

        expect(screen.getByTestId("canvas")).toHaveTextContent("6001");
    });

    it("should keep chart tooltips above an overlay opened from the canvas", () => {
        render(<DashboardLayout />);

        expect(screen.getByTestId("overlay")).toHaveTextContent("9001");
    });

    it("should keep chart tooltips above the overlay that contains the dashboard", () => {
        render(
            <OverlayZIndexContext.Provider value={7000}>
                <DashboardLayout />
            </OverlayZIndexContext.Provider>,
        );

        expect(screen.getByTestId("canvas")).toHaveTextContent("7001");
    });
});
