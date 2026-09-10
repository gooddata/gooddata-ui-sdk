// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type FilterContextItem, type IInsight, type IWidget, idRef } from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";
import { type useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()). We use
// vi.fn() inline and retrieve spies via vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseScheduledEmailDialogContext } = vi.hoisted(() => ({
    mockUseScheduledEmailDialogContext: vi.fn(),
}));

vi.mock("../../contexts/ScheduledEmailDialogContext.js", () => ({
    useScheduledEmailDialogContext: mockUseScheduledEmailDialogContext,
}));

vi.mock("../../shared/automationFilters/useAutomationFiltersSelect.js", () => ({
    getDefaultSelectedFiltersFromFiltersByTab: vi.fn(),
}));

// `useValidateExistingAutomationFilters` and `useAutomationExportParameters` are the two
// store-backed hooks `useScheduledEmailFiltersModel` now calls directly. Both reach into the dashboard
// Redux store via `useDashboardSelector`, which has no provider in this unit test, so they are
// mocked the same way alerting's `useAlertFiltersModel.test.tsx` mocks the first of the two.
vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: vi.fn<typeof useValidateExistingAutomationFilters>(),
}));

vi.mock("../../shared/automationFilters/useAutomationExportParameters.js", () => ({
    useAutomationExportParameters: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import * as validateExistingAutomationFiltersModule from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import * as automationExportParametersModule from "../../shared/automationFilters/useAutomationExportParameters.js";
import { getDefaultSelectedFiltersFromFiltersByTab } from "../../shared/automationFilters/useAutomationFiltersSelect.js";

import {
    type IUseScheduledEmailFiltersModelProps,
    useScheduledEmailFiltersModel,
} from "./useScheduledEmailFiltersModel.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const getDefaultSelectedFiltersFromFiltersByTabSpy = vi.mocked(getDefaultSelectedFiltersFromFiltersByTab);
const useValidateExistingAutomationFiltersSpy = vi.mocked(
    validateExistingAutomationFiltersModule.useValidateExistingAutomationFilters,
);
const useAutomationExportParametersSpy = vi.mocked(
    automationExportParametersModule.useAutomationExportParameters,
);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const widget: IWidget = {
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

const insight: IInsight = {
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

const DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE = {
    exportParametersByTab: {},
};

const SENTINEL_FILTERS: FilterContextItem[] = [fakeFilterContextItem("f1")];

const SENTINEL_VALIDATION_RESULT = {
    isValid: true,
    hiddenFilterIsMissingInSavedFilters: false,
    hiddenFilterHasDifferentValueInSavedFilter: false,
    lockedFilterIsMissingInSavedFilters: false,
    lockedFilterHasDifferentValueInSavedFilter: false,
    ignoredFilterIsAppliedInSavedFilters: false,
    removedFilterIsAppliedInSavedFilters: false,
    commonDateFilterIsMissingInSavedVisibleFilters: false,
    visibleFilterIsMissingInSavedFilters: false,
    visibleFiltersAreMissing: false,
    incompatibleSelectionTypeIsAppliedInSavedFilters: false,
    filtersAreStale: false,
};

const SENTINEL_PARAMETERS_RESULT = {
    parametersEnabled: false,
    visibleParametersByTab: {},
    availableParametersByTab: {},
    flatTabId: undefined,
    onParameterAdd: vi.fn(),
    onParameterChange: vi.fn(),
    onParameterDelete: vi.fn(),
    onParameterAddByTab: vi.fn(),
    onParameterChangeByTab: vi.fn(),
    onParameterDeleteByTab: vi.fn(),
    applyLatest: vi.fn(),
    onStoreParametersChange: vi.fn(),
};

const mockApplyFiltersToDraft = vi.fn();
const mockApplyFiltersByTabToDraft = vi.fn();

const BASE_PROPS: IUseScheduledEmailFiltersModelProps = {
    scheduledExportToEdit: undefined,
    widget: undefined,
    insight: undefined,
    editedAutomationFilters: [],
    setEditedAutomationFilters: vi.fn(),
    setEditedAutomationFiltersByTab: vi.fn(),
    availableFilters: undefined,
    filtersByTab: undefined,
    storeFilters: true,
    setStoreFilters: vi.fn(),
    filtersForNewAutomation: [],
    setParametersWire: vi.fn(),
    applyFiltersToDraft: mockApplyFiltersToDraft,
    applyFiltersByTabToDraft: mockApplyFiltersByTabToDraft,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();

    mockUseScheduledEmailDialogContext.mockReturnValue(DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE);

    getDefaultSelectedFiltersFromFiltersByTabSpy.mockReturnValue(undefined);
    useValidateExistingAutomationFiltersSpy.mockReturnValue(SENTINEL_VALIDATION_RESULT);
    useAutomationExportParametersSpy.mockReturnValue(SENTINEL_PARAMETERS_RESULT);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderFiltersHook(overrides: Partial<IUseScheduledEmailFiltersModelProps> = {}) {
    const setEditedAutomationFilters = vi.fn<(filters: FilterContextItem[]) => void>();
    const setEditedAutomationFiltersByTab = vi.fn<(filters: Record<string, FilterContextItem[]>) => void>();
    const setStoreFilters = vi.fn<(storeFilters: boolean) => void>();

    const props: IUseScheduledEmailFiltersModelProps = {
        ...BASE_PROPS,
        setEditedAutomationFilters,
        setEditedAutomationFiltersByTab,
        setStoreFilters,
        ...overrides,
    };
    const { result, rerender } = renderHook(
        (p: IUseScheduledEmailFiltersModelProps) => useScheduledEmailFiltersModel(p),
        {
            initialProps: props,
        },
    );
    return {
        result,
        rerender,
        setEditedAutomationFilters,
        setEditedAutomationFiltersByTab,
        setStoreFilters,
        props,
    };
}

// ---------------------------------------------------------------------------
// Case 1: onFiltersChange wiring
// ---------------------------------------------------------------------------

describe("useScheduledEmailFiltersModel — onFiltersChange wiring", () => {
    it("calls setEditedAutomationFilters(filters) then applyFiltersToDraft(filters, storeFiltersParam), in order", () => {
        const { result, setEditedAutomationFilters } = renderFiltersHook();

        result.current.onFiltersChange(SENTINEL_FILTERS, true);

        expect(setEditedAutomationFilters).toHaveBeenCalledWith(SENTINEL_FILTERS);
        expect(mockApplyFiltersToDraft).toHaveBeenCalledWith(SENTINEL_FILTERS, true);

        const setOrder = setEditedAutomationFilters.mock.invocationCallOrder[0];
        const applyOrder = mockApplyFiltersToDraft.mock.invocationCallOrder[0];
        expect(setOrder).toBeLessThan(applyOrder);
    });
});

// ---------------------------------------------------------------------------
// Case 2: onFiltersByTabChange wiring
// ---------------------------------------------------------------------------

describe("useScheduledEmailFiltersModel — onFiltersByTabChange wiring", () => {
    it("calls setEditedAutomationFiltersByTab(newFiltersByTab) then applyFiltersByTabToDraft(newFiltersByTab, storeFiltersParam), in order", () => {
        const { result, setEditedAutomationFiltersByTab } = renderFiltersHook();
        const newFiltersByTab = { tab1: [fakeFilterContextItem("f1")] };

        result.current.onFiltersByTabChange(newFiltersByTab, true);

        expect(setEditedAutomationFiltersByTab).toHaveBeenCalledWith(newFiltersByTab);
        expect(mockApplyFiltersByTabToDraft).toHaveBeenCalledWith(newFiltersByTab, true);

        const setOrder = setEditedAutomationFiltersByTab.mock.invocationCallOrder[0];
        const applyOrder = mockApplyFiltersByTabToDraft.mock.invocationCallOrder[0];
        expect(setOrder).toBeLessThan(applyOrder);
    });
});

// ---------------------------------------------------------------------------
// Case 3: onApplyCurrentFilters routing
// ---------------------------------------------------------------------------

describe("useScheduledEmailFiltersModel — onApplyCurrentFilters routing", () => {
    it("widget present: never routes per-tab; applies the new automation's filters via onFiltersChange", () => {
        const filtersForNewAutomation = [fakeFilterContextItem("new-1")];
        const { result, setEditedAutomationFilters, setEditedAutomationFiltersByTab } = renderFiltersHook({
            widget,
            insight,
            storeFilters: false,
            filtersForNewAutomation,
        });

        result.current.onApplyCurrentFilters();

        expect(getDefaultSelectedFiltersFromFiltersByTabSpy).not.toHaveBeenCalled();
        expect(setEditedAutomationFiltersByTab).not.toHaveBeenCalled();
        expect(mockApplyFiltersByTabToDraft).not.toHaveBeenCalled();
        expect(setEditedAutomationFilters).toHaveBeenCalledWith(filtersForNewAutomation);
        // `widget ? true : storeFilters` hardcodes `true` here regardless of the `storeFilters` prop.
        expect(mockApplyFiltersToDraft).toHaveBeenCalledWith(filtersForNewAutomation, true);
    });

    it("no widget, filtersByTab yields defaults: routes to onFiltersByTabChange", () => {
        const defaults = { tab1: [fakeFilterContextItem("default-1")] };
        getDefaultSelectedFiltersFromFiltersByTabSpy.mockReturnValue(defaults);
        const filtersByTab = [fakeFiltersTab("tab1")];

        const { result, setEditedAutomationFiltersByTab, setEditedAutomationFilters } = renderFiltersHook({
            widget: undefined,
            insight: undefined,
            filtersByTab,
        });

        result.current.onApplyCurrentFilters();

        expect(getDefaultSelectedFiltersFromFiltersByTabSpy).toHaveBeenCalledWith(filtersByTab);
        expect(setEditedAutomationFiltersByTab).toHaveBeenCalledWith(defaults);
        expect(setEditedAutomationFilters).not.toHaveBeenCalled();
    });

    it("no widget, no per-tab defaults: calls onFiltersChange with filtersForNewAutomation and the storeFilters prop", () => {
        const filtersForNewAutomation = [fakeFilterContextItem("new-1")];

        const { result, setEditedAutomationFilters } = renderFiltersHook({
            widget: undefined,
            insight: undefined,
            storeFilters: false,
            filtersForNewAutomation,
        });

        result.current.onApplyCurrentFilters();

        expect(setEditedAutomationFilters).toHaveBeenCalledWith(filtersForNewAutomation);
        expect(mockApplyFiltersToDraft).toHaveBeenCalledWith(filtersForNewAutomation, false);
    });
});

// ---------------------------------------------------------------------------
// Case 4: onStoreFiltersChange fan-out
// ---------------------------------------------------------------------------

describe("useScheduledEmailFiltersModel — onStoreFiltersChange fan-out", () => {
    it("calls setStoreFilters and fires both handlers — filtersByTab first — when both are supplied", () => {
        const { result, setStoreFilters, setEditedAutomationFiltersByTab, setEditedAutomationFilters } =
            renderFiltersHook({});

        const filters = [fakeFilterContextItem("f1")];
        const filtersByTab = { tab1: [fakeFilterContextItem("t1")] };

        result.current.onStoreFiltersChange(true, filters, filtersByTab);

        expect(setStoreFilters).toHaveBeenCalledWith(true);
        expect(setEditedAutomationFiltersByTab).toHaveBeenCalledWith(filtersByTab);
        expect(setEditedAutomationFilters).toHaveBeenCalledWith(filters);

        const byTabOrder = setEditedAutomationFiltersByTab.mock.invocationCallOrder[0];
        const filtersOrder = setEditedAutomationFilters.mock.invocationCallOrder[0];
        expect(byTabOrder).toBeLessThan(filtersOrder);
    });

    it("fires only onFiltersByTabChange when filtersByTab is supplied without filters", () => {
        const { result, setEditedAutomationFiltersByTab, setEditedAutomationFilters } = renderFiltersHook({});
        const filtersByTab = { tab1: [fakeFilterContextItem("t1")] };

        result.current.onStoreFiltersChange(false, undefined, filtersByTab);

        expect(setEditedAutomationFiltersByTab).toHaveBeenCalledWith(filtersByTab);
        expect(setEditedAutomationFilters).not.toHaveBeenCalled();
    });

    it("fires only onFiltersChange when filters is supplied without filtersByTab", () => {
        const { result, setEditedAutomationFiltersByTab, setEditedAutomationFilters } = renderFiltersHook({});
        const filters = [fakeFilterContextItem("f1")];

        result.current.onStoreFiltersChange(true, filters, undefined);

        expect(setEditedAutomationFiltersByTab).not.toHaveBeenCalled();
        expect(setEditedAutomationFilters).toHaveBeenCalledWith(filters);
    });

    // The store-filters toggle gates parameter persistence too, and the hook owns that half itself
    // rather than leaving it to the caller. Both directions are asserted: a handler hardcoding
    // `true` would pass a one-directional test.
    it("fires the parameters half of the gate with the new value, in both directions", () => {
        const { result } = renderFiltersHook({});

        result.current.onStoreFiltersChange(true, [fakeFilterContextItem("f1")], undefined);
        expect(SENTINEL_PARAMETERS_RESULT.onStoreParametersChange).toHaveBeenLastCalledWith(true);

        result.current.onStoreFiltersChange(false, [fakeFilterContextItem("f1")], undefined);
        expect(SENTINEL_PARAMETERS_RESULT.onStoreParametersChange).toHaveBeenLastCalledWith(false);
    });

    it("fires the parameters half even when neither filters nor filtersByTab is supplied", () => {
        const { result, setEditedAutomationFilters, setEditedAutomationFiltersByTab } = renderFiltersHook({});

        result.current.onStoreFiltersChange(true, undefined, undefined);

        expect(setEditedAutomationFilters).not.toHaveBeenCalled();
        expect(setEditedAutomationFiltersByTab).not.toHaveBeenCalled();
        expect(SENTINEL_PARAMETERS_RESULT.onStoreParametersChange).toHaveBeenCalledWith(true);
    });

    it("fires the parameters half after the filters half", () => {
        const { result, setEditedAutomationFilters } = renderFiltersHook({});

        result.current.onStoreFiltersChange(true, [fakeFilterContextItem("f1")], undefined);

        const filtersOrder = setEditedAutomationFilters.mock.invocationCallOrder[0];
        const parametersOrder =
            SENTINEL_PARAMETERS_RESULT.onStoreParametersChange.mock.invocationCallOrder[0];
        expect(filtersOrder).toBeLessThan(parametersOrder);
    });
});

// ---------------------------------------------------------------------------
// Case 5: rerender / stale-closure guard
// ---------------------------------------------------------------------------

describe("useScheduledEmailFiltersModel — rerender / stale-closure guard", () => {
    it("onFiltersChange calls the latest applyFiltersToDraft after a rerender that changes it", () => {
        const { result, rerender, props } = renderFiltersHook({
            widget: undefined,
            insight: undefined,
        });

        const filters = [fakeFilterContextItem("f1")];
        result.current.onFiltersChange(filters);
        expect(mockApplyFiltersToDraft).toHaveBeenCalledWith(filters, undefined);

        const newApplyFiltersToDraft = vi.fn();
        rerender({ ...props, applyFiltersToDraft: newApplyFiltersToDraft });
        result.current.onFiltersChange(filters);

        expect(newApplyFiltersToDraft).toHaveBeenCalledWith(filters, undefined);
        expect(mockApplyFiltersToDraft).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------
// Case 6: model shape
// ---------------------------------------------------------------------------

describe("useScheduledEmailFiltersModel — model shape", () => {
    it("exposes the filter model and leaks no other representation", () => {
        const { result } = renderHook(() => useScheduledEmailFiltersModel(BASE_PROPS));

        const keys = Object.keys(result.current);
        expect(keys).toContain("selectedFilters");
        expect(keys).toContain("availableFilters");
        expect(keys).toContain("automationIsValid");
        expect(keys).toContain("filtersAreStale");
        expect(keys).not.toContain("availableFiltersAsVisibleFilters");
        expect(keys).not.toContain("filtersForNewAutomation");
        expect(keys).not.toContain("availableFiltersAsVisibleFiltersByTab");

        expect(keys.sort()).toEqual(
            [
                "selectedFilters",
                "availableFilters",
                "storeFilters",
                "filtersByTab",
                "editedFiltersByTab",
                "onFiltersChange",
                "onFiltersByTabChange",
                "onApplyCurrentFilters",
                "onStoreFiltersChange",
                "automationIsValid",
                "filtersAreStale",
                "parametersEnabled",
                "visibleParametersByTab",
                "availableParametersByTab",
                "flatTabId",
                "onParameterAdd",
                "onParameterChange",
                "onParameterDelete",
                "onParameterAddByTab",
                "onParameterChangeByTab",
                "onParameterDeleteByTab",
                "applyLatest",
                "onStoreParametersChange",
            ].sort(),
        );
    });
});

// ---------------------------------------------------------------------------
// Object identity — the whole return is the filter context's value, so consumers observe it
// ---------------------------------------------------------------------------

describe("useScheduledEmailFiltersModel — return identity", () => {
    it("returns the same object across a rerender that changes no input", () => {
        const { result, rerender, props } = renderFiltersHook();
        const first = result.current;

        rerender(props);

        expect(result.current).toBe(first);
    });

    it("returns a new object when the selection changes, so the change still propagates", () => {
        const { result, rerender, props } = renderFiltersHook();
        const first = result.current;

        rerender({ ...props, editedAutomationFilters: [fakeFilterContextItem("changed")] });

        expect(result.current).not.toBe(first);
        expect(result.current.selectedFilters).toHaveLength(1);
    });

    it("returns a new object when the store-filters toggle changes", () => {
        const { result, rerender, props } = renderFiltersHook({ storeFilters: false });
        const first = result.current;

        rerender({ ...props, storeFilters: true });

        expect(result.current).not.toBe(first);
        expect(result.current.storeFilters).toBe(true);
    });
});
