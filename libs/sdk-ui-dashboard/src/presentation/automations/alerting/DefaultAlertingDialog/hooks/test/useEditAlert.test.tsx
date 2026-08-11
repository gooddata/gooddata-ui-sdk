// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type * as ReactIntl from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type INotificationChannelIdentifier,
    type IWidget,
    idRef,
    newMeasure,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric } from "../../../types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()). We use
// vi.fn() inline and retrieve spies via vi.mocked() after the import statements.
//
// `useAutomationFiltersSelect` and `useValidateExistingAutomationFilters` are the two
// shared, store-backed read hooks `useEditAlert` now calls directly — mocked the same
// way `useAutomationAlertParameters` already is below, since none of them are wired up
// to a real dashboard store in this unit test. `useAlertSupportedMetrics` is mocked too:
// its own context reads and insight-derived metrics are irrelevant to the filter-model
// ordering this file exercises, and it has its own dedicated test file. Everything else
// `useEditAlert` composes (`useAlertFormState`, `useAlertSelectedValues`, `useAlertFiltersModel`,
// `useAlertThreshold`, `useAlertFormValidation`) runs for real, because the first-mount
// test's whole point is to exercise the real seeding computation through the real hooks.
// ---------------------------------------------------------------------------

const {
    mockUseAutomationsContext,
    mockUseAlertingDialogContext,
    mockUseAutomationFiltersSelect,
    mockUseValidateExistingAutomationFilters,
    mockUseAutomationAlertParameters,
    mockUseAlertSupportedMetrics,
} = vi.hoisted(() => ({
    mockUseAutomationsContext: vi.fn(),
    mockUseAlertingDialogContext: vi.fn(),
    mockUseAutomationFiltersSelect: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
    mockUseAutomationAlertParameters: vi.fn(),
    mockUseAlertSupportedMetrics: vi.fn(),
}));

vi.mock("../../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: mockUseAutomationsContext,
}));

vi.mock("../../../../contexts/AlertingDialogContext.js", () => ({
    useAlertingDialogContext: mockUseAlertingDialogContext,
}));

vi.mock("../../../../shared/automationFilters/useAutomationFiltersSelect.js", () => ({
    useAutomationFiltersSelect: mockUseAutomationFiltersSelect,
}));

