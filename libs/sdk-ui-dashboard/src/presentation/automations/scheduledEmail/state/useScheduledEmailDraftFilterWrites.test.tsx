// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction } from "react";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObjectDefinition,
    type IAutomationVisibleFilter,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IFilter,
    type IInsight,
    type IWidget,
    idRef,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";

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

vi.mock("../../shared/filters/index.js", () => ({
    getAppliedDashboardFilters: vi.fn(),
    getAppliedWidgetFilters: vi.fn(),
    getVisibleFiltersByFilters: vi.fn(),
    getVisibleFiltersByFiltersByTab: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../shared/filters/index.js";

import {
    type IUseScheduledEmailDraftFilterWritesProps,
    useScheduledEmailDraftFilterWrites,
} from "./useScheduledEmailDraftFilterWrites.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const getAppliedDashboardFiltersSpy = vi.mocked(getAppliedDashboardFilters);
const getAppliedWidgetFiltersSpy = vi.mocked(getAppliedWidgetFilters);
const getVisibleFiltersByFiltersSpy = vi.mocked(getVisibleFiltersByFilters);
const getVisibleFiltersByFiltersByTabSpy = vi.mocked(getVisibleFiltersByFiltersByTab);

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

// Same shape as `widget`, except it is not an insight widget — used to exercise the
// `isWidget === true` but `!isInsightWidget(widget)` guard in `applyFiltersToDraft`.
const nonInsightWidget: IWidget = {
    type: "richText",
    content: "# hello",
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

type ExportDefinition = NonNullable<IAutomationMetadataObjectDefinition["exportDefinitions"]>[number];

const makeDashboardExportDefinition = (
    format: IExportDefinitionDashboardRequestPayload["format"],
    requestPayloadOverrides: Partial<IExportDefinitionDashboardRequestPayload> = {},
): ExportDefinition => ({
    type: "exportDefinition",
    title: "Dashboard export",
    requestPayload: {
        type: "dashboard",
        fileName: "Dashboard",
        format,
        content: { dashboard: "dashboard-1" },
        ...requestPayloadOverrides,
    },
});

const makeWidgetExportDefinition = (
    format: IExportDefinitionVisualizationObjectRequestPayload["format"],
    requestPayloadOverrides: Partial<IExportDefinitionVisualizationObjectRequestPayload> = {},
): ExportDefinition => ({
    type: "exportDefinition",
    title: "Widget export",
    requestPayload: {
        type: "visualizationObject",
        fileName: "Widget",
        format,
        content: { visualizationObject: "insight-1", widget: "w1", dashboard: "dashboard-1" },
        ...requestPayloadOverrides,
    },
});

const makeAutomation = (
    overrides: Partial<IAutomationMetadataObjectDefinition> = {},
): IAutomationMetadataObjectDefinition => ({
    type: "automation",
    title: "Test Scheduled Email",
    notificationChannel: "channel-1",
    recipients: [],
    exportDefinitions: [],
    ...overrides,
});

// Real type-guard narrowing (no casts) to reach into a request payload's `content`.
function widgetRequestPayloadOf(def: ExportDefinition): IExportDefinitionVisualizationObjectRequestPayload {
    if (!isExportDefinitionVisualizationObjectRequestPayload(def.requestPayload)) {
        throw new Error("expected a visualizationObject request payload");
    }
    return def.requestPayload;
}

function dashboardRequestPayloadOf(def: ExportDefinition): IExportDefinitionDashboardRequestPayload {
    if (!isExportDefinitionDashboardRequestPayload(def.requestPayload)) {
        throw new Error("expected a dashboard request payload");
    }
    return def.requestPayload;
}

// Narrows a React `SetStateAction` to its updater-function form (the only form the hook ever passes).
function extractUpdater(
    action: SetStateAction<IAutomationMetadataObjectDefinition>,
): (s: IAutomationMetadataObjectDefinition) => IAutomationMetadataObjectDefinition {
    if (typeof action !== "function") {
        throw new Error("expected setEditedAutomation to have been called with an updater function");
    }
    return action;
}

const SENTINEL_HIDDEN_FILTERS: FilterContextItem[] = [fakeFilterContextItem("hidden-1")];
const SENTINEL_COMMON_DATE_FILTER_ID = "common-date-filter-1";

const DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE = {
    hiddenFilters: SENTINEL_HIDDEN_FILTERS,
    commonDateFilterId: SENTINEL_COMMON_DATE_FILTER_ID,
    exportParametersByTab: {},
};

const WIDGET_FILTERS_WITH_INSIGHT: IFilter[] = [fakeExecutionFilter("with-insight")];
const WIDGET_FILTERS_WITHOUT_INSIGHT: IFilter[] = [fakeExecutionFilter("without-insight")];
const DASHBOARD_FILTERS_STORE_TRUE: FilterContextItem[] = [fakeFilterContextItem("dashboard-true")];
const DASHBOARD_FILTERS_STORE_FALSE: FilterContextItem[] = [fakeFilterContextItem("dashboard-false")];
const SENTINEL_VISIBLE_FILTERS: IAutomationVisibleFilter[] = [{ localIdentifier: "visible-1" }];
const SENTINEL_VISIBLE_FILTERS_BY_TAB: Record<string, IAutomationVisibleFilter[]> = {
    tab1: [{ localIdentifier: "visible-1" }],
};

const BASE_PROPS: IUseScheduledEmailDraftFilterWritesProps = {
    setEditedAutomation: vi.fn(),
    widget: undefined,
    insight: undefined,
    storeFilters: true,
    availableFiltersAsVisibleFilters: undefined,
    availableFiltersAsVisibleFiltersByTab: undefined,
    filtersByTab: undefined,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();

    mockUseScheduledEmailDialogContext.mockReturnValue(DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE);

    getAppliedWidgetFiltersSpy.mockImplementation(
        (_filters, _hidden, _widget, _insight, _commonDateFilterId, mergeInsightFilters) =>
            mergeInsightFilters ? WIDGET_FILTERS_WITH_INSIGHT : WIDGET_FILTERS_WITHOUT_INSIGHT,
    );
    getAppliedDashboardFiltersSpy.mockImplementation((_filters, _hidden, storeFiltersFlag) =>
        storeFiltersFlag ? DASHBOARD_FILTERS_STORE_TRUE : DASHBOARD_FILTERS_STORE_FALSE,
    );
    getVisibleFiltersByFiltersSpy.mockReturnValue(SENTINEL_VISIBLE_FILTERS);
    getVisibleFiltersByFiltersByTabSpy.mockReturnValue(SENTINEL_VISIBLE_FILTERS_BY_TAB);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderDraftFilterWritesHook(overrides: Partial<IUseScheduledEmailDraftFilterWritesProps> = {}) {
    const setEditedAutomation = vi.fn<Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>>();

    const props: IUseScheduledEmailDraftFilterWritesProps = {
        ...BASE_PROPS,
        setEditedAutomation,
        ...overrides,
    };
    const { result, rerender } = renderHook(
        (p: IUseScheduledEmailDraftFilterWritesProps) => useScheduledEmailDraftFilterWrites(p),
        {
            initialProps: props,
        },
    );
    return { result, rerender, setEditedAutomation, props };
}

// ---------------------------------------------------------------------------
// Case 1: applyFiltersToDraft — widget guard
// ---------------------------------------------------------------------------

describe("useScheduledEmailDraftFilterWrites — applyFiltersToDraft widget guard", () => {
    it("returns early without calling setEditedAutomation when isWidget is true but widget is not an insight widget", () => {
        const { result, setEditedAutomation } = renderDraftFilterWritesHook({
            widget: nonInsightWidget,
            insight,
        });

        const filters = [fakeFilterContextItem("f1")];
        result.current.applyFiltersToDraft(filters);

        expect(setEditedAutomation).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Case 2: applyFiltersToDraft — widget branch format routing
// ---------------------------------------------------------------------------

describe("useScheduledEmailDraftFilterWrites — applyFiltersToDraft widget branch format routing", () => {
    it("routes CSV to widget filters with insight, CSV_RAW to widget filters without insight, and any other format to applied dashboard filters", () => {
        const { result, setEditedAutomation } = renderDraftFilterWritesHook({ widget, insight });

        const csvDef = makeWidgetExportDefinition("CSV");
        const csvRawDef = makeWidgetExportDefinition("CSV_RAW");
        const xlsxDef = makeWidgetExportDefinition("XLSX");
        const stateBefore = makeAutomation({ exportDefinitions: [csvDef, csvRawDef, xlsxDef] });

        result.current.applyFiltersToDraft([fakeFilterContextItem("f1")]);

        expect(setEditedAutomation).toHaveBeenCalledTimes(1);
        const updater = extractUpdater(setEditedAutomation.mock.calls[0][0]);
        const returned = updater(stateBefore);

        expect(widgetRequestPayloadOf(returned.exportDefinitions![0]).content.filters).toBe(
            WIDGET_FILTERS_WITH_INSIGHT,
        );
        expect(widgetRequestPayloadOf(returned.exportDefinitions![1]).content.filters).toBe(
            WIDGET_FILTERS_WITHOUT_INSIGHT,
        );
        expect(widgetRequestPayloadOf(returned.exportDefinitions![2]).content.filters).toBe(
            DASHBOARD_FILTERS_STORE_TRUE,
        );
        expect(returned.metadata?.visibleFilters).toBe(SENTINEL_VISIBLE_FILTERS);
    });
});

// ---------------------------------------------------------------------------
// Case 3: applyFiltersToDraft — non-matching payload shapes pass through untouched
// ---------------------------------------------------------------------------

describe("useScheduledEmailDraftFilterWrites — applyFiltersToDraft passthrough for non-matching payload shapes", () => {
    it("widget branch: leaves a non-visualizationObject export definition untouched", () => {
        const { result, setEditedAutomation } = renderDraftFilterWritesHook({ widget, insight });
        const dashboardDef = makeDashboardExportDefinition("PDF");
        const stateBefore = makeAutomation({ exportDefinitions: [dashboardDef] });

        result.current.applyFiltersToDraft([fakeFilterContextItem("f1")]);

        const updater = extractUpdater(setEditedAutomation.mock.calls[0][0]);
        const returned = updater(stateBefore);

        expect(returned.exportDefinitions?.[0]).toBe(dashboardDef);
    });

    it("dashboard branch: leaves a non-dashboard export definition untouched", () => {
        const { result, setEditedAutomation } = renderDraftFilterWritesHook({
            widget: undefined,
            insight: undefined,
        });
        const widgetDef = makeWidgetExportDefinition("CSV");
        const stateBefore = makeAutomation({ exportDefinitions: [widgetDef] });

        result.current.applyFiltersToDraft([fakeFilterContextItem("f1")]);

        const updater = extractUpdater(setEditedAutomation.mock.calls[0][0]);
        const returned = updater(stateBefore);

        expect(returned.exportDefinitions?.[0]).toBe(widgetDef);
    });
});

// ---------------------------------------------------------------------------
// Case 4: applyFiltersToDraft — storeFiltersParam override (dashboard branch)
// ---------------------------------------------------------------------------

describe("useScheduledEmailDraftFilterWrites — applyFiltersToDraft storeFiltersParam override (dashboard branch)", () => {
    it("an explicit false overrides a truthy storeFilters prop", () => {
        const { result, setEditedAutomation } = renderDraftFilterWritesHook({
            widget: undefined,
            insight: undefined,
            storeFilters: true,
        });
        const dashboardDef = makeDashboardExportDefinition("PDF");
        const stateBefore = makeAutomation({ exportDefinitions: [dashboardDef] });
        const filters = [fakeFilterContextItem("f1")];

        result.current.applyFiltersToDraft(filters, false);

        // The computation happens inside the updater function handed to setEditedAutomation — it must
        // be invoked (as React would) before the derivation spies observe a call.
        const updater = extractUpdater(setEditedAutomation.mock.calls[0][0]);
        const returned = updater(stateBefore);

        expect(getAppliedDashboardFiltersSpy).toHaveBeenCalledWith(filters, SENTINEL_HIDDEN_FILTERS, false);
        expect(getVisibleFiltersByFiltersSpy).toHaveBeenCalledWith(filters, undefined, false);
        expect(dashboardRequestPayloadOf(returned.exportDefinitions![0]).content.filters).toBe(
            DASHBOARD_FILTERS_STORE_FALSE,
        );
    });
});

// ---------------------------------------------------------------------------
// Case 5: applyFiltersByTabToDraft
// ---------------------------------------------------------------------------

describe("useScheduledEmailDraftFilterWrites — applyFiltersByTabToDraft", () => {
    it("shouldStoreFilters=false sets filtersByTab to undefined and computes visibleFiltersByTab with false", () => {
        const { result, setEditedAutomation } = renderDraftFilterWritesHook({ storeFilters: true });
        const dashboardDef = makeDashboardExportDefinition("PDF");
        const stateBefore = makeAutomation({ exportDefinitions: [dashboardDef] });
        const newFiltersByTab = { tab1: [fakeFilterContextItem("f1")] };

        result.current.applyFiltersByTabToDraft(newFiltersByTab, false);

        expect(getVisibleFiltersByFiltersByTabSpy).toHaveBeenCalledWith(newFiltersByTab, undefined, false);

        const updater = extractUpdater(setEditedAutomation.mock.calls[0][0]);
        const returned = updater(stateBefore);

        expect(
            dashboardRequestPayloadOf(returned.exportDefinitions![0]).content.filtersByTab,
        ).toBeUndefined();
        expect(returned.metadata?.visibleFiltersByTab).toBe(SENTINEL_VISIBLE_FILTERS_BY_TAB);
    });

    it("shouldStoreFilters=true applies per-tab hiddenFilters from filtersByTab and sets metadata.visibleFiltersByTab", () => {
        const tab1HiddenFilters = [fakeFilterContextItem("tab1-hidden")];
        const filtersByTab = [fakeFiltersTab("tab1", tab1HiddenFilters)];
        const { result, setEditedAutomation } = renderDraftFilterWritesHook({ filtersByTab });

        const tab1Filters = [fakeFilterContextItem("tab1-f1")];
        const newFiltersByTab = { tab1: tab1Filters };

        result.current.applyFiltersByTabToDraft(newFiltersByTab, true);

        expect(getAppliedDashboardFiltersSpy).toHaveBeenCalledWith(tab1Filters, tab1HiddenFilters, true);

        const dashboardDef = makeDashboardExportDefinition("PDF");
        const stateBefore = makeAutomation({ exportDefinitions: [dashboardDef] });
        const updater = extractUpdater(setEditedAutomation.mock.calls[0][0]);
        const returned = updater(stateBefore);

        expect(dashboardRequestPayloadOf(returned.exportDefinitions![0]).content.filtersByTab).toEqual({
            tab1: DASHBOARD_FILTERS_STORE_TRUE,
        });
    });

    it("resolves tabHiddenFilters to [] when the tab is missing from filtersByTab", () => {
        const { result } = renderDraftFilterWritesHook({ filtersByTab: [fakeFiltersTab("other-tab")] });
        const tab1Filters = [fakeFilterContextItem("tab1-f1")];

        result.current.applyFiltersByTabToDraft({ tab1: tab1Filters }, true);

        expect(getAppliedDashboardFiltersSpy).toHaveBeenCalledWith(tab1Filters, [], true);
    });
});

// ---------------------------------------------------------------------------
// Case 6: rerender / stale-closure guard
// ---------------------------------------------------------------------------

// Both callbacks default `shouldStoreFilters` from the `storeFilters` prop when no
// `storeFiltersParam` is passed — a `useCallback` dep array missing `storeFilters` would silently
// keep using the value from first render.
describe("useScheduledEmailDraftFilterWrites — rerender / stale-closure guard", () => {
    it("applyFiltersToDraft picks up a changed storeFilters prop across a rerender", () => {
        const { result, rerender, props, setEditedAutomation } = renderDraftFilterWritesHook({
            widget: undefined,
            insight: undefined,
            storeFilters: false,
        });

        const filters = [fakeFilterContextItem("f1")];
        result.current.applyFiltersToDraft(filters);
        extractUpdater(setEditedAutomation.mock.calls[0][0])(makeAutomation());
        expect(getAppliedDashboardFiltersSpy).toHaveBeenLastCalledWith(
            filters,
            SENTINEL_HIDDEN_FILTERS,
            false,
        );

        rerender({ ...props, storeFilters: true });
        result.current.applyFiltersToDraft(filters);
        extractUpdater(setEditedAutomation.mock.calls[1][0])(makeAutomation());
        expect(getAppliedDashboardFiltersSpy).toHaveBeenLastCalledWith(
            filters,
            SENTINEL_HIDDEN_FILTERS,
            true,
        );
    });

    it("applyFiltersByTabToDraft picks up a changed storeFilters prop across a rerender", () => {
        const { result, rerender, props } = renderDraftFilterWritesHook({ storeFilters: false });
        const newFiltersByTab = { tab1: [fakeFilterContextItem("f1")] };

        result.current.applyFiltersByTabToDraft(newFiltersByTab);
        expect(getVisibleFiltersByFiltersByTabSpy).toHaveBeenLastCalledWith(
            newFiltersByTab,
            undefined,
            false,
        );

        rerender({ ...props, storeFilters: true });
        result.current.applyFiltersByTabToDraft(newFiltersByTab);
        expect(getVisibleFiltersByFiltersByTabSpy).toHaveBeenLastCalledWith(newFiltersByTab, undefined, true);
    });
});
