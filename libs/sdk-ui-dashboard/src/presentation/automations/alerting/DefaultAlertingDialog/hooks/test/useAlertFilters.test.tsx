// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationVisibleFilter,
    type IInsight,
    type IWidget,
    newAttribute,
    newMeasure,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric } from "../../../types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("../../../../shared/automationFilters/utils.js", () => ({
    getAppliedWidgetFilters: vi.fn(),
    getVisibleFiltersByFilters: vi.fn(),
}));

vi.mock("../../utils/transformation.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
        ...actual,
        transformAlertByAttribute: vi.fn(),
        transformAlertByMetric: vi.fn(),
    };
});

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import * as utilsModule from "../../../../shared/automationFilters/utils.js";
import * as transformationModule from "../../utils/transformation.js";
import { useAlertFilters, type IUseAlertFiltersProps } from "../useAlertFilters.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const getAppliedWidgetFiltersSpy = vi.mocked(utilsModule.getAppliedWidgetFilters);
const getVisibleFiltersByFiltersSpy = vi.mocked(utilsModule.getVisibleFiltersByFilters);
const transformAlertByAttributeSpy = vi.mocked(transformationModule.transformAlertByAttribute);
const transformAlertByMetricSpy = vi.mocked(transformationModule.transformAlertByMetric);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockSetEditedAutomation = vi.fn();
const mockSetEditedAutomationFilters = vi.fn();

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
const SENTINEL_HIDDEN_FILTERS: FilterContextItem[] = [makeAttributeFilter("hidden1")];
const SENTINEL_VISIBLE_FILTERS: IAutomationVisibleFilter[] = [{ localIdentifier: "vf1" }];

// IWidget/IInsight are large identity-bearing unions (ref/uri/id plus kind-specific required
// fields) whose shape is irrelevant here — getAppliedWidgetFilters/getVisibleFiltersByFilters
// are mocked and the test only asserts these were forwarded by reference. Building fully valid
// instances would be pure boilerplate, so we keep the assertion.
const SENTINEL_WIDGET: IWidget = {
    identifier: "widget1",
} as unknown as IWidget;
const SENTINEL_INSIGHT: IInsight = {
    insight: { identifier: "insight1" },
} as unknown as IInsight;
const SENTINEL_COMMON_DATE_FILTER_ID = "common-date-filter-id";
const SENTINEL_SUPPORTED_MEASURES: AlertMetric[] = [
    {
        measure: newMeasure("m1", (m) => m.localId("m1")),
        isPrimary: true,
        comparators: [],
    },
];
const SENTINEL_SUPPORTED_ATTRIBUTES: AlertAttribute[] = [
    {
        attribute: newAttribute("a1", (a) => a.localId("a1")),
        type: "attribute",
    },
];
const SENTINEL_MEASURE_FORMAT_MAP = { m1: "#,##0" };
const SENTINEL_MEASURE: AlertMetric = {
    measure: newMeasure("m1", (m) => m.localId("m1")),
    isPrimary: true,
    comparators: [],
};
const SENTINEL_ATTRIBUTE: AlertAttribute = {
    attribute: newAttribute("a1", (a) => a.localId("a1")),
    type: "attribute",
};
const SENTINEL_WEEK_START = "Monday" as const;
const SENTINEL_TIMEZONE = "Europe/Prague";

const SENTINEL_APPLIED_FILTERS = [newPositiveAttributeFilter("df1", ["applied-marker"])];
const SENTINEL_VISIBLE_FILTERS_RESULT: IAutomationVisibleFilter[] = [{ localIdentifier: "visible-marker" }];

// IAutomationMetadataObject additionally requires ref/id/uri/description/production/deprecated/unlisted;
// these are only ever compared by reference (toBe) as the mocked transform's return value, so a fully
// valid instance would add fields no assertion reads.
const SENTINEL_ATTRIBUTE_TRANSFORM_RESULT = {
    type: "automation",
    title: "attribute-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_METRIC_TRANSFORM_RESULT = {
    type: "automation",
    title: "metric-transformed",
} as unknown as IAutomationMetadataObject;