vi.mock("../../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

vi.mock("../../../../shared/automationFilters/useAutomationAlertParameters.js", () => ({
    useAutomationAlertParameters: mockUseAutomationAlertParameters,
}));

vi.mock("../useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

// formatMessage is mocked to return the descriptor id rather than resolved copy, so
// assertions below don't couple to the exact English translation text.
vi.mock("react-intl", async () => {
    const actual = await vi.importActual<typeof ReactIntl>("react-intl");
    return {
        ...actual,
        useIntl: () => ({ formatMessage: (descriptor: { id: string }) => descriptor.id }),
    };
});

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { useEditAlert, type IUseEditAlertProps } from "../useEditAlert.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_CURRENT_USER = { ref: idRef("user1"), login: "user1" };

const SENTINEL_CHANNEL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-1",
    allowedRecipients: "internal",
};

// Only `ref`/`localIdentifier`/`type`/`ignoreDashboardFilters` are read by the code under
// test (widget identity, the insight-widget type guard, and the ignored-filters check); the
// remaining required IInsightWidget fields are filler values.
const SENTINEL_WIDGET: IWidget = {
    ref: { identifier: "widget-1" },
    uri: "/widget-1",
    identifier: "widget-1",
    localIdentifier: "widget-1",
    type: "insight",
    title: "Widget",
    description: "",
    insight: { identifier: "insight-1" },
    drills: [],
    ignoreDashboardFilters: [],
};

const SENTINEL_MEASURE: AlertMetric = {
    measure: newMeasure("m1", (m) => m.localId("m1")),
    isPrimary: true,
    comparators: [],
};

const DEFAULT_SUPPORTED_METRICS_RETURN = {
    measureFormatMap: {},
    supportedMeasures: [SENTINEL_MEASURE],
    supportedAttributes: [] as AlertAttribute[],
    isResultLoading: false,
    getAttributeValues: vi.fn(),
    getMetricValue: vi.fn(),
};

const DEFAULT_PARAMETERS_RETURN = {
    automationParameters: [],
    availableParameters: [],
    onParameterChange: vi.fn(),
    onParameterDelete: vi.fn(),
    onParameterAdd: vi.fn(),
    dropStaleParameters: vi.fn(),
};

const DEFAULT_AUTOMATIONS_CONTEXT_VALUE = {
    catalogDateDatasets: [],
    catalogAttributes: [],
    separators: undefined,
    weekStart: "Monday" as const,
    timezone: "Europe/Prague",
    allowHourlyRecurrence: false,
    settings: undefined,
    currentUser: SENTINEL_CURRENT_USER,
    widgetLocalIdToTabIdMap: {} as Record<string, string>,
    features: { enableAlertOncePerInterval: false },
};

// Create-mode default: no `alertToEdit`, a widget present (alerting is always opened for a
// specific insight widget), no stored dashboard tab/parameter state.
const DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE = {
    hiddenFilters: [] as FilterContextItem[],
    commonDateFilterId: undefined,
    alertToEdit: undefined as IAutomationMetadataObject | undefined,
    notificationChannels: [SENTINEL_CHANNEL],
    widget: SENTINEL_WIDGET,
    insight: undefined,
    dashboardId: undefined,
    dashboardEvaluationFrequency: undefined,
    parameterValues: [] as unknown[],
};

// Edit-mode fixture: only `.alert` (absent here) is read by `useAlertFormState`'s
// `resolvedAlertToEdit` short-circuit; the remaining required fields are filler values.
const SENTINEL_ALERT_TO_EDIT: IAutomationMetadataObject = {
    type: "automation",
    id: "alert-1",
    uri: "/alert-1",
    ref: { identifier: "alert-1" },
    title: "Alert",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
};

const BASE_HOOK_PROPS: IUseEditAlertProps = {
    maxAutomationsRecipients: 5,
};

// Both are the same shape today — `useEditAlert`'s own props no longer carry the
// create/edit distinction; that now lives entirely in the mocked `AlertingDialogContext`
// (`alertToEdit` present or not), set per test below.
const propsForCreateMode: IUseEditAlertProps = { ...BASE_HOOK_PROPS };
const propsForEditMode: IUseEditAlertProps = { ...BASE_HOOK_PROPS };

function mockAutomationFiltersSelect(overrides: { editedAutomationFilters?: FilterContextItem[] } = {}) {
    mockUseAutomationFiltersSelect.mockReturnValue({
        editedAutomationFilters: [],
        setEditedAutomationFilters: vi.fn(),
        storeFilters: false,
        setStoreFilters: vi.fn(),
        availableFilters: [],
        availableFiltersAsVisibleFilters: undefined,
        filtersForNewAutomation: [],
        filtersByTab: undefined,
        editedAutomationFiltersByTab: undefined,
        setEditedAutomationFiltersByTab: vi.fn(),
        availableFiltersAsVisibleFiltersByTab: undefined,
        ...overrides,
    });
}

function mockValidateExistingAutomationFilters(
    overrides: { isValid?: boolean; filtersAreStale?: boolean } = {},
) {
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
        ...overrides,
    });
}

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();

    mockUseAutomationsContext.mockReturnValue(DEFAULT_AUTOMATIONS_CONTEXT_VALUE);
    mockUseAlertingDialogContext.mockReturnValue(DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE);
    mockUseAutomationAlertParameters.mockReturnValue(DEFAULT_PARAMETERS_RETURN);
    mockUseAlertSupportedMetrics.mockReturnValue(DEFAULT_SUPPORTED_METRICS_RETURN);
    mockAutomationFiltersSelect();
    mockValidateExistingAutomationFilters();
});

function renderEditAlertHook(props: IUseEditAlertProps) {
    return renderHook(() => useEditAlert(props), { wrapper: IntlWrapper });
}

// ---------------------------------------------------------------------------
// First-mount draft equivalence — the sharpest regression risk of the read-model move:
// the read hook now runs upstream of `useAlertFormState`'s lazy `useState` initializer,
// so a one-render timing shift would silently change a new alert's default filters.
// ---------------------------------------------------------------------------

describe("useEditAlert — first-mount filter seeding", () => {
    it("seeds a new alert's draft filters from the read model on first mount", () => {
        const filters: FilterContextItem[] = [
            {
                attributeFilter: {
                    localIdentifier: "f1",
                    displayForm: idRef("df1"),
                    negativeSelection: false,
                    attributeElements: { uris: ["/e1"] },
                },
            },
        ];
        mockAutomationFiltersSelect({ editedAutomationFilters: filters });

        const { result } = renderEditAlertHook(propsForCreateMode);

        // asserted on the FIRST render — not after an act()/settle, which would hide a one-render lag
        expect(result.current.editedAutomation?.alert?.execution?.filters).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// Staleness gate — `filtersAreStale` drives whether the renderer opens
// ApplyCurrentFiltersConfirmDialog. Both directions matter: asserting only the stale
// case would pass against a hook that hardcoded `true`.
// ---------------------------------------------------------------------------

describe("useEditAlert — staleness gate", () => {
    it("reports staleness so the apply-current-filters gate still triggers", () => {
        mockUseAlertingDialogContext.mockReturnValue({
            ...DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE,
            alertToEdit: SENTINEL_ALERT_TO_EDIT,
        });

        mockValidateExistingAutomationFilters({ isValid: false, filtersAreStale: true });
        const { result } = renderEditAlertHook(propsForEditMode);
        expect(result.current.automationIsValid).toBe(false);
        expect(result.current.filtersAreStale).toBe(true);

        mockValidateExistingAutomationFilters({ isValid: true, filtersAreStale: false });
        const { result: fresh } = renderEditAlertHook(propsForEditMode);
        expect(fresh.current.filtersAreStale).toBe(false);
    });
});
