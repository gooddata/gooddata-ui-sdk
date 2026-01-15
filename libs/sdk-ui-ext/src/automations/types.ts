// (C) 2025-2026 GoodData Corporation

import { type Dispatch, type ReactNode, type SetStateAction } from "react";

import {
    type AutomationFilterType,
    type AutomationType,
    type IAnalyticalBackend,
    type IAutomationsQueryResult,
    type IWorkspaceDescriptor,
} from "@gooddata/sdk-backend-spi";
import {
    type IAutomationLastRunStatus,
    type IAutomationMetadataObject,
    type IAutomationState,
    type IListedDashboard,
    type IOrganizationUser,
    type IUser,
    type IWorkspacePermissions,
    type IWorkspaceUser,
    type SortDirection,
} from "@gooddata/sdk-model";
import { type IDashboardUrlBuilder, type IWidgetUrlBuilder } from "@gooddata/sdk-ui";
import {
    type IUiAsyncTableBulkAction,
    type IUiAsyncTableColumn,
    type IUiAsyncTableFilter,
    type IconType,
    type UiAsyncTableVariant,
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
    /**
     * External invalidation ID. When this value changes, the automations list will be reloaded.
     * This allows parent components to trigger a refresh without callback/ref patterns.
     * If not provided or set to 0, the automations list will not be reloaded.
     */
    externalInvalidationId?: number;
    renderToolbarCustomElement?: () => ReactNode;
    onLoad?: AutomationsOnLoad;
    dashboardUrlBuilder?: IDashboardUrlBuilder;
    widgetUrlBuilder?: IWidgetUrlBuilder;
    editAutomation?: IEditAutomation;
}

/**
 * @internal
 */
export interface IEditAutomation {
    (
        automation: IAutomationMetadataObject,
        workspaceId: string | undefined,
        dashboardId: string | undefined,
    ): void;
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
    externalInvalidationId?: number;
    locale: string;
    renderToolbarCustomElement?: () => ReactNode;
    dashboardUrlBuilder: IDashboardUrlBuilder;
    widgetUrlBuilder: IWidgetUrlBuilder;
    editAutomation: IEditAutomation;
    onLoad?: AutomationsOnLoad;
}

export interface IFilterOptionsContextValue {
    workspaceUsers: IWorkspaceUser[] | IOrganizationUser[];
    dashboards: IListedDashboard[];
    workspaces: IWorkspaceDescriptor[];
    wokspaceUsersLoading: boolean;
    dashboardsLoading: boolean;
    workspacesLoading: boolean;
}

export interface IUserContextValue {
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
    pendingAction?: IAutomationsPendingAction | null;
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
    promiseCanManageWorkspace: () => Promise<IWorkspacePermissions | undefined>;
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
    filter: IUiAsyncTableFilter;
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
    availableBulkActions: IUiAsyncTableBulkAction[] | undefined;
    columnDefinitions: IUiAsyncTableColumn<IAutomationMetadataObject>[];
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
