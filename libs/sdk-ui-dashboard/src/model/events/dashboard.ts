// (C) 2021-2023 GoodData Corporation

import { IInsight, ObjRef, IDashboard, IWorkspacePermissions } from "@gooddata/sdk-model";
import { IExportBlobResult } from "@gooddata/sdk-backend-spi";

import { DateFilterValidationResult, ISharingProperties } from "../../types.js";
import { DashboardConfig, DashboardContext } from "../types/commonTypes.js";

import { IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

//
//
//

/**
 * Payload of the {@link DashboardInitialized} event.
 * @public
 */
export interface DashboardInitializedPayload {
    /**
     * Loaded dashboard.
     */
    readonly dashboard?: IDashboard;

    /**
     * Insights used on the dashboard.
     */
    readonly insights: ReadonlyArray<IInsight>;

    /**
     * Configuration in effect for the dashboard.
     *
     * @remarks
     * If the config was provided via props, then
     * that same config is sent here. If there was no config in props, then the dashboard component load resolved
     * all the config and includes it here.
     */
    readonly config: DashboardConfig;

    /**
     * Permissions in effect for the dashboard.
     *
     * @remarks
     * If the permissions were provided via props, then those
     * same permissions are included here. Otherwise the dashboard will load the permissions and include it here.
     */
    readonly permissions: IWorkspacePermissions;
}

/**
 * This event is emitted when a dashboard is successfully initialized.
 *
 * @remarks
 * The event contains contextual information such as the resolved DashboardConfig and the permissions in effect
 * for the current user and current workspace.
 *
 * If the initialization loaded an existing, persisted dashboard then the dashboard object will be included in
 * the event.
 *
 * If the initialization created a new, empty dashboard then dashboard object will be undefined.
 *
 * @public
 */
export interface DashboardInitialized extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INITIALIZED";
    readonly payload: DashboardInitializedPayload;
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
 * @public
 */
export const isDashboardInitialized = eventGuard<DashboardInitialized>("GDC.DASH/EVT.INITIALIZED");

//
//
//

/**
 * Payload of the {@link DashboardDeinitialized} event.
 * @public
 */
export interface DashboardDeinitializedPayload {
    /**
     * Reference of the dashboard being deinitialized (if the dashboard being deinitialized had one i.e. contained a persisted dashboard object).
     */
    dashboard: ObjRef | undefined;
}

/**
 * This event is emitted when a dashboard is deinitialized. The event contains contextual information such as
 * the ref of dashboard being deinitialized if the dashboard being deinitialized contained a persisted dashboard object.
 *
 * @remarks
 * This event is useful when your application switches between different dashboards (similar to what the Dashboards application does)
 * and you want to handle that. Note that this event WILL NOT be fired when navigating to a completely different
 * application/site in the browser or closing the tab etc., if you want to handle that, you need to do it yourself
 * using the appropriate events on the Window object.
 *
 * @public
 */
export interface DashboardDeinitialized extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DEINITIALIZED";
    readonly payload: DashboardDeinitializedPayload;
}

