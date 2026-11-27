// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { type GridSizeChangedEvent } from "ag-grid-enterprise";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    usePivotTablePropsMock,
    usePivotTableSizingActionsMock,
    usePivotTableSizingMock,
} from "../../testing/contextMocks.test.helpers.js";
import { type AgGridApi, type AgGridProps } from "../../types/agGrid.js";

import { type useResizeOnGridSizeChanged as useResizeOnGridSizeChangedType } from "./useResizeOnGridSizeChanged.js";

vi.mock("../../context/PivotTablePropsContext.js", () => ({
    usePivotTableProps: usePivotTablePropsMock,
}));

vi.mock("../../context/PivotTableSizingContext.js", () => ({
    usePivotTableSizing: usePivotTableSizingMock,
    usePivotTableSizingActions: usePivotTableSizingActionsMock,
}));

// Several other test files (real usages and other mocks) also touch PivotTablePropsContext, and the
// suite runs with isolate: false (see vitest.config.ts's own comment on this exact pattern) - without
// resetting modules and re-importing dynamically, whichever file's resolution happens to be cached
// first "wins" for the whole worker, so this file's own vi.mock calls above can silently not apply.
let useResizeOnGridSizeChanged: typeof useResizeOnGridSizeChangedType;
let markResizeOnShowMock: ReturnType<typeof vi.fn>;
let setContainerWidthMock: ReturnType<typeof vi.fn>;

function setup(options: {
    growToFit?: boolean;
    defaultWidth?: "autoresizeAll" | "viewport" | "fixed";
    hasRenderedFirstData: boolean;
    processedColumnIds?: string[];
    isSized?: boolean;
}) {
    const state = { fingerprint: "execution-1" };
    usePivotTablePropsMock.mockImplementation(() => ({
        config: {
            columnSizing: {
                growToFit: options.growToFit ?? true,
                defaultWidth: options.defaultWidth,
            },
        },
        execution: { fingerprint: () => state.fingerprint },
    }));

    const processedColumnsRef = { current: new Set(options.processedColumnIds ?? []) };
    const gridSizingStateRef = {
        current: { hasRenderedFirstData: options.hasRenderedFirstData, isSized: options.isSized ?? false },
    };

    return {
        state,
        gridSizingStateRef,
        ...renderHook(() => useResizeOnGridSizeChanged(processedColumnsRef, gridSizingStateRef)),
    };
}

interface IFakeColumn {
    id: string;
    left: number;
    width: number;
    fixedWidth?: number;
}

function createFakeColumn({ id, left, width, fixedWidth }: IFakeColumn) {
    return {
        getId: () => id,
        getLeft: () => left,
        getActualWidth: () => width,
        getColDef: () => ({ width: fixedWidth }),
    };
}

function createFakeApi(
    centerColumns: IFakeColumn[] = [],
    scrollLeft = 0,
    leftPinnedColumns: IFakeColumn[] = [],
): AgGridApi {
    const listeners = new Map<string, Set<() => void>>();

    return {
        sizeColumnsToFit: vi.fn(),
        autoSizeAllColumns: vi.fn(),
        getHorizontalPixelRange: () => ({ left: scrollLeft, right: scrollLeft }),
        getDisplayedLeftColumns: () => leftPinnedColumns.map(createFakeColumn),
        getDisplayedCenterColumns: () => centerColumns.map(createFakeColumn),
        getDisplayedRightColumns: () => [],
        addEventListener: vi.fn((event: string, listener: () => void) => {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }
            listeners.get(event)?.add(listener);
        }),
        removeEventListener: vi.fn((event: string, listener: () => void) => {
            listeners.get(event)?.delete(listener);
        }),
        dispatchEvent: (event: string) => {
            listeners.get(event)?.forEach((listener) => listener());
        },
    } as unknown as AgGridApi & { dispatchEvent: (event: string) => void };
}

function createGridSizeChangedEvent(api: AgGridApi, clientWidth: number): GridSizeChangedEvent {
    return {
        api,
        clientWidth,
        clientHeight: 400,
        type: "gridSizeChanged",
    } as unknown as GridSizeChangedEvent;
}

function fireGridSizeChanged(
    result: { current: ReturnType<typeof useResizeOnGridSizeChangedType> },
    api: AgGridApi,
    clientWidth: number,
) {
    const enhanced = result.current({} as AgGridProps);
    enhanced.onGridSizeChanged?.(createGridSizeChangedEvent(api, clientWidth));
}

