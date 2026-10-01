// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    usePivotTablePropsMock,
    usePivotTableSizingActionsMock,
    usePivotTableSizingMock,
} from "../../testing/contextMocks.test.helpers.js";
import { type AgGridApi } from "../../types/agGrid.js";
import { type IGridSizingState } from "../../types/internal.js";

import { type useColumnSizingForFullHorizontalSpace as useColumnSizingForFullHorizontalSpaceType } from "./useColumnSizingForFullHorizontalSpace.js";
import { type useColumnSizingForFullHorizontalSpaceAndAutoResize as useColumnSizingForFullHorizontalSpaceAndAutoResizeType } from "./useColumnSizingForFullHorizontalSpaceAndAutoResize.js";

const { useGetAgGridColumnsMock, useUpdateAgGridColumnDefsMock } = vi.hoisted(() => ({
    useGetAgGridColumnsMock: vi.fn(),
    useUpdateAgGridColumnDefsMock: vi.fn(),
}));

vi.mock("../../context/PivotTablePropsContext.js", () => ({
    usePivotTableProps: usePivotTablePropsMock,
}));

vi.mock("../../context/PivotTableSizingContext.js", () => ({
    usePivotTableSizing: usePivotTableSizingMock,
    usePivotTableSizingActions: usePivotTableSizingActionsMock,
}));

vi.mock("../columns/useGetAgGridColumns.js", () => ({
    useGetAgGridColumns: useGetAgGridColumnsMock,
}));

vi.mock("../columns/useUpdateAgGridColumnDefs.js", () => ({
    useUpdateAgGridColumnDefs: useUpdateAgGridColumnDefsMock,
}));

let useColumnSizingForFullHorizontalSpace: typeof useColumnSizingForFullHorizontalSpaceType;
let useColumnSizingForFullHorizontalSpaceAndAutoResize: typeof useColumnSizingForFullHorizontalSpaceAndAutoResizeType;

function setup(options: { defaultWidth?: "autoresizeAll"; containerWidth: number; columnWidths: number[] }) {
    usePivotTablePropsMock.mockReturnValue({
        config: { columnSizing: { growToFit: true, defaultWidth: options.defaultWidth } },
    });
    usePivotTableSizingMock.mockReturnValue({ containerWidth: options.containerWidth, resizeOnShowCount: 0 });
    useGetAgGridColumnsMock.mockReturnValue(() =>
        options.columnWidths.map((width) => ({ getColDef: () => ({}), getActualWidth: () => width })),
    );

    return { current: { hasRenderedFirstData: true, isSized: false } as IGridSizingState };
}

function resized(source: string) {
    return { source, api: {} as AgGridApi } as Parameters<
        NonNullable<ReturnType<typeof useColumnSizingForFullHorizontalSpaceType>>["initColumnWidths"]
    >[0];
}

describe("growToFit column sizing marks the grid as sized", () => {
    beforeEach(async () => {
        vi.resetModules();
        ({ useColumnSizingForFullHorizontalSpace } =
            await import("./useColumnSizingForFullHorizontalSpace.js"));
        ({ useColumnSizingForFullHorizontalSpaceAndAutoResize } =
            await import("./useColumnSizingForFullHorizontalSpaceAndAutoResize.js"));

        usePivotTableSizingActionsMock.mockReturnValue({});
        useUpdateAgGridColumnDefsMock.mockReturnValue(vi.fn());
    });

    it("marks sized after fitting grid width at a positive container width", () => {
        const gridSizingStateRef = setup({ containerWidth: 800, columnWidths: [400, 400] });
        const { result } = renderHook(() => useColumnSizingForFullHorizontalSpace(gridSizingStateRef));

        result.current?.initColumnWidths(resized("sizeColumnsToFit"));

        expect(gridSizingStateRef.current.isSized).toBe(true);
    });

    it("does not mark sized when fitting grid width while hidden", () => {
        const gridSizingStateRef = setup({ containerWidth: 0, columnWidths: [400, 400] });
        const { result } = renderHook(() => useColumnSizingForFullHorizontalSpace(gridSizingStateRef));

        result.current?.initColumnWidths(resized("sizeColumnsToFit"));

        expect(gridSizingStateRef.current.isSized).toBe(false);
    });

    it("does not mark sized for resizes that are not a sizing pass", () => {
        const gridSizingStateRef = setup({ containerWidth: 800, columnWidths: [400, 400] });
        const { result } = renderHook(() => useColumnSizingForFullHorizontalSpace(gridSizingStateRef));

        result.current?.initColumnWidths(resized("uiColumnResized"));

        expect(gridSizingStateRef.current.isSized).toBe(false);
    });

    it("marks sized after auto-resize even when columns are wider than the container and get no flex", () => {
        const gridSizingStateRef = setup({
            defaultWidth: "autoresizeAll",
            containerWidth: 800,
            columnWidths: [600, 600],
        });
        const { result } = renderHook(() =>
            useColumnSizingForFullHorizontalSpaceAndAutoResize(gridSizingStateRef),
        );

        result.current?.initColumnWidths(resized("autosizeColumns"));

        expect(gridSizingStateRef.current.isSized).toBe(true);
    });

    it("does not mark sized after auto-resize while hidden", () => {
        const gridSizingStateRef = setup({
            defaultWidth: "autoresizeAll",
            containerWidth: 0,
            columnWidths: [600, 600],
        });
        const { result } = renderHook(() =>
            useColumnSizingForFullHorizontalSpaceAndAutoResize(gridSizingStateRef),
        );

        result.current?.initColumnWidths(resized("autosizeColumns"));

        expect(gridSizingStateRef.current.isSized).toBe(false);
    });
});
