// (C) 2025 GoodData Corporation

import { Dispatch, MutableRefObject, SetStateAction } from "react";

import {
    AutomationFilterType,
    AutomationType,
    IAnalyticalBackend,
    IAutomationsQueryResult,
    IWorkspaceDescriptor,
} from "@gooddata/sdk-backend-spi";
import {
    IAutomationMetadataObject,
    IListedDashboard,
    IOrganizationUser,
    IUser,
    IWorkspacePermissions,
    IWorkspaceUser,
    SortDirection,
} from "@gooddata/sdk-model";
import { IDashboardUrlBuilder, IWidgetUrlBuilder } from "@gooddata/sdk-ui";
import { UiAsyncTableFilter } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IAutomationsProps {
    backend?: IAnalyticalBackend;
    scope: AutomationsScope;
    workspace?: string;
    organization?: string;
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
    widgetUrlBuilder?: IWidgetUrlBuilder;
    editAutomation?: (
        automation: IAutomationMetadataObject,
        workspaceId: string,
        dashboardId: string,
    ) => void;
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
export type AutomationsFilterName = "dashboard" | "createdBy" | "recipients" | "status" | "workspace";

/**
 * Automation scope
 * @internal
 */
export type AutomationsScope = "workspace" | "organization";

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
export type AutomationsInvalidateItemsRef = MutableRefObject<(() => void) | undefined>;

export interface IAutomationsCoreProps {
    type: AutomationsType;
    scope: AutomationsScope;
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
    workspaceUsers: IWorkspaceUser[] | IOrganizationUser[];
    dashboards: IListedDashboard[];
    workspaces: IWorkspaceDescriptor[];
    wokspaceUsersLoading: boolean;
    dashboardsLoading: boolean;
    workspacesLoading: boolean;
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

export interface IAutomationActionsState {
    deletedAutomation: IAutomationMetadataObject | undefined;
    bulkDeletedAutomations: Array<IAutomationMetadataObject>;
    unsubscribedAutomation: IAutomationMetadataObject | undefined;
    bulkUnsubscribedAutomations: Array<IAutomationMetadataObject>;
    pausedAutomation: IAutomationMetadataObject | undefined;
    bulkPausedAutomations: Array<IAutomationMetadataObject>;
    resumedAutomation: IAutomationMetadataObject | undefined;
    bulkResumedAutomations: Array<IAutomationMetadataObject>;
}

export interface IAutomationsPendingAction {
    type: AutomationsPendingActionType;
    automationsType: AutomationsType;
    automationTitle?: string;
    onConfirm: () => void;
}

export interface IUseLoadAutomationsProps {
    type: AutomationsType;
    pageSize: number;
    state: IAutomationsState;
    dashboardFilterQuery: IAutomationFilterQuery;
    recipientsFilterQuery: IAutomationFilterQuery;
    workspacesFilterQuery: IAutomationFilterQuery;
    statusFilterQuery: IAutomationFilterQuery;
    includeAutomationResult: boolean;
    scope: AutomationsScope;
    setState: Dispatch<SetStateAction<IAutomationsState>>;
}

export interface IUseAutomationBulkActionsProps {
    selected: IAutomationMetadataObject[];
    automationsType: AutomationsType;
    bulkDeleteAutomations: AutomationBulkAction;
    bulkUnsubscribeFromAutomations: AutomationBulkAction;
    bulkPauseAutomations: AutomationBulkAction;
    bulkResumeAutomations: AutomationBulkAction;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}

export interface IUseAutomationColumnsProps {
    type: AutomationsType;
    timezone?: string;
    columnDefinitions: Array<AutomationColumnDefinition>;
    automationsType: AutomationsType;
    deleteAutomation: AutomationAction;
    unsubscribeFromAutomation: AutomationAction;
    pauseAutomation: AutomationAction;
    resumeAutomation: AutomationAction;
    dashboardUrlBuilder: IDashboardUrlBuilder;
    widgetUrlBuilder: IWidgetUrlBuilder;
    editAutomation: IEditAutomation;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}

export type AutomationAction = (automation: IAutomationMetadataObject) => void;
export type AutomationBulkAction = (automations: Array<IAutomationMetadataObject>) => void;

export interface IAutomationActions {
    deleteAutomation: AutomationAction;
    bulkDeleteAutomations: AutomationBulkAction;
    unsubscribeFromAutomation: AutomationAction;
    bulkUnsubscribeFromAutomations: AutomationBulkAction;
    pauseAutomation: AutomationAction;
    bulkPauseAutomations: AutomationBulkAction;
    resumeAutomation: AutomationAction;
    bulkResumeAutomations: AutomationBulkAction;
    isLoading: boolean;
}

export type AutomationActionPromise = (automation: IAutomationMetadataObject) => Promise<void>;
export type AutomationBulkActionPromise = (automations: Array<IAutomationMetadataObject>) => Promise<void>;
export interface IAutomationService {
    promiseGetAutomationsQuery: (params?: IAutomationsQueryParams) => Promise<IAutomationsQueryResult>;
    promiseGetCurrentUser: () => Promise<IUser>;
    promiseCanManageWorkspace: () => Promise<IWorkspacePermissions>;
    promiseGetUsers: () => Promise<IWorkspaceUser[] | IOrganizationUser[]>;
    promiseGetDashboards: () => Promise<IListedDashboard[]>;
    promiseGetWorkspaces: () => Promise<IWorkspaceDescriptor[]>;
    promiseDeleteAutomation: AutomationActionPromise;
    promiseDeleteAutomations: AutomationBulkActionPromise;
    promiseUnsubscribeAutomation: AutomationActionPromise;
    promiseUnsubscribeAutomations: AutomationBulkActionPromise;
    promisePauseAutomation: AutomationActionPromise;
    promisePauseAutomations: AutomationBulkActionPromise;
    promiseResumeAutomation: AutomationActionPromise;
    promiseResumeAutomations: AutomationBulkActionPromise;
}

export interface IAutomationsQueryParams {
    includeAutomationResult?: boolean;
    pageSize?: number;
    page?: number;
    search?: string;
    dashboardFilterQuery?: IAutomationFilterQuery;
    recipientsFilterQuery?: IAutomationFilterQuery;
    workspacesFilterQuery?: IAutomationFilterQuery;
    statusFilterQuery?: IAutomationFilterQuery;
    sortBy?: string;
    sortDirection?: SortDirection;
    type?: AutomationsType;
}

export interface IAutomationFilterQuery {
    value: string;
    type?: AutomationFilterType;
}

export interface IAutomationFilter {
    filter: UiAsyncTableFilter;
    query: IAutomationFilterQuery;
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
