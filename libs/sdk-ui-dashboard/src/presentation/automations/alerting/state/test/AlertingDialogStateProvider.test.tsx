// (C) 2026 GoodData Corporation

import { Component, type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type INotificationChannelIdentifier,
    type IWidget,
    newMeasure,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric } from "../../types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// `AlertingDialog` is exercised for real — the loading gate under test lives there — with a
// stub registered as its `AlertingDialogComponent` slot, the same way a customer replacement
// would be. `useAutomationFiltersSelect`, `useValidateExistingAutomationFilters` and
// `useAutomationAlertParameters` are mocked because none of them are wired up to a real
// dashboard store in this unit test; `useAlertSupportedMetrics` is mocked for the same reason.
// `useAlertFormState` and `useAlertFiltersModel` run for real inside the real
// `AlertingDialogStateProvider`, because the seeding behaviour under test lives there.
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

vi.mock("../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: mockUseAutomationsContext,
}));

vi.mock("../../../contexts/AlertingDialogContext.js", () => ({
    useAlertingDialogContext: mockUseAlertingDialogContext,
}));

vi.mock("../../../shared/automationFilters/useAutomationFiltersSelect.js", () => ({
    useAutomationFiltersSelect: mockUseAutomationFiltersSelect,
}));

vi.mock("../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

vi.mock("../../../shared/automationFilters/useAutomationAlertParameters.js", () => ({
    useAutomationAlertParameters: mockUseAutomationAlertParameters,
}));

vi.mock("../useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({ AlertingDialogComponent: StubAlertingDialogComponent }),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import { AlertingDialog } from "../../AlertingDialog.js";
import { useAlertActions } from "../AlertActionsContext.js";
import { useAlertData } from "../AlertDataContext.js";
import { useAlertDraft } from "../AlertDraftContext.js";
import { useAlertFilters } from "../AlertFiltersContext.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_CURRENT_USER = { ref: { identifier: "user1" }, login: "user1" };

const SENTINEL_CHANNEL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-1",
    allowedRecipients: "internal",
};

// Only `ref`/`localIdentifier`/`type`/`ignoreDashboardFilters` are read by the code exercised
// here (widget identity, the insight-widget type guard, and the ignored-filters check); the
// remaining required IWidget fields are filler values.
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
    maxAutomationsRecipients: 5,
    externalRecipient: undefined as string | undefined,
};

// Create-mode default: no `alertToEdit`, a widget present, no stored dashboard tab/parameter
// state. `notificationChannels` defaults to not-yet-loaded (empty), matching the dialog's real
// data-loading order; tests that need the loaded channel set it explicitly. `isLoading` is set
// per test.
const DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE = {
    hiddenFilters: [] as FilterContextItem[],
    commonDateFilterId: undefined,
    alertToEdit: undefined,
    notificationChannels: [] as INotificationChannelIdentifier[],
    widget: SENTINEL_WIDGET,
    insight: undefined,
    dashboardId: undefined,
    dashboardEvaluationFrequency: undefined,
    parameterValues: [] as unknown[],
    dashboardParameters: [],
    isLoading: false,
};

function mockAutomationFiltersSelect() {
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
    });
}

function mockValidateExistingAutomationFilters() {
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
}

function setAlertingDialogContext(overrides: Partial<typeof DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE> = {}) {
    mockUseAlertingDialogContext.mockReturnValue({ ...DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE, ...overrides });
}

beforeEach(() => {
    vi.clearAllMocks();

    mockUseAutomationsContext.mockReturnValue(DEFAULT_AUTOMATIONS_CONTEXT_VALUE);
    setAlertingDialogContext();
    mockUseAutomationAlertParameters.mockReturnValue(DEFAULT_PARAMETERS_RETURN);
    mockUseAlertSupportedMetrics.mockReturnValue(DEFAULT_SUPPORTED_METRICS_RETURN);
    mockAutomationFiltersSelect();
    mockValidateExistingAutomationFilters();
});

// ---------------------------------------------------------------------------
// Probes — a stand-in for a customer's replacement slot component. Each probe calls one
// accessor unconditionally on every render; a boundary around it turns the accessor's throw
// (no provider mounted) into a stable, assertable marker instead of an uncaught render error.
// ---------------------------------------------------------------------------

