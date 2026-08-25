// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, renderHook, screen } from "@testing-library/react";
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

import { type AlertAttribute, type AlertMetric } from "../types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// `useAutomationFiltersSelect` and `useValidateExistingAutomationFilters` are the two
// shared, store-backed read hooks the state provider calls directly — mocked the same way
// `useAutomationAlertParameters` already is below, since none of them are wired up to a real
// dashboard store in this unit test. `useAlertSupportedMetrics` is mocked too: its own context
// reads and insight-derived metrics are irrelevant to the filter-model ordering and threshold
// derivation this file exercises, and it has its own dedicated test file. Everything else the
// state provider composes (`useAlertFormState`, `useAlertSelectedValues`, `useAlertFiltersModel`,
// `useAlertThreshold`, `useAlertDialogValidity`, `useAlertFormValidation`) runs for real, because
// this file's whole point is to exercise the real seeding and derivation through the real hooks,
// reading the results back through the alert state contexts and accessors rather than through a
// hand-assembled bag.
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

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

vi.mock("../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: mockUseAutomationsContext,
}));

vi.mock("../../contexts/AlertingDialogContext.js", () => ({
    useAlertingDialogContext: mockUseAlertingDialogContext,
}));

vi.mock("../../shared/automationFilters/useAutomationFiltersSelect.js", () => ({
    useAutomationFiltersSelect: mockUseAutomationFiltersSelect,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

vi.mock("../../shared/automationFilters/useAutomationAlertParameters.js", () => ({
    useAutomationAlertParameters: mockUseAutomationAlertParameters,
}));

vi.mock("./useAlertSupportedMetrics.js", () => ({
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

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAlertThreshold } from "../DefaultAlertingDialog/hooks/useAlertThreshold.js";
import { getAlertThreshold } from "../DefaultAlertingDialog/utils/getters.js";

import { useAlertActions } from "./AlertActionsContext.js";
import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";
import { useAlertFilters } from "./AlertFiltersContext.js";
import { AlertingDialogStateProvider } from "./AlertingDialogStateProvider.js";
import { useAlertDialogValidity } from "./useAlertDialogValidity.js";
import { useAlertSelectedValues } from "./useAlertSelectedValues.js";

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

// A second measure, distinct from SENTINEL_MEASURE, used to drive a real selection change in the
// threshold relocation test below.
const SENTINEL_MEASURE_2: AlertMetric = {
    measure: newMeasure("m2", (m) => m.localId("m2")),
    isPrimary: false,
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
    maxAutomationsRecipients: 5,
    externalRecipient: undefined as string | undefined,
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

// The accessors and the zero-argument derivations only exist under `AlertingDialogStateProvider`
// — the same provider the default alerting dialog is mounted under once its data has loaded.
function Wrapper({ children }: PropsWithChildren) {
    return (
        <IntlWrapper>
            <AlertingDialogStateProvider>{children}</AlertingDialogStateProvider>
        </IntlWrapper>
    );
}

// ---------------------------------------------------------------------------
// A probe that reads every accessor and derivation the default dialog's renderer reads, the same
// way the renderer does: the four contexts by their accessors, the two zero-argument derivations,
// and a direct `useAlertThreshold` call fed from those derivations.
// ---------------------------------------------------------------------------

function useStateProbe() {
    const draft = useAlertDraft();
    const actions = useAlertActions();
    const data = useAlertData();
    const filters = useAlertFilters();
    const selected = useAlertSelectedValues();
    const validity = useAlertDialogValidity();
    const { alertToEdit } = useAlertingDialogContext();

    const threshold = useAlertThreshold({
        setEditedAutomation: actions.setEditedAutomation,
        editedAutomation: draft.editedAutomation,
        getMetricValue: data.getMetricValue,
        isNewAlert: !alertToEdit,
        selectedRelativeOperator: selected.selectedRelativeOperator,
        selectedMeasure: selected.selectedMeasure,
        selectedAttribute: selected.selectedAttribute,
        selectedValue: selected.selectedValue,
    });

    return { draft, actions, data, filters, selected, validity, threshold };
}

function renderStateProbe() {
    return renderHook(() => useStateProbe(), { wrapper: Wrapper });
}

// ---------------------------------------------------------------------------
// Context shapes — as published by the real provider. This is the roster's only coverage: no test
// renders the default dialog or its renderer, so a member silently dropped from a context here
// would otherwise go unnoticed.
// ---------------------------------------------------------------------------

describe("alerting dialog state — context shapes", () => {
    it("publishes the draft context's declared members", () => {
        const { result } = renderStateProbe();
        expect(Object.keys(result.current.draft).sort()).toEqual([
            "editedAutomation",
            "isTitleValid",
            "originalAutomation",
            "warningMessage",
        ]);
    });

    it("publishes the actions context's declared members", () => {
        const { result } = renderStateProbe();
        expect(Object.keys(result.current.actions).sort()).toEqual([
            "onAnomalyDetectionChange",
            "onAttributeChange",
            "onComparisonOperatorChange",
            "onComparisonTypeChange",
            "onDestinationChange",
            "onGranularityChange",
            "onMeasureChange",
            "onRecipientsChange",
            "onRelativeOperatorChange",
            "onSensitivityChange",
            "onTitleChange",
            "onTriggerIntervalChange",
            "onTriggerModeChange",
            "setEditedAutomation",
        ]);
    });

    it("publishes the data context's declared members", () => {
        const { result } = renderStateProbe();
        expect(Object.keys(result.current.data).sort()).toEqual([
            "defaultRecipient",
            "defaultUser",
            "getAttributeValues",
            "getMetricValue",
            "isResultLoading",
            "measureFormatMap",
            "supportedAttributes",
            "supportedMeasures",
        ]);
    });

    it("publishes the filters context's declared members", () => {
        const { result } = renderStateProbe();
        expect(Object.keys(result.current.filters).sort()).toEqual([
            "automationIsValid",
            "automationParameters",
            "availableFilters",
            "availableParameters",
            "dropStaleParameters",
            "filtersAreStale",
            "onApplyCurrentFilters",
            "onFiltersChange",
            "onParameterAdd",
            "onParameterChange",
            "onParameterDelete",
            "selectedFilters",
        ]);
    });

    it("publishes the dialog validity derivation's declared members", () => {
        const { result } = renderStateProbe();
        expect(Object.keys(result.current.validity).sort()).toEqual([
            "canChangeMeasure",
            "isInvalidConnectionToInsight",
            "isParentValid",
            "isSubmitDisabled",
            "validationErrorMessage",
        ]);
    });
});

// ---------------------------------------------------------------------------
// The threshold members are renderer-owned: produced by a direct `useAlertThreshold` call, not by
// any of the four contexts. Without this check they fall through the gap between the shape
// assertions above — none of those contexts would ever be expected to carry them, so a
// regression that accidentally added them to a context, or dropped them from the direct call,
// would pass unnoticed otherwise.
// ---------------------------------------------------------------------------

describe("alerting dialog state — threshold members stay renderer-owned", () => {
    it("produces value/onChange/onBlur/thresholdErrorMessage from the direct call, and from no context", () => {
        const { result } = renderStateProbe();

        expect(Object.keys(result.current.threshold).sort()).toEqual([
            "onBlur",
            "onChange",
            "thresholdErrorMessage",
            "value",
        ]);

        const contextKeys = new Set([
            ...Object.keys(result.current.draft),
            ...Object.keys(result.current.actions),
            ...Object.keys(result.current.data),
            ...Object.keys(result.current.filters),
        ]);

        for (const thresholdMember of ["value", "onChange", "onBlur", "thresholdErrorMessage"]) {
            expect(contextKeys.has(thresholdMember)).toBe(false);
        }
    });
});

// ---------------------------------------------------------------------------
// `useAlertSelectedValues()` is not one of the four contexts, so the shape assertions above do not
// cover it. Its members otherwise flow only into `useCallback` dependency arrays and the threshold
// call, so these four never surface anywhere else in this file without an explicit assertion.
// ---------------------------------------------------------------------------

describe("useAlertSelectedValues — otherwise-implicit members", () => {
    it("resolves the selected channel and its recipient-permission flags for a plain channel", () => {
        const { result } = renderStateProbe();

        expect(result.current.selected.selectedNotificationChannel).toEqual(SENTINEL_CHANNEL);
        expect(result.current.selected.allowExternalRecipients).toBe(false);
        expect(result.current.selected.allowOnlyLoggedUserRecipients).toBe(false);
    });

    it("allows external recipients when the selected channel does", () => {
        const externalChannel: INotificationChannelIdentifier = {
            ...SENTINEL_CHANNEL,
            id: "channel-external",
            allowedRecipients: "external",
        };
        mockUseAlertingDialogContext.mockReturnValue({
            ...DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE,
            notificationChannels: [externalChannel],
        });

        const { result } = renderStateProbe();

        expect(result.current.selected.selectedNotificationChannel).toEqual(externalChannel);
        expect(result.current.selected.allowExternalRecipients).toBe(true);
        expect(result.current.selected.allowOnlyLoggedUserRecipients).toBe(false);
    });

    it("restricts recipients to the creator when the selected channel does", () => {
        const creatorChannel: INotificationChannelIdentifier = {
            ...SENTINEL_CHANNEL,
            id: "channel-creator",
            allowedRecipients: "creator",
        };
        mockUseAlertingDialogContext.mockReturnValue({
            ...DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE,
            notificationChannels: [creatorChannel],
        });

        const { result } = renderStateProbe();

        expect(result.current.selected.selectedNotificationChannel).toEqual(creatorChannel);
        expect(result.current.selected.allowOnlyLoggedUserRecipients).toBe(true);
        expect(result.current.selected.allowExternalRecipients).toBe(false);
    });

    it("reports no comparator for a plain comparison alert", () => {
        const { result } = renderStateProbe();
        expect(result.current.selected.selectedComparator).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// The draft's filters are seeded by useAlertFormState's lazy useState initializer, which sees the
// filter model's first-render value, so a one-render lag would silently change a new alert's
// default filters.
// ---------------------------------------------------------------------------

describe("AlertingDialogStateProvider — first-mount filter seeding", () => {
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

        const { result } = renderStateProbe();

        // asserted on the FIRST render — not after an act()/settle, which would hide a one-render lag
        expect(result.current.draft.editedAutomation?.alert?.execution?.filters).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// Staleness gate — `filtersAreStale` drives whether the renderer opens
// ApplyCurrentFiltersConfirmDialog. Both directions matter: asserting only the stale case would
// pass against a hook that hardcoded `true`.
// ---------------------------------------------------------------------------

describe("AlertingDialogStateProvider — staleness gate", () => {
    it("reports staleness so the apply-current-filters gate still triggers", () => {
        mockUseAlertingDialogContext.mockReturnValue({
            ...DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE,
            alertToEdit: SENTINEL_ALERT_TO_EDIT,
        });

        mockValidateExistingAutomationFilters({ isValid: false, filtersAreStale: true });
        const { result } = renderStateProbe();
        expect(result.current.filters.automationIsValid).toBe(false);
        expect(result.current.filters.filtersAreStale).toBe(true);

        mockValidateExistingAutomationFilters({ isValid: true, filtersAreStale: false });
        const { result: fresh } = renderStateProbe();
        expect(fresh.current.filters.filtersAreStale).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Threshold relocation — `useThresholdValue`'s effect writes the draft, auto-computing the
// comparison threshold when the selection changes. Its mount point determines draft content, so
// the shape assertions above (which only check presence) do not cover this half: a regression
// could keep the same four member names while silently breaking, duplicating, or relocating the
// write. A probe that calls `useAlertThreshold` the way the renderer does proves the write still
// happens from that single call site.
// ---------------------------------------------------------------------------

function ThresholdMountProbe() {
    const draft = useAlertDraft();
    const actions = useAlertActions();
    const data = useAlertData();
    const selected = useAlertSelectedValues();
    const { alertToEdit } = useAlertingDialogContext();

    useAlertThreshold({
        setEditedAutomation: actions.setEditedAutomation,
        editedAutomation: draft.editedAutomation,
        getMetricValue: data.getMetricValue,
        isNewAlert: !alertToEdit,
        selectedRelativeOperator: selected.selectedRelativeOperator,
        selectedMeasure: selected.selectedMeasure,
        selectedAttribute: selected.selectedAttribute,
        selectedValue: selected.selectedValue,
    });

    return (
        <button data-testid="switch-measure" onClick={() => actions.onMeasureChange(SENTINEL_MEASURE_2)}>
            switch measure
        </button>
    );
}

// A consumer that only reads the draft — never calls `useAlertThreshold` itself — standing in for
// any other part of the tree that displays draft state without owning the threshold computation.
function DraftOnlyProbe() {
    const draft = useAlertDraft();
    return (
        <div data-testid="draft-threshold">{getAlertThreshold(draft.editedAutomation?.alert) ?? "NONE"}</div>
    );
}

describe("useAlertThreshold — renderer mount point", () => {
    it("writes the computed threshold into the shared draft, and only once per selection change", () => {
        const mockGetMetricValue = vi.fn((measure) => (measure === SENTINEL_MEASURE_2.measure ? 99 : 42));
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...DEFAULT_SUPPORTED_METRICS_RETURN,
            supportedMeasures: [SENTINEL_MEASURE, SENTINEL_MEASURE_2],
            getMetricValue: mockGetMetricValue,
        });

        render(
            <Wrapper>
                <ThresholdMountProbe />
                <DraftOnlyProbe />
            </Wrapper>,
        );

        // Mounting already fires the effect once, computing the threshold for the default measure —
        // the draft-only reader sees it without calling useAlertThreshold itself.
        expect(screen.getByTestId("draft-threshold")).toHaveTextContent("42");
        expect(mockGetMetricValue).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId("switch-measure"));

        // The selection change recomputes the threshold from the renderer's mount point. The
        // draft-only reader's single, consistent update — one call added, not two — shows it does
        // not itself produce a second write.
        expect(screen.getByTestId("draft-threshold")).toHaveTextContent("99");
        expect(mockGetMetricValue).toHaveBeenCalledTimes(2);
    });
});
