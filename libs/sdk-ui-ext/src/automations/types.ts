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
    timezone?: string;
    selectedColumnDefinitions?: Array<AutomationColumnDefinition>;
    preselectedFilters?: AutomationsPreselectedFilters;
    maxHeight?: number;
    pageSize?: number;
    type?: AutomationsType;
    isSmall?: boolean;
    invalidateItemsRef?: AutomationsInvalidateItemsRef;
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
    | "menu"
    | "state";

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
export type AutomationsFilterName = "dashboard" | "createdBy" | "recipients" | "status";

/**
 * Preselected filters
 * @internal
 */
export type AutomationsPreselectedFilters = Partial<Record<AutomationsFilterName, Array<string>>>;

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

/**
 * Ref to invalidate items from outside the component
 * @internal
 */
export type AutomationsInvalidateItemsRef = React.MutableRefObject<(() => void) | undefined>;

export interface IAutomationsCoreProps {
    type: AutomationsType;
    timezone?: string;
    selectedColumnDefinitions?: Array<AutomationColumnDefinition>;
    preselectedFilters: AutomationsPreselectedFilters;
    maxHeight: number;
    pageSize: number;
    isSmall: boolean;
    invalidateItemsRef?: AutomationsInvalidateItemsRef;
    dashboardUrlBuilder: IDashboardUrlBuilder;
    widgetUrlBuilder: IWidgetUrlBuilder;
    editAutomation: IEditAutomation;
}

export interface FilterOptionsContextValue {
    workspaceUsers: IWorkspaceUser[];
    dashboards: IListedDashboard[];
    wokspaceUsersLoading: boolean;
    dashboardsLoading: boolean;
}

export interface UserContextValue {
    canManageAutomation: (automation: IAutomationMetadataObject) => boolean;
    isSubscribedToAutomation: (automation: IAutomationMetadataObject) => boolean;
    isCurrentUserByLogin: (userLogin: string) => boolean;
    canPauseAutomation: (automation: IAutomationMetadataObject) => boolean;
    canResumeAutomation: (automation: IAutomationMetadataObject) => boolean;
}

export interface IAutomationsState {
    automations: IAutomationMetadataObject[];
    totalItemsCount: number;
    hasNextPage: boolean;
    page: number;
    search: string;
    selectedIds: Set<string>;
    sortBy: keyof IAutomationMetadataObject;
    sortDirection: SortDirection;
    invalidationId: number;
    scrollToIndex?: number;
    isChainedActionInProgress: boolean;
    pendingAction?: IAutomationsPendingAction;
}

export interface IAutomationsPendingAction {
    type: AutomationsPendingActionType;
    automationsType: AutomationsType;
    automationTitle?: string;
    onConfirm: () => void;
}

export type AutomationsPendingActionType =
    | "delete"
    | "unsubscribe"
    | "bulkDelete"
    | "bulkUnsubscribe"
    | "pause"
    | "resume"
    | "bulkPause"
    | "bulkResume";

export type CellValueType = "text" | "date" | "number";
