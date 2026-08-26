// (C) 2026 GoodData Corporation

import {
    type FilterContextItem,
    type IInsightWidget,
    type INotificationChannelIdentifier,
    type IUser,
    idRef,
} from "@gooddata/sdk-model";

import { type IAutomationsContextValue } from "../contexts/AutomationsContext.js";

import { workspaceStringParameter } from "./parameterFixtures.test.helpers.js";

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
export const SENTINEL_WIDGET: IInsightWidget = {
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

// A catalog parameter with a matching workspace definition, so a stored `{ref, value}` override
// survives reconstruction instead of being dropped as unresolvable.
export const WORKSPACE_PARAMETER = workspaceStringParameter("param-1", "Param 1", "default");

export const NEXT_FILTER: FilterContextItem = {
    attributeFilter: {
        localIdentifier: "f1",
        displayForm: idRef("df1"),
        negativeSelection: false,
        attributeElements: { uris: ["/e1"] },
    },
};

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
