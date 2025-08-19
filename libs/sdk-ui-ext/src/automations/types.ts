// (C) 2025 GoodData Corporation

import { AutomationType, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    IAutomationMetadataObject,
    IListedDashboard,
    IWorkspaceUser,
    SortDirection,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IAutomationsProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
    locale?: string;
    selectedColumnDefinitions?: Array<AutomationColumnDefinition>;
    preselectedFilters?: AutomationsPreselectedFilters;
    maxHeight?: number;
    pageSize?: number;
    type?: AutomationsType;
    isSmall?: boolean;
    dashboardUrlBuilder?: IDashboardUrlBuilder;
    automationUrlBuilder?: IAutomationUrlBuilder;
    widgetUrlBuilder?: IWidgetUrlBuilder;
    editAutomation?: (
        automation: IAutomationMetadataObject,
        workspaceId: string,
        dashboardId: string,
    ) => void;
}

/**
 * @internal
 */
export interface IDashboardUrlBuilder {
    (workspaceId: string, dashboardId: string): string;
}

/**
 * @internal
 */
export interface IWidgetUrlBuilder {
    (workspaceId: string, dashboardId: string, widgetId: string): string;
}

/**
 * @internal
 */
export interface IAutomationUrlBuilder {
    (workspaceId: string, dashboardId: string, automationId: string): string;
}

export interface IEditAutomation {
    (automation: IAutomationMetadataObject, workspaceId: string, dashboardId: string): void;
}

/**
 * @internal
 */
export type AutomationsType = Extract<AutomationType, "alert" | "schedule">;

/**
 * Common automation columns available for all automation types
 * @internal
 */
export type CommonAutomationsColumnName =
    | "id"
    | "title"
    | "dashboard"
    | "recipients"
    | "lastRun"
    | "lastRunStatus"
    | "createdBy"
    | "createdAt"
    | "notificationChannel"
    | "workspace"
    | "menu";

/**
 * Schedule-specific automation column names
 * @internal
 */
export type ScheduleAutomationsColumnName = "source" | "frequency" | "nextRun" | "attachments";

/**
 * Alert-specific automation column names
 * @internal
 */
export type AlertAutomationsColumnName = "widget";

/**
 * Automation filter names
 * @internal
 */
export type AutomationsFilterName = "dashboard" | "createdBy" | "recipients";

/**
 * Preselected filters
 * @internal
 */
export type AutomationsPreselectedFilters = Partial<Record<AutomationsFilterName, string>>;

/**
 * All available automation column names
 * @internal
 */
export type AutomationsColumnName =
    | CommonAutomationsColumnName
    | ScheduleAutomationsColumnName
    | AlertAutomationsColumnName;

/**
 * Automation column definition
 * @internal
 */
export type AutomationColumnDefinition = {
    name: AutomationsColumnName;
    width?: number;
};

/**
 * Common automation filters available for all automation types
 * @internal
 */
export type AutomationsFilter = "dashboard" | "createdBy" | "recipients" | "state" | "workspace";

export interface IAutomationsCoreProps {
    type: AutomationsType;
    selectedColumnDefinitions?: Array<AutomationColumnDefinition>;
    preselectedFilters: AutomationsPreselectedFilters;
    maxHeight: number;
    pageSize: number;
    isSmall: boolean;
    dashboardUrlBuilder: IDashboardUrlBuilder;
    widgetUrlBuilder: IWidgetUrlBuilder;
    editAutomation: IEditAutomation;
}

export interface FilterOptionsContextValue {
    workspaceUsers: IWorkspaceUser[];
    dashboards: IListedDashboard[];
}

export interface UserContextValue {
    canManageAutomation: (automation: IAutomationMetadataObject) => boolean;
    isSubscribedToAutomation: (automation: IAutomationMetadataObject) => boolean;
    isCurrentUserByLogin: (userLogin: string) => boolean;
}

export interface IAutomationsState {
    automations: IAutomationMetadataObject[];
    totalItemsCount: number;
    hasNextPage: boolean;
    page: number;
    search: string;
    selectedIds: Array<string>;
    sortBy: keyof IAutomationMetadataObject;
    sortDirection: SortDirection;
    invalidationId: number;
    scrollToIndex?: number;
    isChainedActionInProgress: boolean;
}

export type CellValueType = "text" | "date" | "number";
