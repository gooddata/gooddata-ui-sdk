// (C) 2026 GoodData Corporation

import { type PropsWithChildren, useRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type INotificationChannelIdentifier,
    type IUser,
    type IWidget,
    idRef,
    newMeasure,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AlertingDialogContextProvider,
    type IAlertingDialogContextValue,
} from "../../contexts/AlertingDialogContext.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import { type AlertAttribute, type AlertMetric } from "../types.js";

import { useAlertActions } from "./AlertActionsContext.js";
import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";
import { useAlertFilters } from "./AlertFiltersContext.js";
import { AlertingDialogStateProvider } from "./AlertingDialogStateProvider.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the two hooks unrelated to draft edits are mocked: `useAlertSupportedMetrics` resolves
// measures from an execution result, and `useValidateExistingAutomationFilters` computes staleness
// against the dashboard's current filters — neither one is read or re-run by a title keystroke.
// `useAutomationsContext` and `useAlertingDialogContext` are supplied by their real providers, and
// `useAutomationFiltersSelect`, `useAlertFormState`, `useAlertFiltersModel` and
// `useAutomationAlertParameters` all run for real: the whole point of this file is whether the real
// per-context memoization holds under a real keystroke, and mocking any of those would stand in for
// exactly the computation being measured.
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
    mockUseAlertSupportedMetrics: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
}));

vi.mock("./useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
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
        enabled: false,
        stringParametersEnabled: false,
        catalog: [],
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

// ---------------------------------------------------------------------------
// A driver that fires one simulated draft keystroke per click, and a probe that shows the current
// draft title so a run can confirm the keystrokes actually reached the shared draft.
// ---------------------------------------------------------------------------

function TitleTypist() {
    const { onTitleChange } = useAlertActions();
    const keystrokeCount = useRef(0);
    return (
        <button
            data-testid="type-keystroke"
            onClick={() => {
                keystrokeCount.current += 1;
                onTitleChange(`draft-title-${keystrokeCount.current}`);
            }}
        >
            type
        </button>
    );
}

function DraftTitleProbe() {
    const { editedAutomation } = useAlertDraft();
    return <div data-testid="draft-title">{editedAutomation?.title ?? ""}</div>;
}

// Three test consumers, each subscribed to exactly one non-draft context. None of them read the
// draft, so none of them has a reason to change on a keystroke that only edits the draft's title;
// this is what the split is for.

function ActionsConsumer({ onRender }: { onRender: () => void }) {
    onRender();
    useAlertActions();
    return null;
}

function FiltersConsumer({ onRender }: { onRender: () => void }) {
    onRender();
    useAlertFilters();
    return null;
}

function DataConsumer({ onRender }: { onRender: () => void }) {
    onRender();
    useAlertData();
    return null;
}

describe("alert state render count — non-draft contexts do not churn on a keystroke", () => {
    it("renders the actions/filters/data test consumers once, unaffected by draft title keystrokes", () => {
        const onActionsRender = vi.fn();
        const onFiltersRender = vi.fn();
        const onDataRender = vi.fn();

        render(
            <Wrapper>
                <TitleTypist />
                <DraftTitleProbe />
                <ActionsConsumer onRender={onActionsRender} />
                <FiltersConsumer onRender={onFiltersRender} />
                <DataConsumer onRender={onDataRender} />
            </Wrapper>,
        );

        expect(onActionsRender).toHaveBeenCalledTimes(1);
        expect(onFiltersRender).toHaveBeenCalledTimes(1);
        expect(onDataRender).toHaveBeenCalledTimes(1);

        const KEYSTROKES = 5;
        for (let i = 0; i < KEYSTROKES; i += 1) {
            fireEvent.click(screen.getByTestId("type-keystroke"));
        }

        // Sanity: the keystrokes actually reached the shared draft, so the zero counts below are
        // not vacuously true because nothing happened.
        expect(screen.getByTestId("draft-title")).toHaveTextContent(`draft-title-${KEYSTROKES}`);

        expect(onActionsRender).toHaveBeenCalledTimes(1);
        expect(onFiltersRender).toHaveBeenCalledTimes(1);
        expect(onDataRender).toHaveBeenCalledTimes(1);
    });
});