const BASE_PROPS: IUseAlertFiltersProps = {
    setEditedAutomation: mockSetEditedAutomation,
    setEditedAutomationFilters: mockSetEditedAutomationFilters,
    filtersForNewAutomation: SENTINEL_FILTERS_FOR_NEW_AUTOMATION,
    availableFiltersAsVisibleFilters: SENTINEL_VISIBLE_FILTERS,
    dashboardHiddenFilters: SENTINEL_HIDDEN_FILTERS,
    commonDateFilterId: SENTINEL_COMMON_DATE_FILTER_ID,
    widget: SENTINEL_WIDGET,
    insight: SENTINEL_INSIGHT,
    supportedMeasures: SENTINEL_SUPPORTED_MEASURES,
    supportedAttributes: SENTINEL_SUPPORTED_ATTRIBUTES,
    measureFormatMap: SENTINEL_MEASURE_FORMAT_MAP,
    selectedMeasure: SENTINEL_MEASURE,
    selectedAttribute: SENTINEL_ATTRIBUTE,
    selectedValue: "attr-value",
    weekStart: SENTINEL_WEEK_START,
    timezone: SENTINEL_TIMEZONE,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    getAppliedWidgetFiltersSpy.mockReturnValue(SENTINEL_APPLIED_FILTERS);
    getVisibleFiltersByFiltersSpy.mockReturnValue(SENTINEL_VISIBLE_FILTERS_RESULT);
    transformAlertByAttributeSpy.mockReturnValue(SENTINEL_ATTRIBUTE_TRANSFORM_RESULT);
    transformAlertByMetricSpy.mockReturnValue(SENTINEL_METRIC_TRANSFORM_RESULT);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderFiltersHook(props: Partial<IUseAlertFiltersProps> = {}) {
    const mergedProps: IUseAlertFiltersProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useAlertFilters(mergedProps));
}

function makeState(
    overrides: Partial<IAutomationMetadataObjectDefinition> = {},
): IAutomationMetadataObjectDefinition {
    return {
        type: "automation",
        title: "Test Alert",
        // `alert.condition`/`alert.trigger` are required by IAutomationAlert but unread by the hook
        // (only `execution.filters` is spread) and unrelated to what these tests exercise, so the cast
        // stays rather than hand-authoring a meaningless comparison condition and trigger state.
        alert: {
            execution: { filters: [] },
        },
        metadata: {},
        ...overrides,
    } as unknown as IAutomationMetadataObjectDefinition;
}

// ---------------------------------------------------------------------------
// Case 1: onFiltersChange wiring
// ---------------------------------------------------------------------------

describe("useAlertFilters — onFiltersChange wiring", () => {
    it("calls setEditedAutomationFilters(filters) and setEditedAutomation with an updater", () => {
        const { result } = renderFiltersHook();

        result.current.onFiltersChange(SENTINEL_FILTERS);

        expect(mockSetEditedAutomationFilters).toHaveBeenCalledWith(SENTINEL_FILTERS);
        expect(mockSetEditedAutomation).toHaveBeenCalledOnce();
        const updater = mockSetEditedAutomation.mock.calls[0][0];
        expect(typeof updater).toBe("function");
    });

    it("invokes the 4 reconciliation helpers with the exact expected args and merges the shape", () => {
        const { result } = renderFiltersHook();

        result.current.onFiltersChange(SENTINEL_FILTERS);

        const updater = mockSetEditedAutomation.mock.calls[0][0];
        const state = makeState({ metadata: {} });

        const returnValue = updater(state);

        expect(getAppliedWidgetFiltersSpy).toHaveBeenCalledWith(
            SENTINEL_FILTERS,
            SENTINEL_HIDDEN_FILTERS,
            SENTINEL_WIDGET,
            SENTINEL_INSIGHT,
            SENTINEL_COMMON_DATE_FILTER_ID,
            true,
            !state.metadata?.widget,
        );
        expect(getVisibleFiltersByFiltersSpy).toHaveBeenCalledWith(
            SENTINEL_FILTERS,
            SENTINEL_VISIBLE_FILTERS,
            true,
        );

        const mergedArg = transformAlertByAttributeSpy.mock.calls[0][1];
        expect(mergedArg).toMatchObject({
            alert: {
                execution: {
                    filters: SENTINEL_APPLIED_FILTERS,
                },
            },
            metadata: {
                visibleFilters: SENTINEL_VISIBLE_FILTERS_RESULT,
            },
        });

        expect(transformAlertByAttributeSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_ATTRIBUTES,
            mergedArg,
            SENTINEL_ATTRIBUTE,
            { name: "attr-value", title: "", value: "" },
        );

        // selectedMeasure is truthy in BASE_PROPS → metric transform applies and its result is returned
        expect(transformAlertByMetricSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            SENTINEL_ATTRIBUTE_TRANSFORM_RESULT,
            SENTINEL_MEASURE,
            SENTINEL_MEASURE_FORMAT_MAP,
            SENTINEL_WEEK_START,
            SENTINEL_TIMEZONE,
        );
        expect(returnValue).toBe(SENTINEL_METRIC_TRANSFORM_RESULT);
    });
});

// ---------------------------------------------------------------------------
// Case 2: selectedMeasure branch
// ---------------------------------------------------------------------------

