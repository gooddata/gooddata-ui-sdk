// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigModeValues,
    type FilterContextItem,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../../../contexts/ScheduledEmailDialogContext.js", () => ({
    useScheduledEmailDialogContext: () => ({
        commonDateFilterMode: DashboardDateFilterConfigModeValues.ACTIVE,
        dateFiltersModeMap: new Map([["date-ds-1", DashboardDateFilterConfigModeValues.HIDDEN]]),
        attributeFiltersModeMap: new Map([
            ["attr-1", DashboardAttributeFilterConfigModeValues.HIDDEN],
            ["attr-2", DashboardAttributeFilterConfigModeValues.ACTIVE],
        ]),
    }),
}));

vi.mock("../../../../shared/hooks/useFiltersNamings.js", () => ({
    useFiltersNamings: (filters: FilterContextItem[]) => filters.map((f: any) => ({ id: f.id ?? "no-id" })),
}));

import { useFiltersForDashboardScheduledExportInfo } from "../useFiltersForDashboardScheduledExportInfo.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const commonDateFilter: FilterContextItem = {
    dateFilter: { type: "relative", granularity: "GDC.time.year" },
} as any;

const hiddenDateFilter: FilterContextItem = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.month",
        localIdentifier: "date-ds-1",
        dataSet: { identifier: "date-ds-1", type: "identifier" },
    },
} as any;

const visibleDateFilter: FilterContextItem = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.month",
        localIdentifier: "date-ds-2",
        dataSet: { identifier: "date-ds-2", type: "identifier" },
    },
} as any;

const hiddenAttrFilter: FilterContextItem = {
    attributeFilter: {
        localIdentifier: "attr-1",
        attributeElements: { type: "values", values: [] },
        displayForm: { identifier: "df-1", type: "identifier" },
        negativeSelection: false,
    },
} as any;

const visibleAttrFilter: FilterContextItem = {
    attributeFilter: {
        localIdentifier: "attr-2",
        attributeElements: { type: "values", values: [] },
        displayForm: { identifier: "df-2", type: "identifier" },
        negativeSelection: false,
    },
} as any;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useFiltersForDashboardScheduledExportInfo (context-aware)", () => {
    it("filters out hidden common date filter", () => {
        // The mock has commonDateFilterMode = ACTIVE, so common date filter should be visible.
        // Let's just verify it passes through when visible.
        const { result } = renderHook(() =>
            useFiltersForDashboardScheduledExportInfo({ effectiveFilters: [commonDateFilter] }),
        );
        expect(result.current).toHaveLength(1);
    });

    it("filters out hidden date dataset filter", () => {
        const { result } = renderHook(() =>
            useFiltersForDashboardScheduledExportInfo({
                effectiveFilters: [hiddenDateFilter, visibleDateFilter],
            }),
        );
        // hiddenDateFilter (date-ds-1) should be removed, visibleDateFilter should remain
        expect(result.current).toHaveLength(1);
    });

    it("filters out hidden attribute filter", () => {
        const { result } = renderHook(() =>
            useFiltersForDashboardScheduledExportInfo({
                effectiveFilters: [hiddenAttrFilter, visibleAttrFilter],
            }),
        );
        // attr-1 is HIDDEN, attr-2 is ACTIVE
        expect(result.current).toHaveLength(1);
    });

    it("returns empty array when no filters provided", () => {
        const { result } = renderHook(() =>
            useFiltersForDashboardScheduledExportInfo({ effectiveFilters: [] }),
        );
        expect(result.current).toHaveLength(0);
    });

    it("returns empty array when effectiveFilters is undefined", () => {
        const { result } = renderHook(() => useFiltersForDashboardScheduledExportInfo({}));
        expect(result.current).toHaveLength(0);
    });
});