describe("useResizeOnGridSizeChanged", () => {
    beforeEach(async () => {
        vi.resetModules();
        ({ useResizeOnGridSizeChanged } = await import("./useResizeOnGridSizeChanged.js"));

        markResizeOnShowMock = vi.fn();
        setContainerWidthMock = vi.fn();
        usePivotTableSizingActionsMock.mockReturnValue({
            setContainerWidth: setContainerWidthMock,
            markResizeOnShow: markResizeOnShowMock,
        });
    });

    it("calls sizeColumnsToFit once when width goes 0 -> 800 (growToFit only, after first data rendered)", () => {
        const { result } = setup({ growToFit: true, hasRenderedFirstData: true });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.sizeColumnsToFit).toHaveBeenCalledTimes(1);
        expect(api.autoSizeAllColumns).not.toHaveBeenCalled();
    });

    it("signals markResizeOnShow once when width goes 0 -> 800 with growToFit", () => {
        const { result } = setup({ growToFit: true, hasRenderedFirstData: true });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 900);

        expect(markResizeOnShowMock).toHaveBeenCalledTimes(1);
    });

    it("does not signal markResizeOnShow with growToFit off when every column in view is already auto-sized", () => {
        const { result } = setup({
            growToFit: false,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
            processedColumnIds: ["a", "b"],
        });
        const api = createFakeApi([
            { id: "a", left: 0, width: 300 },
            { id: "b", left: 300, width: 300 },
        ]);

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(markResizeOnShowMock).not.toHaveBeenCalled();
    });

    it("signals markResizeOnShow with growToFit off when a not yet auto-sized column comes into view", () => {
        const { result } = setup({
            growToFit: false,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
            processedColumnIds: ["a", "b"],
        });
        const api = createFakeApi([
            { id: "a", left: 0, width: 300 },
            { id: "b", left: 300, width: 300 },
            { id: "c", left: 600, width: 300 },
        ]);

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(markResizeOnShowMock).toHaveBeenCalledTimes(1);
        expect(api.autoSizeAllColumns).not.toHaveBeenCalled();
    });

    it("does not signal markResizeOnShow with growToFit off for unsized columns outside the viewport", () => {
        const { result } = setup({
            growToFit: false,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
            processedColumnIds: ["a", "b"],
        });
        const api = createFakeApi(
            [
                { id: "a", left: 0, width: 300 },
                { id: "b", left: 300, width: 300 },
                { id: "c", left: 1500, width: 300 },
            ],
            100,
        );

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(markResizeOnShowMock).not.toHaveBeenCalled();
    });

    it("does not signal markResizeOnShow with growToFit off for columns with a width fixed by config", () => {
        const { result } = setup({
            growToFit: false,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
            processedColumnIds: ["a"],
        });
        const api = createFakeApi([
            { id: "a", left: 0, width: 300 },
            { id: "b", left: 300, width: 200, fixedWidth: 200 },
        ]);

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(markResizeOnShowMock).not.toHaveBeenCalled();
    });

    it("does not signal markResizeOnShow with growToFit off and fixed default width", () => {
        const { result } = setup({
            growToFit: false,
            defaultWidth: "fixed",
            hasRenderedFirstData: true,
        });
        const api = createFakeApi([{ id: "a", left: 0, width: 300 }]);

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(markResizeOnShowMock).not.toHaveBeenCalled();
    });

    it("skips growToFit sizing when re-shown after the grid was already sized", () => {
        const { result } = setup({ growToFit: true, hasRenderedFirstData: true, isSized: true });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.sizeColumnsToFit).not.toHaveBeenCalled();
        expect(markResizeOnShowMock).not.toHaveBeenCalled();
    });

    it("skips growToFit sizing on later re-shows once the sizing pass marked the grid sized", () => {
        const { result, gridSizingStateRef } = setup({ growToFit: true, hasRenderedFirstData: true });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);
        gridSizingStateRef.current.isSized = true;
        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.sizeColumnsToFit).toHaveBeenCalledTimes(1);
        expect(markResizeOnShowMock).toHaveBeenCalledTimes(1);
    });

    it("applies growToFit sizing on re-show when the grid was not sized before hiding", () => {
        const { result } = setup({ growToFit: true, hasRenderedFirstData: true });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.sizeColumnsToFit).toHaveBeenCalledTimes(1);
        expect(markResizeOnShowMock).toHaveBeenCalledTimes(1);
    });

    it("skips growToFit sizing on re-show after a sort-only execution change of an already sized grid", () => {
        const { result, rerender, state } = setup({
            growToFit: true,
            hasRenderedFirstData: true,
            isSized: true,
        });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 0);
        state.fingerprint = "execution-1-sorted";
        rerender();
        fireGridSizeChanged(result, api, 800);

        expect(api.addEventListener).not.toHaveBeenCalledWith("firstDataRendered", expect.any(Function));
        expect(api.sizeColumnsToFit).not.toHaveBeenCalled();
        expect(markResizeOnShowMock).not.toHaveBeenCalled();
    });

    it("records first data rendered for this grid and keeps the existing onFirstDataRendered handler", () => {
        const { result, gridSizingStateRef } = setup({ growToFit: true, hasRenderedFirstData: false });
        const existingHandler = vi.fn();

        const enhanced = result.current({ onFirstDataRendered: existingHandler } as AgGridProps);
        enhanced.onFirstDataRendered?.({} as Parameters<NonNullable<AgGridProps["onFirstDataRendered"]>>[0]);

        expect(gridSizingStateRef.current.hasRenderedFirstData).toBe(true);
        expect(existingHandler).toHaveBeenCalledTimes(1);
    });

    it("keeps containerWidth in sync with every grid width change", () => {
        const { result } = setup({ growToFit: false, hasRenderedFirstData: true });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 1200);
        fireGridSizeChanged(result, api, 1200);

        expect(setContainerWidthMock.mock.calls).toEqual([[0], [800], [1200]]);
    });

    it("still signals markResizeOnShow when already sized with growToFit + autoresizeAll and an unsized column comes into view", () => {
        const { result } = setup({
            growToFit: true,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
            processedColumnIds: ["a"],
            isSized: true,
        });
        const api = createFakeApi([
            { id: "a", left: 0, width: 300 },
            { id: "b", left: 300, width: 300 },
        ]);

        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.autoSizeAllColumns).not.toHaveBeenCalled();
        expect(markResizeOnShowMock).toHaveBeenCalledTimes(1);
    });

    it("excludes pinned column width from the center viewport when looking for unsized columns", () => {
        const { result } = setup({
            growToFit: false,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
            processedColumnIds: ["pinned", "a"],
        });
        const api = createFakeApi(
            [
                { id: "a", left: 0, width: 500 },
                { id: "b", left: 550, width: 300 },
            ],
            0,
            [{ id: "pinned", left: 0, width: 300 }],
        );

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(markResizeOnShowMock).not.toHaveBeenCalled();
    });

    it("calls autoSizeAllColumns once when width goes 0 -> 800 (growToFit + autoresizeAll)", () => {
        const { result } = setup({
            growToFit: true,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
        });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.autoSizeAllColumns).toHaveBeenCalledTimes(1);
        expect(api.sizeColumnsToFit).not.toHaveBeenCalled();
    });

    it("does nothing for a normal resize (800 -> 900)", () => {
        const { result } = setup({
            growToFit: true,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
        });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 900);

        expect(api.autoSizeAllColumns).not.toHaveBeenCalled();
        expect(api.sizeColumnsToFit).not.toHaveBeenCalled();
    });

    it("does nothing when growToFit is off", () => {
        const { result } = setup({
            growToFit: false,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: true,
        });
        const api = createFakeApi();

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.autoSizeAllColumns).not.toHaveBeenCalled();
        expect(api.sizeColumnsToFit).not.toHaveBeenCalled();
    });

    it("defers resize until firstDataRendered when width goes 0 -> 800 before first data has rendered", () => {
        const { result } = setup({
            growToFit: true,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: false,
        });
        const api = createFakeApi() as AgGridApi & { dispatchEvent: (event: string) => void };

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        expect(api.autoSizeAllColumns).not.toHaveBeenCalled();
        expect(api.sizeColumnsToFit).not.toHaveBeenCalled();
        expect(api.addEventListener).toHaveBeenCalledWith("firstDataRendered", expect.any(Function));

        api.dispatchEvent("firstDataRendered");

        expect(api.autoSizeAllColumns).toHaveBeenCalledTimes(1);
        expect(api.removeEventListener).toHaveBeenCalledWith("firstDataRendered", expect.any(Function));
    });

    it("cancels a pending firstDataRendered retry when a new zero-width transition supersedes it", () => {
        const { result } = setup({
            growToFit: true,
            defaultWidth: "autoresizeAll",
            hasRenderedFirstData: false,
        });
        const api = createFakeApi() as AgGridApi & { dispatchEvent: (event: string) => void };

        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);
        fireGridSizeChanged(result, api, 0);
        fireGridSizeChanged(result, api, 800);

        api.dispatchEvent("firstDataRendered");

        expect(api.autoSizeAllColumns).toHaveBeenCalledTimes(1);
    });
});
