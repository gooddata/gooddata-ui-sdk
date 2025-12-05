// (C) 2025 GoodData Corporation

import { Dispatch, MutableRefObject, ReactNode, SetStateAction } from "react";

import {
    AutomationFilterType,
    AutomationType,
    IAnalyticalBackend,
    IAutomationsQueryResult,
    IWorkspaceDescriptor,
} from "@gooddata/sdk-backend-spi";
import {
    IAutomationLastRunStatus,
    IAutomationMetadataObject,
    IAutomationState,
    IListedDashboard,
    IOrganizationUser,
    IUser,
    IWorkspacePermissions,
    IWorkspaceUser,
    SortDirection,
} from "@gooddata/sdk-model";
import { IDashboardUrlBuilder, IWidgetUrlBuilder } from "@gooddata/sdk-ui";
import {
    IconType,
    UiAsyncTableBulkAction,
    UiAsyncTableColumn,
    UiAsyncTableFilter,
    UiAsyncTableVariant,
} from "@gooddata/sdk-ui-kit";

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
    selectedColumnDefinitions?: AutomationColumnDefinitions;
    availableFilters?: AutomationsAvailableFilters;
    preselectedFilters?: AutomationsPreselectedFilters;
    maxHeight?: number;
    pageSize?: number;
    type?: AutomationsType;
    tableVariant?: UiAsyncTableVariant;
    isMobileView?: boolean;
    enableBulkActions?: boolean;
    invalidateItemsRef?: AutomationsInvalidateItemsRef;
    onInvalidateCallbackChange?: (callback: (() => void) | undefined) => void;
    renderToolbarCustomElement?: () => ReactNode;
    onLoad?: AutomationsOnLoad;
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
 * Callback function to be called when automations are loaded
 * @internal
 */
export type AutomationsOnLoad = (items: Array<IAutomationMetadataObject>, isInitial: boolean) => void;

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
    | "state"
    | "widget";

/**
 * Schedule-specific automation column names
 * @internal
 */
export type ScheduleAutomationsColumnName = "nextRun" | "attachments";

/**
 * Automation filter names
 * @internal
 */
export type AutomationsFilterName = "dashboard" | "workspace" | "createdBy" | "recipients" | "status";

/**
 * Automation filter preselect names
 * @internal
 */
export type AutomationsFilterPreselectName = AutomationsFilterName | "externalRecipients";

/**
 * Automation filter preselect value
 * @internal
 */
export type AutomationsFilterPreselectValue = {
    value: string;
    label?: string;
};

/**
 * Automation scope
 * @internal
 */
export type AutomationsScope = "workspace" | "organization";

/**
 * Preselected filters configuration
 * @internal
 */
export type AutomationsPreselectedFilters = Partial<
    Record<AutomationsFilterPreselectName, Array<AutomationsFilterPreselectValue>>
>;

/**
 * Available filters configuration
 * @internal
 */
export type AutomationsAvailableFilters = Array<AutomationsFilterName>;

/**
 * All available automation column names
 * @internal
 */
export type AutomationsColumnName = CommonAutomationsColumnName | ScheduleAutomationsColumnName;

/**
 * Automation column definition
 * @internal
 */
export type AutomationColumnDefinition = {
    name: AutomationsColumnName;
    width?: number;
    minWidth?: number;
};

/**
 * Automation column definitions
 * @internal
 */
export type AutomationColumnDefinitions = Array<AutomationColumnDefinition>;

/**
 * Ref to invalidate items from outside the component
 * @internal
 */
export type AutomationsInvalidateItemsRef = MutableRefObject<(() => void) | undefined>;

export interface IAutomationsCoreProps {
    type: AutomationsType;
    scope: AutomationsScope;
    timezone?: string;
    selectedColumnDefinitions: AutomationColumnDefinitions;
    availableFilters: AutomationsAvailableFilters;
    preselectedFilters: AutomationsPreselectedFilters;
    maxHeight: number;
    pageSize: number;
    tableVariant: UiAsyncTableVariant;
    isMobileView?: boolean;
    enableBulkActions: boolean;
    invalidateItemsRef?: AutomationsInvalidateItemsRef;
    onInvalidateCallbackChange?: (callback: (() => void) | undefined) => void;
    locale: string;
    renderToolbarCustomElement?: () => ReactNode;
    dashboardUrlBuilder: IDashboardUrlBuilder;
    widgetUrlBuilder: IWidgetUrlBuilder;
    editAutomation: IEditAutomation;
    onLoad?: AutomationsOnLoad;
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
    previousAutomations: IAutomationMetadataObject[];
    previousTotalItemsCount: number;
    hasNextPage: boolean;
    page: number;
    search: string;
    selectedIds: Set<string>;
    sortBy: keyof IAutomationMetadataObject;
    sortDirection: SortDirection;
    invalidationId: number;
    scrollToIndex?: number;
    isChainedActionInProgress: boolean;
    isFiltersTooLarge: boolean;
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
    externalRecipientsFilterQuery: IAutomationFilterQuery;
    workspacesFilterQuery: IAutomationFilterQuery;
    statusFilterQuery: IAutomationFilterQuery;
    createdByFilterQuery: IAutomationFilterQuery;
    includeAutomationResult: boolean;
    scope: AutomationsScope;
    setState: Dispatch<SetStateAction<IAutomationsState>>;
    onLoad?: AutomationsOnLoad;
}

export interface IUseAutomationBulkActionsProps {
    selected: IAutomationMetadataObject[];
    automationsType: AutomationsType;
    enabled: boolean;
    bulkDeleteAutomations: AutomationBulkAction;
    bulkUnsubscribeFromAutomations: AutomationBulkAction;
    bulkPauseAutomations: AutomationBulkAction;
    bulkResumeAutomations: AutomationBulkAction;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}

export interface IUseAutomationColumnsProps {
    type: AutomationsType;
    timezone?: string;
    selectedColumnDefinitions: AutomationColumnDefinitions;
    automationsType: AutomationsType;
    tableVariant: UiAsyncTableVariant;
    isMobileView?: boolean;
    enableBulkActions: boolean;
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
    externalRecipientsFilterQuery?: IAutomationFilterQuery;
    workspacesFilterQuery?: IAutomationFilterQuery;
    statusFilterQuery?: IAutomationFilterQuery;
    createdByFilterQuery?: IAutomationFilterQuery;
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

export type CellValueType = "text" | "date" | "slash-date" | "number";

export interface IUseAutomationsSmallLayoutProps {
    searchHandler: (search: string) => void;
    search?: string;
    availableBulkActions: UiAsyncTableBulkAction[];
    columnDefinitions: UiAsyncTableColumn<IAutomationMetadataObject>[];
    tableVariant: UiAsyncTableVariant;
    automationsLength?: number;
}

export interface ITooltipSection {
    header: string;
    content?: ReactNode;
    icon?: IconType;
    onIconClick?: () => void;
}

export interface IAutomationIconTooltipProps {
    header: string;
    content?: ReactNode;
    sections: ITooltipSection[];
    children: ReactNode;
    align?: string;
}

export interface IAutomationIconProps {
    type: AutomationsType | IAutomationLastRunStatus | "automationDetails";
    automation?: IAutomationMetadataObject;
    state?: IAutomationState;
    timezone?: string;
}
