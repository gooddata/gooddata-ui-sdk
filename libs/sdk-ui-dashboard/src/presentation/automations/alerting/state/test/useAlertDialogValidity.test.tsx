// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type DashboardAttributeFilterSelectionType,
    type IAutomationMetadataObject,
    type IAutomationRecipient,
    type IInsight,
    idRef,
} from "@gooddata/sdk-model";

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

vi.mock("../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: vi.fn(),
}));

vi.mock("../../../contexts/AlertingDialogContext.js", () => ({
    useAlertingDialogContext: vi.fn(),
}));

vi.mock("../AlertDraftContext.js", () => ({
    useAlertDraft: vi.fn(),
}));

vi.mock("../AlertDataContext.js", () => ({
    useAlertData: vi.fn(),
}));

vi.mock("../useAlertFormValidation.js", () => ({
    useAlertFormValidation: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import {
    useAlertingDialogContext,
    type IAlertingDialogContextValue,
} from "../../../contexts/AlertingDialogContext.js";
import {
    useAutomationsContext,
    type IAutomationsContextValue,
} from "../../../contexts/AutomationsContext.js";
import { useAlertData, type IAlertDataContextValue } from "../AlertDataContext.js";
import { useAlertDraft, type IAlertDraftContextValue } from "../AlertDraftContext.js";
import { useAlertDialogValidity } from "../useAlertDialogValidity.js";
import { useAlertFormValidation } from "../useAlertFormValidation.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const mockUseAutomationsContext = vi.mocked(useAutomationsContext);
const mockUseAlertingDialogContext = vi.mocked(useAlertingDialogContext);
const mockUseAlertDraft = vi.mocked(useAlertDraft);
const mockUseAlertData = vi.mocked(useAlertData);
const useAlertFormValidationSpy = vi.mocked(useAlertFormValidation);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_RECIPIENT: IAutomationRecipient = { type: "user", id: "user-1" };

const SENTINEL_ALERT_TO_EDIT: IAutomationMetadataObject = {
    type: "automation",
    id: "alert-1",
    uri: "/alert-1",
    ref: idRef("alert-1"),
    title: "Alert",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
};

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

const DRAFT_FIXTURE: IAlertDraftContextValue = {
    editedAutomation: { type: "automation", title: "Draft alert" },
    originalAutomation: undefined,
    warningMessage: undefined,
    isTitleValid: true,
};

const DATA_FIXTURE: IAlertDataContextValue = {
    supportedMeasures: [],
    supportedAttributes: [],
    measureFormatMap: {},
    isResultLoading: false,
    getAttributeValues: () => [],
    getMetricValue: () => undefined,
    defaultUser: SENTINEL_RECIPIENT,
    defaultRecipient: SENTINEL_RECIPIENT,
};

const DIALOG_FIXTURE: IAlertingDialogContextValue = {
    mode: "create",
    widget: undefined,
    insight: undefined,
    widgetTitle: undefined,
    dashboardId: "dashboard-1",
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
    alertToEdit: SENTINEL_ALERT_TO_EDIT,
    notificationChannels: [],
    isLoading: false,
};

const AUTOMATIONS_FIXTURE: IAutomationsContextValue = {
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
    attributeFilterSelectionTypeMap: new Map<string, DashboardAttributeFilterSelectionType | undefined>(),
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
    maxAutomationsRecipients: 7,
    isExecutionTimestampMode: false,
    allowHourlyRecurrence: true,
    currentUser: { login: "user1", ref: idRef("user1") },
    weekStart: "Monday",
    timezone: undefined,
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
    scheduleEmailDialogReturnFocusTo: undefined,
    widgetExistsByRef: () => false,
};

const DEFAULT_VALIDATION_RESULT = {
    isSubmitDisabled: false,
    validationErrorMessage: undefined,
    isParentValid: true,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    mockUseAutomationsContext.mockReturnValue(AUTOMATIONS_FIXTURE);
    mockUseAlertingDialogContext.mockReturnValue(DIALOG_FIXTURE);
    mockUseAlertDraft.mockReturnValue(DRAFT_FIXTURE);
    mockUseAlertData.mockReturnValue(DATA_FIXTURE);
    useAlertFormValidationSpy.mockReturnValue(DEFAULT_VALIDATION_RESULT);
});

function renderValidityHook(dialogOverrides: Partial<IAlertingDialogContextValue> = {}) {
    mockUseAlertingDialogContext.mockReturnValue({ ...DIALOG_FIXTURE, ...dialogOverrides });
    return renderHook(() => useAlertDialogValidity());
}

// ---------------------------------------------------------------------------

describe("useAlertDialogValidity", () => {
    it("threads the draft, data and dialog-context values into useAlertFormValidation", () => {
        renderValidityHook();

        expect(useAlertFormValidationSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                editedAutomation: DRAFT_FIXTURE.editedAutomation,
                originalAutomation: DRAFT_FIXTURE.originalAutomation,
                isTitleValid: DRAFT_FIXTURE.isTitleValid,
                defaultRecipient: DATA_FIXTURE.defaultRecipient,
                alertToEdit: DIALOG_FIXTURE.alertToEdit,
                maxAutomationsRecipients: AUTOMATIONS_FIXTURE.maxAutomationsRecipients,
            }),
        );
    });

    it("derives canChangeMeasure from the insight and isInvalidConnectionToInsight from a widget without one", () => {
        const withInsight = renderValidityHook({ insight: SENTINEL_INSIGHT });
        expect(withInsight.result.current.canChangeMeasure).toBe(true);
        expect(withInsight.result.current.isInvalidConnectionToInsight).toBe(false);

        const orphanWidget = renderValidityHook({
            insight: undefined,
            alertToEdit: { metadata: { widget: "widget-1" } } as unknown as IAutomationMetadataObject,
        });
        expect(orphanWidget.result.current.canChangeMeasure).toBe(false);
        expect(orphanWidget.result.current.isInvalidConnectionToInsight).toBe(true);
    });
});
