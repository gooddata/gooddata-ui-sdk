// (C) 2026 GoodData Corporation

import {
    type DashboardAttachmentType,
    type FilterContextItem,
    type IAutomationMetadataObjectDefinition,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IInsight,
    type INotificationChannelIdentifier,
    type IUser,
    type IWidget,
    type WidgetAttachmentType,
    idRef,
} from "@gooddata/sdk-model";

import { type IAutomationsContextValue } from "../../../contexts/AutomationsContext.js";
import { type IScheduledEmailDialogContextValue } from "../../../contexts/ScheduledEmailDialogContext.js";
import { workspaceStringParameter } from "../../../shared/automationFilters/test/parameterFixtures.js";
import { type IScheduledExportDataContextValue } from "../ScheduledExportDataContext.js";
import { type IScheduledExportDraftContextValue } from "../ScheduledExportDraftContext.js";

export const CURRENT_USER: IUser = {
    ref: idRef("user-1"),
    login: "user1@example.com",
    email: "user1@example.com",
};

export const SENTINEL_CHANNEL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-1",
    allowedRecipients: "internal",
};

// Only `ref`/`localIdentifier`/`type`/`ignoreDashboardFilters` are read by the code exercised here
// (widget identity, the insight-widget type guard, and the ignored-filters check); the remaining
// required IWidget fields are filler values.
export const SENTINEL_WIDGET: IWidget = {
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    localIdentifier: "widget-1",
    type: "insight",
    title: "Widget",
    description: "",
    insight: idRef("insight-1", "insight"),
    drills: [],
    ignoreDashboardFilters: [],
};

export const SENTINEL_INSIGHT: IInsight = {
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

export const NEXT_FILTER: FilterContextItem = {
    attributeFilter: {
        localIdentifier: "f1",
        displayForm: idRef("df1"),
        negativeSelection: false,
        attributeElements: { uris: ["/e1"] },
    },
};

// A catalog parameter with a matching workspace definition, so a stored `{ref, value}` override
// survives reconstruction instead of being dropped as unresolvable.
export const WORKSPACE_PARAMETER = workspaceStringParameter("param-1", "Param 1", "default");

export const AUTOMATIONS_CONTEXT: IAutomationsContextValue = {
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

export const SCHEDULED_EMAIL_DIALOG_CONTEXT: IScheduledEmailDialogContextValue = {
    widget: undefined,
    insight: undefined,
    widgetTitle: undefined,
    dashboardId: "dashboard-1",
    dashboardTitle: "Dashboard",
    dashboardFilters: undefined,
    hiddenFilters: [],
    commonDateFilterId: undefined,
    exportParametersByTab: {},
    exportTemplates: [],
    dateFormat: "MM/dd/yyyy",
    isCrossFiltering: false,
    commonDateFilterMode: "active",
    dateFiltersModeMap: new Map(),
    attributeFiltersModeMap: new Map(),
    createScheduledEmail: () => Promise.reject(new Error("not wired in tests")),
    saveScheduledEmail: () => Promise.reject(new Error("not wired in tests")),
    deleteScheduledEmail: () => Promise.resolve(),
    scheduledExportToEdit: undefined,
    notificationChannels: [SENTINEL_CHANNEL],
    isLoading: false,
};

const EDITED_AUTOMATION: IAutomationMetadataObjectDefinition = {
    type: "automation",
    title: "Draft",
    notificationChannel: SENTINEL_CHANNEL.id,
    recipients: [],
    exportDefinitions: [],
    schedule: { cron: "0 0 * * *", firstRun: "2026-01-01T00:00:00.000Z", timezone: "Europe/Prague" },
    details: { subject: "", message: "" },
};

export const DRAFT_FIXTURE: IScheduledExportDraftContextValue = {
    editedAutomation: EDITED_AUTOMATION,
    originalAutomation: EDITED_AUTOMATION,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    isCronValid: true,
    isTitleValid: true,
    isSubjectValid: false,
    isOnMessageValid: true,
};

export const DATA_FIXTURE: IScheduledExportDataContextValue = {
    defaultUser: { type: "user", id: "user-1", email: "user1@example.com" },
    defaultRecipient: { type: "user", id: "recipient-1", email: "recipient1@example.com" },
};

type ExportDefinition = NonNullable<IAutomationMetadataObjectDefinition["exportDefinitions"]>[number];

export const makeDashboardExportDefinition = (
    format: DashboardAttachmentType,
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

export const makeWidgetExportDefinition = (
    format: WidgetAttachmentType,
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

export const makeAutomation = (
    overrides: Partial<IAutomationMetadataObjectDefinition> = {},
): IAutomationMetadataObjectDefinition => ({
    type: "automation",
    title: "Test Scheduled Email",
    notificationChannel: "channel-1",
    recipients: [],
    exportDefinitions: [],
    ...overrides,
});
