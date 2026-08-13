// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationVisibleFilter,
    type IDashboardExportParameter,
    type IFilter,
    type IInsight,
    type IWidget,
    idRef,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()). We use
// vi.fn() inline and retrieve spies via vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

const { mockUseScheduledEmailDialogContext } = vi.hoisted(() => ({
    mockUseScheduledEmailDialogContext: vi.fn(),
}));

vi.mock("../../../contexts/ScheduledEmailDialogContext.js", () => ({
    useScheduledEmailDialogContext: mockUseScheduledEmailDialogContext,
}));

vi.mock("../../../shared/filters/index.js", () => ({
    getAppliedWidgetFilters: vi.fn(),
    getAppliedDashboardFilters: vi.fn(),
    getVisibleFiltersByFilters: vi.fn(),
    getVisibleFiltersByFiltersByTab: vi.fn(),
}));

vi.mock("../../../shared/automationFilters/automationParameters.js", () => ({
    shouldStoreExportParameters: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { shouldStoreExportParameters } from "../../../shared/automationFilters/automationParameters.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../../shared/filters/index.js";
import {
    type IUseScheduledEmailEffectiveFiltersProps,
    useScheduledEmailEffectiveFilters,
} from "../useScheduledEmailEffectiveFilters.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const getAppliedWidgetFiltersSpy = vi.mocked(getAppliedWidgetFilters);
const getAppliedDashboardFiltersSpy = vi.mocked(getAppliedDashboardFilters);
const getVisibleFiltersByFiltersSpy = vi.mocked(getVisibleFiltersByFilters);
const getVisibleFiltersByFiltersByTabSpy = vi.mocked(getVisibleFiltersByFiltersByTab);
const shouldStoreExportParametersSpy = vi.mocked(shouldStoreExportParameters);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_WIDGET: IWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ignoreDashboardFilters: [],
    drills: [],
    title: "Widget",
    description: "",
    ref: idRef("w1"),
    uri: "/w1",
    identifier: "w1",
    localIdentifier: "w1",
};

const SENTINEL_INSIGHT: IInsight = {
    insight: {
        identifier: "insight-1",
        uri: "/insight-1",
        ref: idRef("insight-1", "insight"),
        title: "Insight",
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

function fakeFilterContextItem(localIdentifier: string): FilterContextItem {
    return {
        attributeFilter: {
            displayForm: idRef(`df-${localIdentifier}`),
            negativeSelection: false,
            attributeElements: { values: [] },
            localIdentifier,
        },
    };
}

function fakeVisibleFilter(localIdentifier: string): IAutomationVisibleFilter {
    return { localIdentifier };
}

function fakeExecutionFilter(localIdentifier: string): IFilter {
    return newPositiveAttributeFilter(idRef(`df-${localIdentifier}`), ["v1"], localIdentifier);
}

function fakeFiltersTab(tabId: string, hiddenFilters: FilterContextItem[] = []): IAutomationFiltersTab {
    return {
        tabId,
        tabTitle: `Tab ${tabId}`,
        availableFilters: [],
        defaultSelectedFilters: [],
        lockedFilters: [],
        hiddenFilters,
    };
}

const SENTINEL_HIDDEN_FILTERS: FilterContextItem[] = [fakeFilterContextItem("hidden-1")];
const SENTINEL_COMMON_DATE_FILTER_ID = "common-date-filter-1";
const SENTINEL_EXPORT_PARAMETERS_BY_TAB: Record<string, IDashboardExportParameter[]> = {
    tab1: [{ id: "topN", value: "5", title: "Top N" }],
};

const DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE = {
    hiddenFilters: SENTINEL_HIDDEN_FILTERS,
    commonDateFilterId: SENTINEL_COMMON_DATE_FILTER_ID,
    exportParametersByTab: SENTINEL_EXPORT_PARAMETERS_BY_TAB,
};

const BASE_PROPS: IUseScheduledEmailEffectiveFiltersProps = {
    widget: undefined,
    insight: undefined,
    editedAutomationFilters: [],
    editedAutomationFiltersByTab: undefined,
    availableFiltersAsVisibleFilters: undefined,
    availableFiltersAsVisibleFiltersByTab: undefined,
    filtersDataByTab: undefined,
    storeFilters: false,
};

function renderEffectiveFiltersHook(props: Partial<IUseScheduledEmailEffectiveFiltersProps> = {}) {
    const mergedProps: IUseScheduledEmailEffectiveFiltersProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useScheduledEmailEffectiveFilters(mergedProps));
}

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();

    mockUseScheduledEmailDialogContext.mockReturnValue(DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE);

    getAppliedWidgetFiltersSpy.mockImplementation((_a, _b, _c, _d, _e, mergeInsightFilters) =>
        mergeInsightFilters
            ? [fakeExecutionFilter("widget-with-insight")]
            : [fakeExecutionFilter("widget-without-insight")],
    );
    getAppliedDashboardFiltersSpy.mockImplementation((filters) => filters);
    getVisibleFiltersByFiltersSpy.mockReturnValue(undefined);
    getVisibleFiltersByFiltersByTabSpy.mockReturnValue(undefined);
    shouldStoreExportParametersSpy.mockReturnValue(false);
});

// ---------------------------------------------------------------------------
// effectiveWidgetFilters / effectiveWidgetFiltersWithInsight
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — widget filters", () => {
    it("calls getAppliedWidgetFilters with mergeInsightFilters=false for effectiveWidgetFilters", () => {
        const editedAutomationFilters = [fakeFilterContextItem("f1")];

        renderEffectiveFiltersHook({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            editedAutomationFilters,
        });

        expect(getAppliedWidgetFiltersSpy).toHaveBeenNthCalledWith(
            1,
            editedAutomationFilters,
            SENTINEL_HIDDEN_FILTERS,
            SENTINEL_WIDGET,
            SENTINEL_INSIGHT,
            SENTINEL_COMMON_DATE_FILTER_ID,
            false,
        );
    });

    it("calls getAppliedWidgetFilters with mergeInsightFilters=true for effectiveWidgetFiltersWithInsight", () => {
        const editedAutomationFilters = [fakeFilterContextItem("f1")];

        renderEffectiveFiltersHook({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            editedAutomationFilters,
        });

        expect(getAppliedWidgetFiltersSpy).toHaveBeenNthCalledWith(
            2,
            editedAutomationFilters,
            SENTINEL_HIDDEN_FILTERS,
            SENTINEL_WIDGET,
            SENTINEL_INSIGHT,
            SENTINEL_COMMON_DATE_FILTER_ID,
            true,
        );
    });

    it("defaults editedAutomationFilters to [] when undefined", () => {
        renderEffectiveFiltersHook({ editedAutomationFilters: undefined });

        expect(getAppliedWidgetFiltersSpy).toHaveBeenNthCalledWith(
            1,
            [],
            SENTINEL_HIDDEN_FILTERS,
            undefined,
            undefined,
            SENTINEL_COMMON_DATE_FILTER_ID,
            false,
        );
    });

    it("returns the values from getAppliedWidgetFilters for both derivations", () => {
        const { result } = renderEffectiveFiltersHook({});

        expect(result.current.effectiveWidgetFilters).toEqual([
            fakeExecutionFilter("widget-without-insight"),
        ]);
        expect(result.current.effectiveWidgetFiltersWithInsight).toEqual([
            fakeExecutionFilter("widget-with-insight"),
        ]);
    });
});

