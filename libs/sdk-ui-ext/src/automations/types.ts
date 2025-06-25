// (C) 2025 GoodData Corporation

import { AutomationType } from "@gooddata/sdk-backend-spi";
import { IListedDashboard, IUser, IWorkspaceUser } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

export interface FilterOptionsContextValue {
    currentUser: IUser | null;
    workspaceUsers: IWorkspaceUser[];
    dashboards: IListedDashboard[];
    dashboardsError: GoodDataSdkError | null;
    currentUserError: GoodDataSdkError | null;
    workspaceUsersError: GoodDataSdkError | null;
    isCurrentUser: (userLogin: string) => boolean;
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
    | "name"
    | "dashboard"
    | "state"
    | "recipients"
    | "lastSent"
    | "createdBy"
    | "createdAt"
    | "notificationChannel"
    | "workspace"
    | "menu";

/**
 * Schedule-specific automation column names
 * @internal
 */
export type ScheduleAutomationsColumnName =
    | "source"
    | "frequency"
    | "nextRun"
    | "lastRunStatus"
    | "attachments";

/**
 * Alert-specific automation column names
 * @internal
 */
export type AlertAutomationsColumnName = "widget";

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
