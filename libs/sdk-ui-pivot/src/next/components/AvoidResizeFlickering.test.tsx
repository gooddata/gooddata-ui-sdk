// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    usePivotTableSizingActionsMock,
    usePivotTableSizingMock,
} from "../testing/contextMocks.test.helpers.js";

import { type AvoidResizeFlickering as AvoidResizeFlickeringType } from "./AvoidResizeFlickering.js";

const { useTableReadyMock, useInitialAutoResizeVisibilityMock } = vi.hoisted(() => ({
    useTableReadyMock: vi.fn(),
    useInitialAutoResizeVisibilityMock: vi.fn(),
}));

vi.mock("../context/TableReadyContext.js", () => ({
    useTableReady: useTableReadyMock,
}));

vi.mock("../context/PivotTableSizingContext.js", () => ({
    usePivotTableSizing: usePivotTableSizingMock,
    usePivotTableSizingActions: usePivotTableSizingActionsMock,
}));

vi.mock("../hooks/resizing/useInitialAutoResizeVisibility.js", () => ({
    useInitialAutoResizeVisibility: useInitialAutoResizeVisibilityMock,
}));

vi.mock("./LoadingComponent.js", () => ({
    LoadingComponent: () => <div className="s-loading" />,
}));

let AvoidResizeFlickering: typeof AvoidResizeFlickeringType;

function renderWith(options: {
    containerWidth: number;
    isContainerWidthMeasured?: boolean;
    isReadyAfterInitialSettle: boolean;
}) {
    usePivotTableSizingMock.mockReturnValue({
        containerWidth: options.containerWidth,
        isContainerWidthMeasured: options.isContainerWidthMeasured ?? true,
        resizeOnShowCount: 0,
    });
    useInitialAutoResizeVisibilityMock.mockReturnValue(options.isReadyAfterInitialSettle);
    const children = vi.fn(() => null);

    const { container } = render(<AvoidResizeFlickering>{children}</AvoidResizeFlickering>);

    return { container, children };
}

describe("AvoidResizeFlickering", () => {
    beforeEach(async () => {
        vi.resetModules();
        ({ AvoidResizeFlickering } = await import("./AvoidResizeFlickering.js"));

        useTableReadyMock.mockReturnValue({ onVisibilityReady: vi.fn() });
    });

    it("renders the loading overlay before the container width has been measured", () => {
        const { container, children } = renderWith({
            containerWidth: 0,
            isContainerWidthMeasured: false,
            isReadyAfterInitialSettle: false,
        });

        expect(container.querySelectorAll(".s-loading")).toHaveLength(1);
        expect(children).toHaveBeenLastCalledWith({ isReadyForInitialPaint: false });
    });

    it("renders no loading overlay while the container is measured at zero width", () => {
        const { container, children } = renderWith({ containerWidth: 0, isReadyAfterInitialSettle: false });

        expect(container.querySelectorAll(".s-loading")).toHaveLength(0);
        expect(children).toHaveBeenLastCalledWith({ isReadyForInitialPaint: false });
    });

    it("renders the loading overlay while a visible table is not ready yet", () => {
        const { container, children } = renderWith({ containerWidth: 800, isReadyAfterInitialSettle: false });

        expect(container.querySelectorAll(".s-loading")).toHaveLength(1);
        expect(children).toHaveBeenLastCalledWith({ isReadyForInitialPaint: false });
    });

    it("renders no loading overlay once a visible table is ready", () => {
        const { container, children } = renderWith({ containerWidth: 800, isReadyAfterInitialSettle: true });

        expect(container.querySelectorAll(".s-loading")).toHaveLength(0);
        expect(children).toHaveBeenLastCalledWith({ isReadyForInitialPaint: true });
    });
});
