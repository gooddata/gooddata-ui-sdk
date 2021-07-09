// (C) 2021 GoodData Corporation

import { IDashboard, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";

import { DateFilterConfigValidationResult } from "../../_staging/dateFilterConfig/validation";
import { DashboardConfig, DashboardContext } from "../types/commonTypes";

import { IDashboardEvent } from "./base";

//
//
//

/**
 * This event is emitted when a dashboard is successfully loaded. It contains contextual information and then
 * the dashboard.
 *
 * @internal
 */
export interface DashboardLoaded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.LOADED";
    readonly payload: {
        /**
         * Loaded dashboard.
         */
        readonly dashboard: IDashboard;

        /**
         * Insights used on the dashboard.
         */
        readonly insights: ReadonlyArray<IInsight>;

        /**
         * Configuration in effect for the dashboard. If the config was provided via props, then
         * that same config is sent here. If there was no config in props, then the dashboard component load resolved
         * all the config and includes it here.
         */
        readonly config: DashboardConfig;

        /**
         * Permissions in effect for the dashboard. If the permissions were provided via props, then those
         * same permissions are included here. Otherwise the dashboard will load the permissions and include it here.
         */
        readonly permissions: IWorkspacePermissions;
    };
}

export function dashboardLoaded(
    ctx: DashboardContext,
    dashboard: IDashboard,
    insights: IInsight[],
    config: DashboardConfig,
    permissions: IWorkspacePermissions,
    correlationId?: string,
): DashboardLoaded {
    return {
        type: "GDC.DASH/EVT.LOADED",
        ctx,
        correlationId,
        payload: {
            dashboard,
            insights,
            config,
            permissions,
        },
    };
}

//
//
//

/**
 * This event is emitted at the end of successful dashboard save command processing. At this point, the
 * dashboard state is persisted on the backend.
 *
 * @internal
 */
export interface DashboardSaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SAVED";
    readonly payload: {
        /**
         * Definition of the saved dashboard.
         */
        readonly dashboard: IDashboard;

        /**
         * Indicates whether this was the initial save and thus a new dashboard object was created or whether
         * an existing dashboard was updated.
         */
        readonly newDashboard: boolean;
    };
}

export function dashboardSaved(
    ctx: DashboardContext,
    dashboard: IDashboard,
    newDashboard: boolean,
    correlationId?: string,
): DashboardSaved {
    return {
        type: "GDC.DASH/EVT.SAVED",
        ctx,
        correlationId,
        payload: {
            dashboard,
            newDashboard,
        },
    };
}

//
//
//

/**
 * This event is emitted at the end of successful 'dashboard save as' command processing. At this point, a new
 * dashboard exists on the backend.
 *
 * @internal
 */
export interface DashboardCopySaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COPY_SAVED";
    readonly payload: {
        /**
         * Definition of the newly created dashboard copy.
         */
        readonly dashboard: IDashboard;
    };
}

export function dashboardCopySaved(
    ctx: DashboardContext,
    dashboard: IDashboard,
    correlationId?: string,
): DashboardCopySaved {
    return {
        type: "GDC.DASH/EVT.COPY_SAVED",
        ctx,
        correlationId,
        payload: {
            dashboard,
        },
    };
}

//
//
//

/**
 * This event is emitted at the end of successful 'dashboard rename' command processing. At this point, only the
 * in-memory title is changed and the changes are not saved on the backend.
 *
 * @internal
 */
export interface DashboardRenamed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENAMED";
    readonly payload: {
        /**
         * The new title of the dashboard.
         */
        readonly newTitle: string;
    };
}

export function dashboardRenamed(
    ctx: DashboardContext,
    newTitle: string,
    correlationId?: string,
): DashboardRenamed {
    return {
        type: "GDC.DASH/EVT.RENAMED",
        ctx,
        correlationId,
        payload: {
            newTitle,
        },
    };
}

//
//
//

/**
 * This event is emitted at the end of successful 'dashboard reset' command processing. At this point, the
 * dashboard is reset to the state it was after initial load.
 *
 * @internal
 */
export interface DashboardWasReset extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RESET";
    readonly payload: {
        dashboard: IDashboard;
    };
}

export function dashboardWasReset(
    ctx: DashboardContext,
    dashboard: IDashboard,
    correlationId?: string,
): DashboardWasReset {
    return {
        type: "GDC.DASH/EVT.RESET",
        ctx,
        correlationId,
        payload: {
            dashboard,
        },
    };
}

//
//
//

/**
 * @internal
 */
export type DateFilterValidationResult = "TOO_MANY_CONFIGS" | "NO_CONFIG" | DateFilterConfigValidationResult;

/**
 * This event may occur while the dashboard is handling the Load Dashboard command and is loading and validating
 * dashboard configuration from the backend.
 *
 * Part of that process is obtaining workspace's Date Filter configuration. If the date filter config stored in
 * workspace has issues, then this event will occur.
 *
 * Note that this event is not a show stopper. The dashboard load will recover and fall back to a safe date
 * filter configuration.
 *
 * @internal
 */
export interface DateFilterValidationFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.VALIDATION.FAILED";
    readonly payload: {
        readonly result: DateFilterValidationResult;
    };
}

export function dateFilterValidationFailed(
    ctx: DashboardContext,
    result: DateFilterValidationResult,
    correlationId?: string,
): DateFilterValidationFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.VALIDATION.FAILED",
        ctx,
        correlationId,
        payload: {
            result,
        },
    };
}
