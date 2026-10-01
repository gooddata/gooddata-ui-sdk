// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    useCurrentDataViewMock,
    usePivotTablePropsMock,
    usePivotTableSizingActionsMock,
    usePivotTableSizingMock,
} from "../../testing/contextMocks.test.helpers.js";
import { type AgGridApi } from "../../types/agGrid.js";

import { type useInitialAutoResizeVisibility as useInitialAutoResizeVisibilityType } from "./useInitialAutoResizeVisibility.js";

const { useAgGridApiMock } = vi.hoisted(() => ({
    useAgGridApiMock: vi.fn(),
}));

vi.mock("../../context/AgGridApiContext.js", () => ({
    useAgGridApi: useAgGridApiMock,
}));

vi.mock("../../context/PivotTablePropsContext.js", () => ({
    usePivotTableProps: usePivotTablePropsMock,
}));

vi.mock("../../context/CurrentDataViewContext.js", () => ({
    useCurrentDataView: useCurrentDataViewMock,
}));

vi.mock("../../context/PivotTableSizingContext.js", () => ({
    usePivotTableSizing: usePivotTableSizingMock,
    usePivotTableSizingActions: usePivotTableSizingActionsMock,
}));

let useInitialAutoResizeVisibility: typeof useInitialAutoResizeVisibilityType;

const SETTLE_MS = 400;

interface ISizing {
    containerWidth: number;
    resizeOnShowCount: number;
}

function setup(columnSizing: { growToFit: boolean; defaultWidth?: "autoresizeAll" | "viewport" }) {
    const api = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    } as unknown as AgGridApi;
    const currentDataView = {};
    const config = { columnSizing };

    useAgGridApiMock.mockReturnValue({ agGridApi: api, setAgGridApi: vi.fn() });
    usePivotTablePropsMock.mockReturnValue({ config, rows: [], columns: [] });
    useCurrentDataViewMock.mockReturnValue({ currentDataView });

    const hook = renderHook(
        (sizing: ISizing) => {
            usePivotTableSizingMock.mockReturnValue(sizing);
            return useInitialAutoResizeVisibility();
        },
        {
            initialProps: { containerWidth: 800, resizeOnShowCount: 0 },
        },
    );

    act(() => {
        vi.advanceTimersByTime(SETTLE_MS);
    });

    return hook;
}

describe("useInitialAutoResizeVisibility", () => {
    beforeEach(async () => {
        vi.useFakeTimers();
        vi.resetModules();
        ({ useInitialAutoResizeVisibility } = await import("./useInitialAutoResizeVisibility.js"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("stays ready when re-shown with growToFit off and autoresizeAll, as no resize runs on show", () => {
        const { result, rerender } = setup({ growToFit: false, defaultWidth: "autoresizeAll" });
        expect(result.current).toBe(true);

        rerender({ containerWidth: 0, resizeOnShowCount: 0 });
        rerender({ containerWidth: 800, resizeOnShowCount: 0 });

        expect(result.current).toBe(true);
    });

    it("hides until settled when a resize runs on show", () => {
        const { result, rerender } = setup({ growToFit: true, defaultWidth: "autoresizeAll" });
        expect(result.current).toBe(true);

        rerender({ containerWidth: 0, resizeOnShowCount: 0 });
        rerender({ containerWidth: 800, resizeOnShowCount: 1 });

        expect(result.current).toBe(false);

        act(() => {
            vi.advanceTimersByTime(SETTLE_MS);
        });

        expect(result.current).toBe(true);
    });
});
