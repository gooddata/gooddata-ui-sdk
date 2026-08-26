// (C) 2026 GoodData Corporation

import {
    type DashboardAttachmentType,
    type IAutomationMetadataObjectDefinition,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IInsight,
    type IWidget,
    type WidgetAttachmentType,
    idRef,
} from "@gooddata/sdk-model";

import { type IScheduledEmailDialogContextValue } from "../../contexts/ScheduledEmailDialogContext.js";
import {
    AUTOMATIONS_CONTEXT as SHARED_AUTOMATIONS_CONTEXT,
    CURRENT_USER as SHARED_CURRENT_USER,
    NEXT_FILTER as SHARED_NEXT_FILTER,
    SENTINEL_CHANNEL as SHARED_SENTINEL_CHANNEL,
    SENTINEL_WIDGET as SHARED_SENTINEL_WIDGET,
    WORKSPACE_PARAMETER as SHARED_WORKSPACE_PARAMETER,
} from "../../tests/shared.test.helpers.js";
import { type IScheduledExportDataContextValue } from "../state/ScheduledExportDataContext.js";
import { type IScheduledExportDraftContextValue } from "../state/ScheduledExportDraftContext.js";

export const AUTOMATIONS_CONTEXT = SHARED_AUTOMATIONS_CONTEXT;
export const CURRENT_USER = SHARED_CURRENT_USER;
export const NEXT_FILTER = SHARED_NEXT_FILTER;
export const SENTINEL_CHANNEL = SHARED_SENTINEL_CHANNEL;
export const WORKSPACE_PARAMETER = SHARED_WORKSPACE_PARAMETER;

export const SENTINEL_WIDGET: IWidget = {
    ...SHARED_SENTINEL_WIDGET,
    insight: idRef("insight-1", "insight"),
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
    isTimezoneFeatureEnabled: false,
    canSelectScheduleTimezone: false,
    scheduleTimezoneSelection: { id: undefined, shouldSave: false },
    defaultResolvedTimezone: undefined,
    scheduleTimezoneIsStale: false,
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
