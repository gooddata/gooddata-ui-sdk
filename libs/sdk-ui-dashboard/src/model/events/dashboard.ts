// (C) 2021 GoodData Corporation

import { IDashboard, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";

import { DateFilterConfigValidationResult } from "../../_staging/dateFilterConfig/validation";
import { DashboardConfig, DashboardContext } from "../types/commonTypes";

import { IDashboardEvent } from "./base";
import { eventGuard } from "./util";

//
//
//

/**
 * This event is emitted when a dashboard is successfully initialized. The event contains contextual information
 * such as the resolved DashboardConfig and the permissions in effect for the current user and current workspace.
 *
 * If the initialization loaded an existing, persisted dashboard then the dashboard object will be included in
 * the event.
 *
 * If the initialization created a new, empty dashboard then dashboard object will be undefined.
 *
 * @alpha
 */
export interface DashboardInitialized extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INITIALIZED";
    readonly payload: {
        /**
         * Loaded dashboard.
         */
        readonly dashboard?: IDashboard;

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

export function dashboardInitialized(
    ctx: DashboardContext,
    dashboard: IDashboard | undefined,
    insights: IInsight[],
    config: DashboardConfig,
    permissions: IWorkspacePermissions,
    correlationId?: string,
): DashboardInitialized {
    return {
        type: "GDC.DASH/EVT.INITIALIZED",
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

/**
 * Tests whether the provided object is an instance of {@link DashboardInitialized}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardInitialized = eventGuard<DashboardInitialized>("GDC.DASH/EVT.INITIALIZED");

//
//
//

/**
 * This event is emitted at the end of successful dashboard save command processing. At this point, the
 * dashboard state is persisted on the backend.
 *
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DashboardSaved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardSaved = eventGuard<DashboardSaved>("GDC.DASH/EVT.SAVED");

//
//
//

/**
 * This event is emitted at the end of successful 'dashboard save as' command processing. At this point, a new
 * dashboard exists on the backend.
 *
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DashboardCopySaved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardCopySaved = eventGuard<DashboardCopySaved>("GDC.DASH/EVT.COPY_SAVED");

//
//
//

/**
 * This event is emitted at the end of successful 'dashboard rename' command processing. At this point, only the
 * in-memory title is changed and the changes are not saved on the backend.
 *
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DashboardRenamed}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardRenamed = eventGuard<DashboardRenamed>("GDC.DASH/EVT.RENAMED");

//
//
//

/**
 * This event is emitted at the end of successful 'dashboard reset' command processing. At this point, the
 * dashboard is reset to the state it was after initial load.
 *
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DashboardWasReset}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardWasReset = eventGuard<DashboardWasReset>("GDC.DASH/EVT.RESET");

//
//
//

/**
 * This event is emitted at the end of successful 'dashboard delete' command processing. At this point,
 * the dashboard no longer exist on the backend and the component is reset to a state when it shows
 * an empty dashboard.
 *
 * @alpha
 */
export interface DashboardDeleted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DELETED";
    readonly payload: {
        /**
         * Dashboard that was deleted.
         */
        readonly dashboard: IDashboard;
    };
}

export function dashboardDeleted(
    ctx: DashboardContext,
    dashboard: IDashboard,
    correlationId?: string,
): DashboardDeleted {
    return {
        type: "GDC.DASH/EVT.DELETED",
        ctx,
        correlationId,
        payload: {
            dashboard,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDeleted}
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDeleted = eventGuard<DashboardDeleted>("GDC.DASH/EVT.DELETED");

//
//
//

/**
 * @alpha
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
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DateFilterValidationFailed}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDateFilterValidationFailed = eventGuard<DateFilterValidationFailed>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.VALIDATION.FAILED",
);

//
//
//

/**
 * This event is emitted at the start of the 'dashboard export to PDF' command processing.
 *
 * @alpha
 */
export interface DashboardExportToPdfRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF.REQUESTED";
}

export function dashboardExportToPdfRequested(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardExportToPdfRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.PDF.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToPdfRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardExportToPdfRequested = eventGuard<DashboardExportToPdfRequested>(
    "GDC.DASH/EVT.EXPORT.PDF.REQUESTED",
);

/**
 * This event is emitted at the end of successful 'dashboard export to PDF' command processing.
 * In its payload, there is an uri of the resulting PDF file.
 *
 * @alpha
 */
export interface DashboardExportToPdfResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED";
    readonly payload: {
        /**
         * URI of the resulting file that can be used to download it.
         */
        readonly resultUri: string;
    };
}

export function dashboardExportToPdfResolved(
    ctx: DashboardContext,
    resultUri: string,
    correlationId?: string,
): DashboardExportToPdfResolved {
    return {
        type: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToPdfResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardExportToPdfResolved = eventGuard<DashboardExportToPdfResolved>(
    "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
);
