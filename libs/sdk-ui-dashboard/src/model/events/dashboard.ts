// (C) 2021-2026 GoodData Corporation

import { type IExportResult } from "@gooddata/sdk-backend-spi";
import { type IDashboard, type IInsight, type IWorkspacePermissions, type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DateFilterValidationResult, type ISharingProperties } from "../../types.js";
import { type DashboardConfig, type DashboardContext } from "../types/commonTypes.js";

//
//
//

/**
 * Payload of the {@link DashboardInitialized} event.
 * @public
 */
export type DashboardInitializedPayload = {
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
     * same permissions are included here. Otherwise, the dashboard will load the permissions and include it here.
     */
    readonly permissions: IWorkspacePermissions;
};

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
export type DashboardInitialized = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.INITIALIZED";
    readonly payload: DashboardInitializedPayload;
};

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
export type DashboardDeinitializedPayload = {
    /**
     * Reference of the dashboard being deinitialized (if the dashboard being deinitialized had one i.e. contained a persisted dashboard object).
     */
    dashboard: ObjRef | undefined;
};

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
export type DashboardDeinitialized = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.DEINITIALIZED";
    readonly payload: DashboardDeinitializedPayload;
};

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
export type DashboardSavedPayload = {
    /**
     * Definition of the saved dashboard.
     */
    readonly dashboard: IDashboard;

    /**
     * If true, this was the initial save and thus a new dashboard object was created.
     * If false, an existing dashboard was updated.
     */
    readonly newDashboard: boolean;
};

/**
 * This event is emitted at the end of successful dashboard save command processing. At this point, the
 * dashboard state is persisted on the backend.
 *
 * @public
 */
export type DashboardSaved = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.SAVED";
    readonly payload: DashboardSavedPayload;
};

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
export type DashboardCopySavedPayload = {
    /**
     * Definition of the newly created dashboard copy.
     */
    readonly dashboard: IDashboard;

    /**
     * Flag describing whether a locked dashboard was copied.
     */
    readonly isOriginalDashboardLocked: boolean;
};

/**
 * This event is emitted at the end of successful 'dashboard save as' command processing.
 *
 * @remarks
 * At this point, a new dashboard exists on the backend.
 *
 * @public
 */
export type DashboardCopySaved = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.COPY_SAVED";
    readonly payload: DashboardCopySavedPayload;
};

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
 * Payload of the {@link IDashboardRenamed} event.
 * @beta
 */
export interface IDashboardRenamedPayload {
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
export interface IDashboardRenamed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENAMED";
    readonly payload: IDashboardRenamedPayload;
}