describe("useAlertFilters — selectedMeasure branch", () => {
    it("returns transformAlertByMetric's result when selectedMeasure is truthy", () => {
        const { result } = renderFiltersHook({
            selectedMeasure: SENTINEL_MEASURE,
        });

        result.current.onFiltersChange(SENTINEL_FILTERS);
        const updater = mockSetEditedAutomation.mock.calls[0][0];

        const returnValue = updater(makeState());

        expect(transformAlertByMetricSpy).toHaveBeenCalledOnce();
        expect(returnValue).toBe(SENTINEL_METRIC_TRANSFORM_RESULT);
    });

    it("returns the transformAlertByAttribute output unchanged when selectedMeasure is undefined, no metric call", () => {
        const { result } = renderFiltersHook({ selectedMeasure: undefined });

        result.current.onFiltersChange(SENTINEL_FILTERS);
        const updater = mockSetEditedAutomation.mock.calls[0][0];

        const returnValue = updater(makeState());

        expect(transformAlertByMetricSpy).not.toHaveBeenCalled();
        expect(returnValue).toBe(SENTINEL_ATTRIBUTE_TRANSFORM_RESULT);
    });
});

// ---------------------------------------------------------------------------
// Case 3: `!s.metadata?.widget` flag
// ---------------------------------------------------------------------------

describe("useAlertFilters — !s.metadata?.widget flag", () => {
    it("passes true as the 7th getAppliedWidgetFilters arg when state has no metadata.widget", () => {
        const { result } = renderFiltersHook();

        result.current.onFiltersChange(SENTINEL_FILTERS);
        const updater = mockSetEditedAutomation.mock.calls[0][0];

        updater(makeState({ metadata: {} }));

        expect(getAppliedWidgetFiltersSpy).toHaveBeenCalledWith(
            SENTINEL_FILTERS,
            SENTINEL_HIDDEN_FILTERS,
            SENTINEL_WIDGET,
            SENTINEL_INSIGHT,
            SENTINEL_COMMON_DATE_FILTER_ID,
            true,
            true,
        );
    });

    it("passes false as the 7th getAppliedWidgetFilters arg when state has metadata.widget", () => {
        const { result } = renderFiltersHook();

        result.current.onFiltersChange(SENTINEL_FILTERS);
        const updater = mockSetEditedAutomation.mock.calls[0][0];

        updater(makeState({ metadata: { widget: "widget-local-id" } }));

        expect(getAppliedWidgetFiltersSpy).toHaveBeenCalledWith(
            SENTINEL_FILTERS,
            SENTINEL_HIDDEN_FILTERS,
            SENTINEL_WIDGET,
            SENTINEL_INSIGHT,
            SENTINEL_COMMON_DATE_FILTER_ID,
            true,
            false,
        );
    });
});

// ---------------------------------------------------------------------------
// Case 4: undefined state
// ---------------------------------------------------------------------------

describe("useAlertFilters — undefined state", () => {
    it("returns undefined without throwing when the updater is applied to undefined, setEditedAutomationFilters still called", () => {
        const { result } = renderFiltersHook();

        result.current.onFiltersChange(SENTINEL_FILTERS);

        expect(mockSetEditedAutomationFilters).toHaveBeenCalledWith(SENTINEL_FILTERS);

        const updater = mockSetEditedAutomation.mock.calls[0][0];

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
        expect(getAppliedWidgetFiltersSpy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Case 5: selectedValue nullish
// ---------------------------------------------------------------------------

describe("useAlertFilters — selectedValue nullish", () => {
    it("passes name: '' to transformAlertByAttribute when selectedValue is undefined", () => {
        const { result } = renderFiltersHook({ selectedValue: undefined });

        result.current.onFiltersChange(SENTINEL_FILTERS);
        const updater = mockSetEditedAutomation.mock.calls[0][0];
        updater(makeState());

        expect(transformAlertByAttributeSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_ATTRIBUTES,
            expect.anything(),
            SENTINEL_ATTRIBUTE,
            { name: "", title: "", value: "" },
        );
    });

    it("passes name: '' to transformAlertByAttribute when selectedValue is null", () => {
        const { result } = renderFiltersHook({ selectedValue: null });

        result.current.onFiltersChange(SENTINEL_FILTERS);
        const updater = mockSetEditedAutomation.mock.calls[0][0];
        updater(makeState());

        expect(transformAlertByAttributeSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_ATTRIBUTES,
            expect.anything(),
            SENTINEL_ATTRIBUTE,
            { name: "", title: "", value: "" },
        );
    });
});

// ---------------------------------------------------------------------------
// Case 6: onApplyCurrentFilters
// ---------------------------------------------------------------------------

describe("useAlertFilters — onApplyCurrentFilters", () => {
    it("calls onFiltersChange with filtersForNewAutomation", () => {
        const { result } = renderFiltersHook({
            filtersForNewAutomation: SENTINEL_FILTERS_FOR_NEW_AUTOMATION,
        });

        result.current.onApplyCurrentFilters();

        expect(mockSetEditedAutomationFilters).toHaveBeenCalledWith(SENTINEL_FILTERS_FOR_NEW_AUTOMATION);
    });
});