// ---------------------------------------------------------------------------
// effectiveVisibleWidgetFilters
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — effectiveVisibleWidgetFilters", () => {
    it("calls getVisibleFiltersByFilters with the raw editedAutomationFilters and storeFilters hardcoded true", () => {
        const editedAutomationFilters = [fakeFilterContextItem("f1")];
        const availableFiltersAsVisibleFilters = [fakeVisibleFilter("f1")];

        renderEffectiveFiltersHook({
            editedAutomationFilters,
            availableFiltersAsVisibleFilters,
            storeFilters: false,
        });

        expect(getVisibleFiltersByFiltersSpy).toHaveBeenNthCalledWith(
            1,
            editedAutomationFilters,
            availableFiltersAsVisibleFilters,
            true,
        );
    });
});

// ---------------------------------------------------------------------------
// effectiveDashboardFilters
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — effectiveDashboardFilters", () => {
    it("passes storeFilters=true regardless of the prop when isWidget is true", () => {
        const editedAutomationFilters = [fakeFilterContextItem("f1")];

        renderEffectiveFiltersHook({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            editedAutomationFilters,
            storeFilters: false,
        });

        expect(getAppliedDashboardFiltersSpy).toHaveBeenNthCalledWith(
            1,
            editedAutomationFilters,
            SENTINEL_HIDDEN_FILTERS,
            true,
        );
    });

    it("passes the storeFilters prop through when isWidget is false", () => {
        const editedAutomationFilters = [fakeFilterContextItem("f1")];

        renderEffectiveFiltersHook({
            widget: undefined,
            insight: undefined,
            editedAutomationFilters,
            storeFilters: true,
        });

        expect(getAppliedDashboardFiltersSpy).toHaveBeenNthCalledWith(
            1,
            editedAutomationFilters,
            SENTINEL_HIDDEN_FILTERS,
            true,
        );
    });

    it("defaults editedAutomationFilters to [] when undefined", () => {
        renderEffectiveFiltersHook({ editedAutomationFilters: undefined, storeFilters: false });

        expect(getAppliedDashboardFiltersSpy).toHaveBeenNthCalledWith(1, [], SENTINEL_HIDDEN_FILTERS, false);
    });
});