class ProbeBoundary extends Component<{ children: ReactNode; testId: string }, { hasError: boolean }> {
    override state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    override render() {
        if (this.state.hasError) {
            return <div data-testid={this.props.testId}>NO_PROVIDER</div>;
        }
        return this.props.children;
    }
}

function DraftProbe() {
    const draft = useAlertDraft();
    return (
        <>
            <div data-testid="draft-channel">{draft.editedAutomation?.notificationChannel ?? "NONE"}</div>
            <div data-testid="draft-title">{draft.editedAutomation?.title ?? ""}</div>
        </>
    );
}

function ActionsProbe() {
    const actions = useAlertActions();
    return (
        <button data-testid="actions-ok" onClick={() => actions.onTitleChange("Edited title", true)}>
            edit
        </button>
    );
}

function DataProbe() {
    useAlertData();
    return <div data-testid="data-ok">OK</div>;
}

function FiltersProbe() {
    useAlertFilters();
    return <div data-testid="filters-ok">OK</div>;
}

function StubAlertingDialogComponent() {
    return (
        <>
            <ProbeBoundary testId="draft-probe">
                <DraftProbe />
            </ProbeBoundary>
            <ProbeBoundary testId="actions-probe">
                <ActionsProbe />
            </ProbeBoundary>
            <ProbeBoundary testId="data-probe">
                <DataProbe />
            </ProbeBoundary>
            <ProbeBoundary testId="filters-probe">
                <FiltersProbe />
            </ProbeBoundary>
        </>
    );
}

function renderAlertingDialog(onCancel: () => void = vi.fn()) {
    return render(
        <IntlWrapper>
            <AlertingDialog onCancel={onCancel} />
        </IntlWrapper>,
    );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AlertingDialogStateProvider — the loading gate", () => {
    // Every test here renders at least once while isLoading, so a probe's accessor throws and
    // React logs it via console.error on its way to the boundary — expected noise, not a signal.
    let consoleErrorSpy: MockInstance<typeof console.error>;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("does not mount the state model while isLoading, and seeds a real notificationChannel after the flip", () => {
        // Notification channels have not loaded yet — the real order this gate protects against.
        // Whether the provider is mounted at all while loading is covered by the next test; this
        // test is solely about what the seed looks like once it does mount.
        setAlertingDialogContext({ isLoading: true, notificationChannels: [] });

        const { rerender } = renderAlertingDialog();

        // Data has now loaded: isLoading flips and the channel becomes available in the same tick.
        setAlertingDialogContext({ isLoading: false, notificationChannels: [SENTINEL_CHANNEL] });
        rerender(
            <IntlWrapper>
                <AlertingDialog onCancel={vi.fn()} />
            </IntlWrapper>,
        );

        expect(screen.getByTestId("draft-channel")).toHaveTextContent(SENTINEL_CHANNEL.id);
    });

    it("keeps the post-load draft across a rerender that does not flip isLoading", () => {
        setAlertingDialogContext({ isLoading: false, notificationChannels: [SENTINEL_CHANNEL] });

        const { rerender } = renderAlertingDialog();

        fireEvent.click(screen.getByTestId("actions-ok"));
        expect(screen.getByTestId("draft-title")).toHaveTextContent("Edited title");

        // A rerender caused by a prop change unrelated to `isLoading` — not a fresh mount.
        rerender(
            <IntlWrapper>
                <AlertingDialog onCancel={vi.fn()} />
            </IntlWrapper>,
        );

        expect(screen.getByTestId("draft-title")).toHaveTextContent("Edited title");
    });

    it("throws from each accessor while isLoading, because the provider is not mounted", () => {
        setAlertingDialogContext({ isLoading: true });

        renderAlertingDialog();

        expect(screen.getByTestId("draft-probe")).toHaveTextContent("NO_PROVIDER");
        expect(screen.getByTestId("actions-probe")).toHaveTextContent("NO_PROVIDER");
        expect(screen.getByTestId("data-probe")).toHaveTextContent("NO_PROVIDER");
        expect(screen.getByTestId("filters-probe")).toHaveTextContent("NO_PROVIDER");
    });
});
