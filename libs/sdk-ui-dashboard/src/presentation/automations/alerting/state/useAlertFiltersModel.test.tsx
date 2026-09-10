// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type FilterContextItem, type IInsight, type IWidget } from "@gooddata/sdk-model";

import { type useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: vi.fn<typeof useValidateExistingAutomationFilters>(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import * as validateExistingAutomationFiltersModule from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";

import { useAlertFiltersModel, type IUseAlertFiltersModelProps } from "./useAlertFiltersModel.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const useValidateExistingAutomationFiltersSpy = vi.mocked(
    validateExistingAutomationFiltersModule.useValidateExistingAutomationFilters,
);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockSetEditedAutomationFilters = vi.fn();
const mockApplyFiltersToDraft = vi.fn();

// Minimal-but-valid IDashboardAttributeFilter — only localIdentifier varies between fixtures,
// the rest is filled with throwaway-but-type-correct values so no cast is needed.
function makeAttributeFilter(localIdentifier: string): FilterContextItem {
    return {
        attributeFilter: {
            displayForm: { identifier: "df1" },
            negativeSelection: false,
            attributeElements: { values: [] },
            localIdentifier,
        },
    };
}

const SENTINEL_FILTERS: FilterContextItem[] = [makeAttributeFilter("f1")];
const SENTINEL_FILTERS_FOR_NEW_AUTOMATION: FilterContextItem[] = [
    makeAttributeFilter("new-automation-filter"),
];
const SENTINEL_AVAILABLE_FILTERS: FilterContextItem[] = [makeAttributeFilter("available1")];

// IWidget/IInsight are large identity-bearing unions (ref/uri/id plus kind-specific required
// fields) whose shape is irrelevant here — only forwarded by reference to the mocked validation
// hook. Building fully valid instances would be pure boilerplate, so we keep the cast.
const SENTINEL_WIDGET: IWidget = {
    identifier: "widget1",
} as unknown as IWidget;
const SENTINEL_INSIGHT: IInsight = {
    insight: { identifier: "insight1" },
} as unknown as IInsight;

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

const BASE_PROPS: IUseAlertFiltersModelProps = {
    editedAutomationFilters: SENTINEL_FILTERS,
    setEditedAutomationFilters: mockSetEditedAutomationFilters,
    availableFilters: SENTINEL_AVAILABLE_FILTERS,
    filtersForNewAutomation: SENTINEL_FILTERS_FOR_NEW_AUTOMATION,
    widget: SENTINEL_WIDGET,
    insight: SENTINEL_INSIGHT,
    applyFiltersToDraft: mockApplyFiltersToDraft,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    useValidateExistingAutomationFiltersSpy.mockReturnValue(SENTINEL_VALIDATION_RESULT);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderFiltersHook(props: Partial<IUseAlertFiltersModelProps> = {}) {
    const mergedProps: IUseAlertFiltersModelProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useAlertFiltersModel(mergedProps));
}

// ---------------------------------------------------------------------------
// Case 1: onFiltersChange wiring
// ---------------------------------------------------------------------------

describe("useAlertFiltersModel — onFiltersChange wiring", () => {
    it("calls setEditedAutomationFilters(filters) then applyFiltersToDraft(filters), in order", () => {
        const { result } = renderFiltersHook();

        result.current.onFiltersChange(SENTINEL_FILTERS);

        expect(mockSetEditedAutomationFilters).toHaveBeenCalledWith(SENTINEL_FILTERS);
        expect(mockApplyFiltersToDraft).toHaveBeenCalledWith(SENTINEL_FILTERS);

        const setEditedAutomationFiltersOrder = mockSetEditedAutomationFilters.mock.invocationCallOrder[0];
        const applyFiltersToDraftOrder = mockApplyFiltersToDraft.mock.invocationCallOrder[0];
        expect(setEditedAutomationFiltersOrder).toBeLessThan(applyFiltersToDraftOrder);
    });
});

// ---------------------------------------------------------------------------
// Case 2: onApplyCurrentFilters
// ---------------------------------------------------------------------------

describe("useAlertFiltersModel — onApplyCurrentFilters", () => {
    it("calls onFiltersChange with filtersForNewAutomation", () => {
        const { result } = renderFiltersHook({
            filtersForNewAutomation: SENTINEL_FILTERS_FOR_NEW_AUTOMATION,
        });

        result.current.onApplyCurrentFilters();

        expect(mockSetEditedAutomationFilters).toHaveBeenCalledWith(SENTINEL_FILTERS_FOR_NEW_AUTOMATION);
        expect(mockApplyFiltersToDraft).toHaveBeenCalledWith(SENTINEL_FILTERS_FOR_NEW_AUTOMATION);
    });
});

// ---------------------------------------------------------------------------
// Case 3: model shape
// ---------------------------------------------------------------------------

describe("useAlertFiltersModel — model shape", () => {
    it("exposes one filter model and leaks no other representation", () => {
        const { result } = renderHook(() => useAlertFiltersModel(BASE_PROPS));

        expect(Object.keys(result.current).sort()).toEqual([
            "automationIsValid",
            "availableFilters",
            "filtersAreStale",
            "onApplyCurrentFilters",
            "onFiltersChange",
            "selectedFilters",
        ]);
    });
});