// ---------------------------------------------------------------------------
// effectiveVisibleDashboardFilters
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — effectiveVisibleDashboardFilters", () => {
    it("calls getVisibleFiltersByFilters with editedAutomationFilters ?? [] and the storeFilters prop", () => {
        const availableFiltersAsVisibleFilters = [fakeVisibleFilter("f1")];

        renderEffectiveFiltersHook({
            editedAutomationFilters: undefined,
            availableFiltersAsVisibleFilters,
            storeFilters: true,
        });

        // 2nd call: effectiveVisibleWidgetFilters (always hardcoded true) is the 1st call.
        expect(getVisibleFiltersByFiltersSpy).toHaveBeenNthCalledWith(
            2,
            [],
            availableFiltersAsVisibleFilters,
            true,
        );
    });
});

// ---------------------------------------------------------------------------
// effectiveVisibleDashboardFiltersByTab
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — effectiveVisibleDashboardFiltersByTab", () => {
    it("calls getVisibleFiltersByFiltersByTab with editedAutomationFiltersByTab, availableFiltersAsVisibleFiltersByTab and storeFilters", () => {
        const editedAutomationFiltersByTab = { tab1: [fakeFilterContextItem("f1")] };
        const availableFiltersAsVisibleFiltersByTab = { tab1: [fakeVisibleFilter("f1")] };

        renderEffectiveFiltersHook({
            editedAutomationFiltersByTab,
            availableFiltersAsVisibleFiltersByTab,
            storeFilters: true,
        });

        expect(getVisibleFiltersByFiltersByTabSpy).toHaveBeenCalledWith(
            editedAutomationFiltersByTab,
            availableFiltersAsVisibleFiltersByTab,
            true,
        );
    });
});

