// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the two hooks unrelated to filter propagation are mocked, exactly as in
// alertStateAcceptance.test.tsx: `useAlertSupportedMetrics` resolves measures from an execution
// result and `useValidateExistingAutomationFilters` computes staleness against the dashboard's
// current filters — neither is read by the assertions below. `useAutomationFiltersSelect`,
// `useAlertFormState` and `useAlertFiltersModel` all run for real — the whole point of this file
// is to pin the *real* write's output before a later task moves it, and a mock standing in for
// any of them would settle exactly the question being asked.
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseAlertSupportedMetrics, mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseAlertSupportedMetrics: vi.fn<typeof useAlertSupportedMetrics>(),
    mockUseValidateExistingAutomationFilters: vi.fn<typeof useValidateExistingAutomationFilters>(),
}));

vi.mock("./useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type ICatalogAttribute,
    type IInsight,
    idRef,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../contexts/AlertingDialogContext.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import { type useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import {
    ALERTING_DIALOG_CONTEXT as BASE_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT as BASE_AUTOMATIONS_CONTEXT,
    NEXT_FILTER,
    SENTINEL_MEASURE,
    SENTINEL_WIDGET,
} from "../tests/alerting.test.helpers.js";
import { type AlertAttribute } from "../types.js";

import { useAlertDraft } from "./AlertDraftContext.js";
import { useAlertFilters } from "./AlertFiltersContext.js";
import { AlertingDialogStateProvider } from "./AlertingDialogStateProvider.js";
import { type useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";

beforeEach(() => {
    vi.clearAllMocks();

    mockUseAlertSupportedMetrics.mockReturnValue({
        measureFormatMap: {},
        supportedMeasures: [SENTINEL_MEASURE],
        supportedAttributes: [] as AlertAttribute[],
        isResultLoading: false,
        getAttributeValues: vi.fn(),
        getMetricValue: vi.fn(),
    });

    mockUseValidateExistingAutomationFilters.mockReturnValue({
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
    });
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// `SENTINEL_WIDGET.insight` (shared.test.helpers.ts) refers to identifier "insight-1"; mirrored
// here so `getAppliedWidgetFilters`'s insight-filter merge has a matching, filter-free insight.
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

// Fully-typed sentinels (no `as unknown as` casts) resolving NEXT_FILTER's naming unconditionally:
// this fixture only ever puts one attribute filter in play, so a lookup pair that ignores its
// argument and always returns this attribute/display-form is equivalent to a real catalog lookup
// for the case exercised here.
const SENTINEL_ATTRIBUTE_REF = idRef("a1", "attribute");

const SENTINEL_DISPLAY_FORM: IAttributeDisplayFormMetadataObject = {
    type: "displayForm",
    ref: idRef("df1", "displayForm"),
    id: "df1",
    uri: "/df1",
    title: "Display Form 1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    attribute: SENTINEL_ATTRIBUTE_REF,
};

const SENTINEL_ATTRIBUTE: IAttributeMetadataObject = {
    type: "attribute",
    ref: SENTINEL_ATTRIBUTE_REF,
    id: "a1",
    uri: "/a1",
    title: "Attribute 1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    displayForms: [SENTINEL_DISPLAY_FORM],
};

const SENTINEL_CATALOG_ATTRIBUTE: ICatalogAttribute = {
    type: "attribute",
    attribute: SENTINEL_ATTRIBUTE,
    defaultDisplayForm: SENTINEL_DISPLAY_FORM,
    displayForms: [SENTINEL_DISPLAY_FORM],
    geoPinDisplayForms: [],
    groups: [],
};

const AUTOMATIONS_CONTEXT: IAutomationsContextValue = {
    ...BASE_AUTOMATIONS_CONTEXT,
    availableFilters: [NEXT_FILTER],
    automationAvailableFilters: [NEXT_FILTER],
    defaultSelectedFilters: [NEXT_FILTER],
    getAttributeFilterDisplayForm: () => SENTINEL_DISPLAY_FORM,
    getCatalogAttributeByRef: () => SENTINEL_CATALOG_ATTRIBUTE,
};

const ALERTING_DIALOG_CONTEXT = {
    ...BASE_DIALOG_CONTEXT,
    widget: SENTINEL_WIDGET,
    insight: SENTINEL_INSIGHT,
};

function Wrapper({ children }: PropsWithChildren) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <AlertingDialogContextProvider value={ALERTING_DIALOG_CONTEXT}>
                    <AlertingDialogStateProvider>{children}</AlertingDialogStateProvider>
                </AlertingDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

function useProbe() {
    return {
        draft: useAlertDraft(),
        filters: useAlertFilters(),
    };
}

function alertShape(automation: IAutomationMetadataObjectDefinition | undefined) {
    return {
        filters: automation?.alert?.execution.filters,
        visibleFilters: automation?.metadata?.visibleFilters,
    };
}

// ---------------------------------------------------------------------------
// Case 6: Alerting (insight widget), non-empty selection
// ---------------------------------------------------------------------------

describe("alert draft filter-write equivalence — insight widget, non-empty selection", () => {
    it("a no-op onFiltersChange leaves alert.execution.filters and metadata.visibleFilters unchanged", () => {
        const { result } = renderHook(() => useProbe(), { wrapper: Wrapper });

        const selection = result.current.filters.selectedFilters;
        expect(selection.length).toBeGreaterThan(0);

        const seed = alertShape(result.current.draft.editedAutomation);
        // Guards against a vacuous pass: the selection must actually reach the draft.
        expect(seed.filters?.length).toBeGreaterThan(0);
        expect(seed.visibleFilters?.length).toBeGreaterThan(0);

        act(() => {
            result.current.filters.onFiltersChange(selection);
        });

        expect(alertShape(result.current.draft.editedAutomation)).toEqual(seed);
    });
});