export function dashboardRenamed(
    ctx: DashboardContext,
    newTitle: string,
    correlationId?: string,
): IDashboardRenamed {
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
 * Tests whether the provided object is an instance of {@link IDashboardRenamed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardRenamed = eventGuard<IDashboardRenamed>("GDC.DASH/EVT.RENAMED");

//
//
//

/**
 * Payload of the {@link IDashboardWasReset} event.
 * @beta
 */
export interface IDashboardWasResetPayload {
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
export interface IDashboardWasReset extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RESET";
    readonly payload: IDashboardWasResetPayload;
}

export function dashboardWasReset(
    ctx: DashboardContext,
    dashboard: IDashboard | undefined,
    correlationId?: string,
): IDashboardWasReset {
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
 * Tests whether the provided object is an instance of {@link IDashboardWasReset}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardWasReset = eventGuard<IDashboardWasReset>("GDC.DASH/EVT.RESET");

//
//
//

/**
 * Payload of the {@link IDashboardDeleted} event.
 * @beta
 */
export interface IDashboardDeletedPayload {
    /**
     * Dashboard that was deleted.
     */
    readonly dashboard: IDashboard;
}

/**
 * This event is emitted at the end of successful 'dashboard delete' command processing. At this point,
 * the dashboard no longer exist on the backend and the component are reset to a state when it shows
 * an empty dashboard.
 *
 * @beta
 */
export interface IDashboardDeleted extends IDashboardEvent {
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
): IDashboardDeleted {
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
 * Tests whether the provided object is an instance of {@link IDashboardDeleted}
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDeleted = eventGuard<IDashboardDeleted>("GDC.DASH/EVT.DELETED");

//
//
//

/**
 * Payload of the {@link DateFilterValidationFailed} event.
 * @public
 */
export type DateFilterValidationFailedPayload = {
    /**
     * Result of the date filter validation.
     */
    readonly result: DateFilterValidationResult;
};

/**
 * This event may occur while the dashboard is handling the Load Dashboard command and is loading and validating
 * dashboard configuration from the backend.
 *
 * @remarks
 * Part of that process is obtaining workspace's Date Filter configuration. If the date filter config stored in
 * workspace has issues, then this event will occur.
 *
 * Note that this event is not a showstopper. The dashboard load will recover and fall back to a safe date
 * filter configuration.
 *
 * @public
 */
export type DateFilterValidationFailed = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.VALIDATION.FAILED";
    readonly payload: DateFilterValidationFailedPayload;
};

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
export interface IDashboardExportToPdfRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF.REQUESTED";
}

export function dashboardExportToPdfRequested(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardExportToPdfRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.PDF.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToPdfRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPdfRequested = eventGuard<IDashboardExportToPdfRequested>(
    "GDC.DASH/EVT.EXPORT.PDF.REQUESTED",
);

/**
 * Payload of the {@link IDashboardExportToPdfResolved} event.
 * @beta
 */
export interface IDashboardExportToPdfResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    readonly resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    readonly result: IExportResult;
}

/**
 * This event is emitted at the end of successful 'dashboard export to PDF' command processing.
 * In its payload, there is a uri of the resulting PDF file.
 *
 * @beta
 */
export interface IDashboardExportToPdfResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED";
    readonly payload: IDashboardExportToPdfResolvedPayload;
}

export function dashboardExportToPdfResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): IDashboardExportToPdfResolved {
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
 * Tests whether the provided object is an instance of {@link IDashboardExportToPdfResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPdfResolved = eventGuard<IDashboardExportToPdfResolved>(
    "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
);

/**
 * This event is emitted at the start of the 'dashboard export to Excel' command processing.
 *
 * @beta
 */
export interface IDashboardExportToExcelRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.EXCEL.REQUESTED";
}

export function dashboardExportToExcelRequested(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardExportToExcelRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.EXCEL.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToExcelRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToExcelRequested = eventGuard<IDashboardExportToExcelRequested>(
    "GDC.DASH/EVT.EXPORT.EXCEL.REQUESTED",
);

/**
 * Payload of the {@link IDashboardExportToExcelResolved} event.
 * @beta
 */
export interface IDashboardExportToExcelResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    readonly resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    readonly result: IExportResult;
}

/**
 * This event is emitted at the end of successful 'dashboard export to Excel' command processing.
 * In its payload, there is a uri of the resulting XLS file.
 *
 * @beta
 */
export interface IDashboardExportToExcelResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.EXCEL.RESOLVED";
    readonly payload: IDashboardExportToExcelResolvedPayload;
}

export function dashboardExportToExcelResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): IDashboardExportToExcelResolved {
    return {
        type: "GDC.DASH/EVT.EXPORT.EXCEL.RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri: result.uri,
            result,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToExcelResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToExcelResolved = eventGuard<IDashboardExportToExcelResolved>(
    "GDC.DASH/EVT.EXPORT.EXCEL.RESOLVED",
);

//
//
//

/**
 * This event is emitted at the start of the 'dashboard export to PDF presentation' command processing.
 *
 * @beta
 */
export interface IDashboardExportToPdfPresentationRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.REQUESTED";
}

export function dashboardExportToPdfPresentationRequested(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardExportToPdfPresentationRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToPdfPresentationRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPdfPresentationRequested =
    eventGuard<IDashboardExportToPdfPresentationRequested>("GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.REQUESTED");

/**
 * Payload of the {@link IDashboardExportToPdfPresentationResolved} event.
 * @beta
 */
export interface IDashboardExportToPdfPresentationResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    readonly resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    readonly result: IExportResult;
}

/**
 * This event is emitted at the end of successful 'dashboard export to PDF presentation' command processing.
 * In its payload, there is a uri of the resulting PDF file.
 *
 * @beta
 */
export interface IDashboardExportToPdfPresentationResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.RESOLVED";
    readonly payload: IDashboardExportToExcelResolvedPayload;
}

export function dashboardExportToPdfPresentationResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): IDashboardExportToPdfPresentationResolved {
    return {
        type: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri: result.uri,
            result,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToPdfPresentationResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPdfPresentationResolved =
    eventGuard<IDashboardExportToPdfPresentationResolved>("GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.RESOLVED");

//
//
//

/**
 * This event is emitted at the start of the 'dashboard export to PPT presentation' command processing.
 *
 * @beta
 */
export interface IDashboardExportToPptPresentationRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.REQUESTED";
}

export function dashboardExportToPptPresentationRequested(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardExportToPptPresentationRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToPptPresentationRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPptPresentationRequested =
    eventGuard<IDashboardExportToPptPresentationRequested>("GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.REQUESTED");

/**
 * Payload of the {@link IDashboardExportToPptPresentationResolved} event.
 * @beta
 */
export interface IDashboardExportToPptPresentationResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    readonly resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    readonly result: IExportResult;
}

/**
 * This event is emitted at the end of successful 'dashboard export to PPT presentation' command processing.
 * In its payload, there is a uri of the resulting PDF file.
 *
 * @beta
 */
export interface IDashboardExportToPptPresentationResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.RESOLVED";
    readonly payload: IDashboardExportToExcelResolvedPayload;
}

export function dashboardExportToPptPresentationResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): IDashboardExportToPptPresentationResolved {
    return {
        type: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri: result.uri,
            result,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToPptPresentationResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPptPresentationResolved =
    eventGuard<IDashboardExportToPptPresentationResolved>("GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.RESOLVED");

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToPptPresentationResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToImageResolved = eventGuard<IDashboardExportToImageResolved>(
    "GDC.DASH/EVT.EXPORT.IMAGE.RESOLVED",
);

/**
 * Tests whether the provided object is an instance of {@link IDashboardExportToPptPresentationRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToImageRequested = eventGuard<IDashboardExportToImageRequested>(
    "GDC.DASH/EVT.EXPORT.IMAGE.REQUESTED",
);

/**
 * Payload of the {@link IDashboardExportToPptPresentationResolved} event.
 * @beta
 */
export interface IDashboardExportToImageResolvedPayload {
    /**
     * URI of the resulting file that can be used to download it.
     */
    readonly resultUri: string;
    /**
     * Collection of information used to download the resulting file.
     */
    readonly result: IExportResult;
}

/**
 * This event is emitted at the start of the 'dashboard export to image' command processing.
 *
 * @beta
 */
export interface IDashboardExportToImageRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.IMAGE.REQUESTED";
}

export function dashboardExportToImageRequested(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardExportToImageRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.IMAGE.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * This event is emitted at the end of successful 'dashboard export to image' command processing.
 * In its payload, there is a uri of the resulting image file.
 *
 * @beta
 */
export interface IDashboardExportToImageResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.IMAGE.RESOLVED";
    readonly payload: IDashboardExportToImageResolvedPayload;
}

export function dashboardExportToImageResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): IDashboardExportToImageResolved {
    return {
        type: "GDC.DASH/EVT.EXPORT.IMAGE.RESOLVED",
        ctx,
        correlationId,
        payload: {
            resultUri: result.uri,
            result,
        },
    };
}

//
//
//

/**
 * Payload of the {@link DashboardSharingChanged} event.
 * @public
 */
export type DashboardSharingChangedPayload = {
    /**
     * New properties related to the sharing.
     */
    newSharingProperties: ISharingProperties;
};

/**
 * This event is emitted at the end of successful 'change sharing status of dashboard' command processing.
 *
 * @public
 */
export type DashboardSharingChanged = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.SHARING.CHANGED";
    readonly payload: DashboardSharingChangedPayload;
};

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

/**
 * Payload of the {@link IDashboardIgnoreExecutionTimestampChanged} event.
 * @alpha
 */
export interface IDashboardIgnoreExecutionTimestampChangedPayload {
    /**
     * New ignore execution timestamp value.
     */
    ignoreExecutionTimestamp: boolean;
}

/**
 * This event is emitted at the end of successful 'change ignore execution timestamp' command processing.
 *
 * When executionTimestamp is provided to the dashboard, each execution is using this timestamp. This event instructs the
 * application to react on the ignore flag for execution timestamp in all following executions.
 *
 * @alpha
 */
export interface IDashboardIgnoreExecutionTimestampChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.IGNORE_EXECUTION_TIMESTAMP_CHANGED";
    readonly payload: IDashboardIgnoreExecutionTimestampChangedPayload;
}

export function dashboardIgnoreExecutionTimestampChanged(
    ctx: DashboardContext,
    ignoreExecutionTimestamp: boolean,
    correlationId?: string,
): IDashboardIgnoreExecutionTimestampChanged {
    return {
        type: "GDC.DASH/EVT.IGNORE_EXECUTION_TIMESTAMP_CHANGED",
        ctx,
        correlationId,
        payload: {
            ignoreExecutionTimestamp,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardIgnoreExecutionTimestampChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardIgnoreExecutionTimestampChanged =
    eventGuard<IDashboardIgnoreExecutionTimestampChanged>("GDC.DASH/EVT.IGNORE_EXECUTION_TIMESTAMP_CHANGED");