export function dashboardDeinitialized(
    ctx: DashboardContext,
    dashboard: ObjRef | undefined,
    correlationId?: string,
): DashboardDeinitialized {
    return {
        type: "GDC.DASH/EVT.DEINITIALIZED",
        ctx,
        correlationId,
        payload: {
            dashboard,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDeinitialized}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardDeinitialized = eventGuard<DashboardDeinitialized>("GDC.DASH/EVT.DEINITIALIZED");

//
//
//

/**
 * Payload of the {@link DashboardSaved} event.
 * @public
 */
export interface DashboardSavedPayload {
    /**
     * Definition of the saved dashboard.
     */
    readonly dashboard: IDashboard;

    /**
     * If true, this was the initial save and thus a new dashboard object was created.
     * If false, an existing dashboard was updated.
     */
    readonly newDashboard: boolean;
}

/**
 * This event is emitted at the end of successful dashboard save command processing. At this point, the
 * dashboard state is persisted on the backend.
 *
 * @public
 */
export interface DashboardSaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SAVED";
    readonly payload: DashboardSavedPayload;
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
 * @public
 */
export const isDashboardSaved = eventGuard<DashboardSaved>("GDC.DASH/EVT.SAVED");

//
//
//

/**
 * Payload of the {@link DashboardCopySaved} event.
 * @public
 */
export interface DashboardCopySavedPayload {
    /**
     * Definition of the newly created dashboard copy.
     */
    readonly dashboard: IDashboard;

    /**
     * Flag describing whether a locked dashboard was copied.
     */
    readonly isOriginalDashboardLocked: boolean;
}

/**
 * This event is emitted at the end of successful 'dashboard save as' command processing.
 *
 * @remarks
 * At this point, a new dashboard exists on the backend.
 *
 * @public
 */
export interface DashboardCopySaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COPY_SAVED";
    readonly payload: DashboardCopySavedPayload;
}

export function dashboardCopySaved(
    ctx: DashboardContext,
    dashboard: IDashboard,
    isOriginalDashboardLocked: boolean,
    correlationId?: string,
): DashboardCopySaved {
    return {
        type: "GDC.DASH/EVT.COPY_SAVED",
        ctx,
        correlationId,
        payload: {
            dashboard,
            isOriginalDashboardLocked,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardCopySaved}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardCopySaved = eventGuard<DashboardCopySaved>("GDC.DASH/EVT.COPY_SAVED");

//
//
//

/**
 * Payload of the {@link DashboardRenamed} event.
 * @beta
 */
export interface DashboardRenamedPayload {
    /**
     * The new title of the dashboard.
     */
    readonly newTitle: string;
}

/**
 * This event is emitted at the end of successful 'dashboard rename' command processing. At this point, only the
 * in-memory title is changed and the changes are not saved on the backend.
 *
 * @beta
 */
export interface DashboardRenamed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENAMED";
    readonly payload: DashboardRenamedPayload;
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
 * @beta
 */
export const isDashboardRenamed = eventGuard<DashboardRenamed>("GDC.DASH/EVT.RENAMED");

//
//
//

/**
 * Payload of the {@link DashboardWasReset} event.
 * @beta
 */
export interface DashboardWasResetPayload {
    /**
     * Persisted state to which the dashboard was reset. If a new (not yet saved) dashboard was reset
     * then this property will be undefined.
     */
    dashboard?: IDashboard;
}

/**
 * This event is emitted at the end of successful 'dashboard reset' command processing. At this point, the
 * dashboard is reset to the state it was after initial load.
 *
 * @beta
 */
export interface DashboardWasReset extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RESET";
    readonly payload: DashboardWasResetPayload;
}

export function dashboardWasReset(
    ctx: DashboardContext,
    dashboard: IDashboard | undefined,
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
 * @beta
 */
export const isDashboardWasReset = eventGuard<DashboardWasReset>("GDC.DASH/EVT.RESET");

//
//
//

/**
 * Payload of the {@link DashboardDeleted} event.
 * @beta
 */
export interface DashboardDeletedPayload {
    /**
     * Dashboard that was deleted.
     */
    readonly dashboard: IDashboard;
}

/**
 * This event is emitted at the end of successful 'dashboard delete' command processing. At this point,
 * the dashboard no longer exist on the backend and the component is reset to a state when it shows
 * an empty dashboard.
 *
 * @beta
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
 * @beta
 */
export const isDashboardDeleted = eventGuard<DashboardDeleted>("GDC.DASH/EVT.DELETED");

//
//
//

/**
 * Payload of the {@link DateFilterValidationFailed} event.
 * @public
 */
export interface DateFilterValidationFailedPayload {
    /**
     * Result of the date filter validation.
     */
    readonly result: DateFilterValidationResult;
}

/**
 * This event may occur while the dashboard is handling the Load Dashboard command and is loading and validating
 * dashboard configuration from the backend.
 *
 * @remarks
 * Part of that process is obtaining workspace's Date Filter configuration. If the date filter config stored in
 * workspace has issues, then this event will occur.
 *
 * Note that this event is not a show stopper. The dashboard load will recover and fall back to a safe date
 * filter configuration.
 *
 * @public
 */
export interface DateFilterValidationFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.VALIDATION.FAILED";
    readonly payload: DateFilterValidationFailedPayload;
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
 * @beta
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
 * @beta
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
 * @beta
 */
export const isDashboardExportToPdfRequested = eventGuard<DashboardExportToPdfRequested>(
    "GDC.DASH/EVT.EXPORT.PDF.REQUESTED",
);

/**
 * Payload of the {@link DashboardExportToPdfResolved} event.
 * @beta
 */
export interface DashboardExportToPdfResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    readonly resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    readonly result: IExportBlobResult;
}

/**
 * This event is emitted at the end of successful 'dashboard export to PDF' command processing.
 * In its payload, there is an uri of the resulting PDF file.
 *
 * @beta
 */
export interface DashboardExportToPdfResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED";
    readonly payload: DashboardExportToPdfResolvedPayload;
}

export function dashboardExportToPdfResolved(
    ctx: DashboardContext,
    result: IExportBlobResult,
    correlationId?: string,
): DashboardExportToPdfResolved {
    return {
        type: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri: result.uri,
            result,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToPdfResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPdfResolved = eventGuard<DashboardExportToPdfResolved>(
    "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link DashboardSharingChanged} event.
 * @public
 */
export interface DashboardSharingChangedPayload {
    /**
     * New properties related to the sharing.
     */
    newSharingProperties: ISharingProperties;
}

/**
 * This event is emitted at the end of successful 'change sharing status of dashboard' command processing.
 *
 * @public
 */
export interface DashboardSharingChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SHARING.CHANGED";
    readonly payload: DashboardSharingChangedPayload;
}

export function dashboardSharingChanged(
    ctx: DashboardContext,
    newSharingProperties: ISharingProperties,
    correlationId?: string,
): DashboardSharingChanged {
    return {
        type: "GDC.DASH/EVT.SHARING.CHANGED",
        ctx,
        correlationId,
        payload: {
            newSharingProperties,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardSharingChanged}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardSharingChanged = eventGuard<DashboardSharingChanged>("GDC.DASH/EVT.SHARING.CHANGED");