// ---------------------------------------------------------------------------
// effectiveDashboardFiltersByTab (per-tab useMemo)
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — effectiveDashboardFiltersByTab (per-tab useMemo)", () => {
    it("is undefined when editedAutomationFiltersByTab is undefined", () => {
        const { result } = renderEffectiveFiltersHook({
            editedAutomationFiltersByTab: undefined,
            storeFilters: true,
        });

        expect(result.current.effectiveDashboardFiltersByTab).toBeUndefined();
        // Note: effectiveDashboardFilters (top-level) still calls getAppliedDashboardFilters once;
        // the useMemo reduce itself must short-circuit before calling it for any tab.
        expect(getAppliedDashboardFiltersSpy).toHaveBeenCalledTimes(1);
    });

    it("is undefined when storeFilters is falsy, even with editedAutomationFiltersByTab present", () => {
        const editedAutomationFiltersByTab = { tab1: [fakeFilterContextItem("f1")] };

        const { result } = renderEffectiveFiltersHook({
            editedAutomationFiltersByTab,
            storeFilters: false,
        });

        expect(result.current.effectiveDashboardFiltersByTab).toBeUndefined();
        // Note: effectiveDashboardFilters (top-level) still calls getAppliedDashboardFilters once;
        // the useMemo reduce itself must short-circuit before calling it for any tab.
        expect(getAppliedDashboardFiltersSpy).toHaveBeenCalledTimes(1);
    });

    it("resolves tabHiddenFilters from filtersDataByTab (or [] when the tab is missing) and only keeps tabs with truthy appliedFilters", () => {
        const tab1Filters = [fakeFilterContextItem("tab1-f1")];
        const tab2Filters = [fakeFilterContextItem("tab2-f1")];
        const editedAutomationFiltersByTab = { tab1: tab1Filters, tab2: tab2Filters };
        const tab1HiddenFilters = [fakeFilterContextItem("tab1-hidden")];
        const filtersDataByTab = [fakeFiltersTab("tab1", tab1HiddenFilters)]; // tab2 missing -> [] hidden filters

        const tab1Applied = [fakeFilterContextItem("tab1-applied")];
        getAppliedDashboardFiltersSpy.mockImplementation((filters) => {
            if (filters === tab1Filters) {
                return tab1Applied;
            }
            if (filters === tab2Filters) {
                // Simulate storeFilters=false-like "no filters returned" branch for tab2.
                return undefined;
            }
            return filters;
        });

        const { result } = renderEffectiveFiltersHook({
            editedAutomationFiltersByTab,
            filtersDataByTab,
            storeFilters: true,
        });

        expect(getAppliedDashboardFiltersSpy).toHaveBeenCalledWith(tab1Filters, tab1HiddenFilters, true);
        expect(getAppliedDashboardFiltersSpy).toHaveBeenCalledWith(tab2Filters, [], true);
        expect(result.current.effectiveDashboardFiltersByTab).toEqual({ tab1: tab1Applied });
    });

    it("memoizes on [editedAutomationFiltersByTab, filtersDataByTab, storeFilters] — stable reference across an unrelated rerender, new reference when a dep changes", () => {
        const editedAutomationFiltersByTab = { tab1: [fakeFilterContextItem("f1")] };
        getAppliedDashboardFiltersSpy.mockImplementation((filters) => filters);

        const { result, rerender } = renderHook(
            (props: IUseScheduledEmailEffectiveFiltersProps) => useScheduledEmailEffectiveFilters(props),
            {
                initialProps: {
                    ...BASE_PROPS,
                    editedAutomationFiltersByTab,
                    storeFilters: true,
                },
            },
        );

        const firstResult = result.current.effectiveDashboardFiltersByTab;

        // Rerender with a new props object but the same dep values -> memoized, same reference.
        rerender({
            ...BASE_PROPS,
            editedAutomationFiltersByTab,
            storeFilters: true,
        });
        expect(result.current.effectiveDashboardFiltersByTab).toBe(firstResult);

        // Rerender with a changed dep (storeFilters) -> new reference.
        const newEditedAutomationFiltersByTab = { tab1: [fakeFilterContextItem("f2")] };
        rerender({
            ...BASE_PROPS,
            editedAutomationFiltersByTab: newEditedAutomationFiltersByTab,
            storeFilters: true,
        });
        expect(result.current.effectiveDashboardFiltersByTab).not.toBe(firstResult);
    });
});

