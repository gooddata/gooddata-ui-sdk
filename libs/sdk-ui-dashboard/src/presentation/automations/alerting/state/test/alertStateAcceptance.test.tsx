// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type INotificationChannelIdentifier,
    type IUser,
    type IWidget,
    type IdentifierRef,
    idRef,
    newMeasure,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import {
    AlertingDialogContextProvider,
    type IAlertingDialogContextValue,
} from "../../../contexts/AlertingDialogContext.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../../contexts/AutomationsContext.js";
import { setAlertExecutionParameters } from "../../../shared/automationFilters/automationParameters.js";
import { workspaceStringParameter } from "../../../shared/automationFilters/test/parameterFixtures.js";
import { type AlertAttribute, type AlertMetric } from "../../types.js";
import { useAlertActions } from "../AlertActionsContext.js";
import { useAlertFilters } from "../AlertFiltersContext.js";
import { AlertingDialogStateProvider } from "../AlertingDialogStateProvider.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the two hooks unrelated to filter/parameter propagation are mocked: `useAlertSupportedMetrics`
// resolves measures from an execution result, and `useValidateExistingAutomationFilters` computes
// staleness against the dashboard's current filters — neither one is read by the assertions below.
// `useAutomationsContext` and `useAlertingDialogContext` are supplied by their real providers, and
// every other hook the state provider composes (`useAutomationFiltersSelect`, `useAlertFormState`,
// `useAlertFiltersModel`, `useAutomationAlertParameters`) runs for real: the whole point of this file
// is that a second call site reading through the accessor sees the same state a mutator wrote, and a
// mock standing in for any of those hooks would settle exactly the question being asked.
// ---------------------------------------------------------------------------

const { mockUseAlertSupportedMetrics, mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseAlertSupportedMetrics: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
}));

vi.mock("../useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CURRENT_USER: IUser = {
    ref: idRef("user-1"),
    login: "user1@example.com",
    email: "user1@example.com",
};

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

// A catalog parameter with a matching workspace definition, so a stored `{ref, value}` override
// survives `reconstructAutomationParametersFromValues` instead of being dropped as unresolvable.
const PARAMETER_REF: IdentifierRef = idRef("param-1", "parameter");
const WORKSPACE_PARAMETER = workspaceStringParameter("param-1", "Param 1", "default");

const NEXT_FILTER: FilterContextItem = {
    attributeFilter: {
        localIdentifier: "f1",
        displayForm: idRef("df1"),
        negativeSelection: false,
        attributeElements: { uris: ["/e1"] },
    },
};

const AUTOMATIONS_CONTEXT: IAutomationsContextValue = {
    locale: "en-US",
    separators: { decimal: ".", thousand: "," },
    settings: undefined,
    catalogAttributes: [],
    catalogDateDatasets: [],
    catalogMeasures: [],
    dateFilterConfig: {
        availableGranularities: [],
        dateFilterOptions: {},
        getGranularitiesForTab: () => [],
        getOptionsForTab: () => undefined,
    },
    dateFilterContextConfig: undefined,
    attributeFilterConfigs: [],
    attributeFilterConfigsByTab: {},
    attributeFilterSelectionTypeMap: new Map(),
    attributeFilterSelectionTypeMapByTab: {},
    dateFilterConfigs: [],
    dateFilterConfigsByTab: {},
    dateFilterConfigOverridesByTab: {},
    measureValueFilterConfigs: [],
    measureValueFilterConfigsByTab: {},
    commonDateFilterId: undefined,
    lockedFilters: [],
    hiddenFilters: [],
    availableFilters: [],
    automationFiltersByTab: [],
    defaultSelectedFilters: [],
    automationAvailableFilters: [],
    maxAutomationsRecipients: 5,
    isExecutionTimestampMode: false,
    allowHourlyRecurrence: false,
    currentUser: CURRENT_USER,
    weekStart: "Monday",
    timezone: "Europe/Prague",
    isWhiteLabeled: false,
    isSecondaryTitleVisible: false,
    externalRecipient: undefined,
    features: {
        canCreateAutomation: true,
        enableAlertOncePerInterval: false,
        enableAnomalyDetectionAlert: false,
        canUseAiAssistant: false,
        canManageWorkspace: false,
        enableSlideshowExports: false,
        enableAutomationEvaluationMode: false,
    },
    parameters: {
        enabled: true,
        stringParametersEnabled: true,
        catalog: [WORKSPACE_PARAMETER],
        catalogIsLoaded: true,
        dashboardParametersByTab: {},
    },
    tabIds: [],
    widgetLocalIdToTabIdMap: {},
    getCatalogAttributeByRef: () => undefined,
    getAttributeFilterDisplayForm: () => undefined,
    widgetExistsByRef: () => false,
};

const ALERTING_DIALOG_CONTEXT: IAlertingDialogContextValue = {
    mode: "create",
    widget: SENTINEL_WIDGET,
    insight: undefined,
    widgetTitle: undefined,
    dashboardId: undefined,
    dashboardFilters: [],
    hiddenFilters: [],
    executionResultByRef: () => undefined,
    parameterValues: [],
    dashboardParameters: [],
    commonDateFilterId: undefined,
    dashboardEvaluationFrequency: undefined,
    createAlert: vi.fn(),
    saveAlert: vi.fn(),
    deleteAlert: vi.fn(),
    alertToEdit: undefined,
    notificationChannels: [SENTINEL_CHANNEL],
    isLoading: false,
};

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
// The fake customer shell — two sibling blocks reading and writing through the same accessors a
// real replacement slot would use, mounted under the real `AlertingDialogStateProvider`.
// ---------------------------------------------------------------------------

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

function BlockA() {
    const { onFiltersChange } = useAlertFilters();
    const { setEditedAutomation } = useAlertActions();
    return (
        <>
            <button data-testid="block-a-change-filters" onClick={() => onFiltersChange([NEXT_FILTER])}>
                change filters
            </button>
            <button
                data-testid="block-a-write-parameters"
                onClick={() =>
                    setEditedAutomation((current) =>
                        current
                            ? setAlertExecutionParameters(current, [
                                  { ref: PARAMETER_REF, value: "override-value" },
                              ])
                            : current,
                    )
                }
            >
                write parameters
            </button>
        </>
    );
}

function BlockB() {
    const { selectedFilters, automationParameters } = useAlertFilters();
    return (
        <>
            <div data-testid="block-b-filter-count">{selectedFilters.length}</div>
            <div data-testid="block-b-parameter-value">
                {String(automationParameters[0]?.value ?? "NONE")}
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("alert state acceptance — a second call site sees what the mutator wrote", () => {
    it("propagates a filter selection block A wrote to block B, both reading useAlertFilters()", () => {
        render(
            <Wrapper>
                <BlockA />
                <BlockB />
            </Wrapper>,
        );

        expect(screen.getByTestId("block-b-filter-count")).toHaveTextContent("0");

        fireEvent.click(screen.getByTestId("block-a-change-filters"));

        expect(screen.getByTestId("block-b-filter-count")).toHaveTextContent("1");
    });

    it("propagates an execution parameter written via useAlertActions().setEditedAutomation into useAlertFilters().automationParameters", () => {
        render(
            <Wrapper>
                <BlockA />
                <BlockB />
            </Wrapper>,
        );

        expect(screen.getByTestId("block-b-parameter-value")).toHaveTextContent("NONE");

        fireEvent.click(screen.getByTestId("block-a-write-parameters"));

        expect(screen.getByTestId("block-b-parameter-value")).toHaveTextContent("override-value");
    });
});