// ---------------------------------------------------------------------------
// Referential stability
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — referential stability", () => {
    it("returns referentially identical values when re-rendered with unchanged inputs", () => {
        // Local, distinguishable, non-undefined mocks: each invocation allocates a fresh
        // object/array, so an unmemoized call site would produce a new reference on every
        // render and fail the `toBe` assertions below. The file-wide `beforeEach` defaults
        // (e.g. getVisibleFiltersByFilters -> undefined) are intentionally NOT reused here,
        // since `undefined === undefined` would make those assertions vacuous.
        // `getAppliedWidgetFilters`' default already allocates per call, so it needs no override.
        getAppliedDashboardFiltersSpy.mockImplementation(() => [fakeFilterContextItem("dashboard-applied")]);
        getVisibleFiltersByFiltersSpy.mockImplementation(() => [fakeVisibleFilter("visible")]);
        getVisibleFiltersByFiltersByTabSpy.mockImplementation(() => ({
            tab1: [fakeVisibleFilter("visible-tab")],
        }));

        const editedAutomationFiltersByTab = { tab1: [fakeFilterContextItem("f1")] };
        const availableFiltersAsVisibleFiltersByTab = { tab1: [fakeVisibleFilter("f1")] };

        const props: IUseScheduledEmailEffectiveFiltersProps = {
            widget: undefined,
            insight: undefined,
            editedAutomationFilters: [fakeFilterContextItem("f1")],
            editedAutomationFiltersByTab,
            availableFiltersAsVisibleFilters: undefined,
            availableFiltersAsVisibleFiltersByTab,
            filtersDataByTab: undefined,
            storeFilters: true,
        };
        const { result, rerender } = renderHook(
            (p: IUseScheduledEmailEffectiveFiltersProps) => useScheduledEmailEffectiveFilters(p),
            { initialProps: props },
        );
        const first = result.current;

        rerender(props);

        expect(result.current.effectiveWidgetFilters).toBe(first.effectiveWidgetFilters);
        expect(result.current.effectiveWidgetFiltersWithInsight).toBe(
            first.effectiveWidgetFiltersWithInsight,
        );
        expect(result.current.effectiveVisibleWidgetFilters).toBe(first.effectiveVisibleWidgetFilters);
        expect(result.current.effectiveDashboardFilters).toBe(first.effectiveDashboardFilters);
        expect(result.current.effectiveVisibleDashboardFilters).toBe(first.effectiveVisibleDashboardFilters);
        expect(result.current.effectiveVisibleDashboardFiltersByTab).toBe(
            first.effectiveVisibleDashboardFiltersByTab,
        );
        expect(result.current.effectiveDashboardFiltersByTab).toBe(first.effectiveDashboardFiltersByTab);

        // These three hold only because the upstream namings chain is stable now. The assertion that
        // this is true of the *production* caller, and not just of these mocks, lives in
        // useScheduledEmailEffectiveFilters.realChain.test.tsx.
    });
});

// ---------------------------------------------------------------------------
// Store-flag asymmetry: isWidget always forces effectiveDashboardFilters to
// be stored, regardless of the storeFilters prop.
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — store-flag asymmetry", () => {
    beforeEach(() => {
        getAppliedDashboardFiltersSpy.mockImplementation((filters, _hidden, storeFilters) =>
            storeFilters ? filters : undefined,
        );
    });

    it("stores dashboard filters for a widget schedule even when storeFilters is false", () => {
        const { result } = renderEffectiveFiltersHook({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            editedAutomationFilters: [fakeFilterContextItem("f1")],
            storeFilters: false,
        });

        expect(result.current.effectiveDashboardFilters).toBeDefined();
    });

    it("does not store dashboard filters for a dashboard schedule when storeFilters is false", () => {
        const { result } = renderEffectiveFiltersHook({
            widget: undefined,
            insight: undefined,
            editedAutomationFilters: [fakeFilterContextItem("f1")],
            storeFilters: false,
        });

        expect(result.current.effectiveDashboardFilters).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// parametersByTabForNewAutomation
// ---------------------------------------------------------------------------

describe("useScheduledEmailEffectiveFilters — parametersByTabForNewAutomation", () => {
    it("calls shouldStoreExportParameters with (isWidget, storeFilters)", () => {
        renderEffectiveFiltersHook({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            storeFilters: false,
        });

        expect(shouldStoreExportParametersSpy).toHaveBeenCalledWith(true, false);
    });

    it("returns exportParametersByTab (from context) when shouldStoreExportParameters is true and it has entries", () => {
        shouldStoreExportParametersSpy.mockReturnValue(true);

        const { result } = renderEffectiveFiltersHook({});

        expect(result.current.parametersByTabForNewAutomation).toBe(SENTINEL_EXPORT_PARAMETERS_BY_TAB);
    });

    it("returns undefined when shouldStoreExportParameters is false, even if exportParametersByTab has entries", () => {
        shouldStoreExportParametersSpy.mockReturnValue(false);

        const { result } = renderEffectiveFiltersHook({});

        expect(result.current.parametersByTabForNewAutomation).toBeUndefined();
    });

    it("returns undefined when exportParametersByTab is empty, even if shouldStoreExportParameters is true", () => {
        shouldStoreExportParametersSpy.mockReturnValue(true);
        mockUseScheduledEmailDialogContext.mockReturnValue({
            ...DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE,
            exportParametersByTab: {},
        });

        const { result } = renderEffectiveFiltersHook({});

        expect(result.current.parametersByTabForNewAutomation).toBeUndefined();
    });
});
