// (C) 2021-2025 GoodData Corporation

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
    readonly result: IExportResult;
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
    result: IExportResult,
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

/**
 * This event is emitted at the start of the 'dashboard export to Excel' command processing.
 *
 * @beta
 */
export interface DashboardExportToExcelRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.EXCEL.REQUESTED";
}

export function dashboardExportToExcelRequested(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardExportToExcelRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.EXCEL.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToExcelRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToExcelRequested = eventGuard<DashboardExportToExcelRequested>(
    "GDC.DASH/EVT.EXPORT.EXCEL.REQUESTED",
);

/**
 * Payload of the {@link DashboardExportToExcelResolved} event.
 * @beta
 */
export interface DashboardExportToExcelResolvedPayload {
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
 * In its payload, there is an uri of the resulting XLS file.
 *
 * @beta
 */
export interface DashboardExportToExcelResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.EXCEL.RESOLVED";
    readonly payload: DashboardExportToExcelResolvedPayload;
}

export function dashboardExportToExcelResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): DashboardExportToExcelResolved {
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
 * Tests whether the provided object is an instance of {@link DashboardExportToExcelResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToExcelResolved = eventGuard<DashboardExportToExcelResolved>(
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
export interface DashboardExportToPdfPresentationRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.REQUESTED";
}

export function dashboardExportToPdfPresentationRequested(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardExportToPdfPresentationRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToPdfPresentationRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPdfPresentationRequested =
    eventGuard<DashboardExportToPdfPresentationRequested>("GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.REQUESTED");

/**
 * Payload of the {@link DashboardExportToPdfPresentationResolved} event.
 * @beta
 */
export interface DashboardExportToPdfPresentationResolvedPayload {
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
 * In its payload, there is an uri of the resulting PDF file.
 *
 * @beta
 */
export interface DashboardExportToPdfPresentationResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.RESOLVED";
    readonly payload: DashboardExportToExcelResolvedPayload;
}

export function dashboardExportToPdfPresentationResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): DashboardExportToPdfPresentationResolved {
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
 * Tests whether the provided object is an instance of {@link DashboardExportToPdfPresentationResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPdfPresentationResolved =
    eventGuard<DashboardExportToPdfPresentationResolved>("GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.RESOLVED");

//
//
//

/**
 * This event is emitted at the start of the 'dashboard export to PPT presentation' command processing.
 *
 * @beta
 */
export interface DashboardExportToPptPresentationRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.REQUESTED";
}

export function dashboardExportToPptPresentationRequested(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardExportToPptPresentationRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToPptPresentationRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPptPresentationRequested =
    eventGuard<DashboardExportToPptPresentationRequested>("GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.REQUESTED");

/**
 * Payload of the {@link DashboardExportToPptPresentationResolved} event.
 * @beta
 */
export interface DashboardExportToPptPresentationResolvedPayload {
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
 * In its payload, there is an uri of the resulting PDF file.
 *
 * @beta
 */
export interface DashboardExportToPptPresentationResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.RESOLVED";
    readonly payload: DashboardExportToExcelResolvedPayload;
}

export function dashboardExportToPptPresentationResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): DashboardExportToPptPresentationResolved {
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
 * Tests whether the provided object is an instance of {@link DashboardExportToPptPresentationResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToPptPresentationResolved =
    eventGuard<DashboardExportToPptPresentationResolved>("GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.RESOLVED");

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToPptPresentationResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToImageResolved = eventGuard<DashboardExportToImageResolved>(
    "GDC.DASH/EVT.EXPORT.IMAGE.RESOLVED",
);

/**
 * Tests whether the provided object is an instance of {@link DashboardExportToPptPresentationRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardExportToImageRequested = eventGuard<DashboardExportToImageRequested>(
    "GDC.DASH/EVT.EXPORT.IMAGE.REQUESTED",
);

/**
 * Payload of the {@link DashboardExportToPptPresentationResolved} event.
 * @beta
 */
export interface DashboardExportToImageResolvedPayload {
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
export interface DashboardExportToImageRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.IMAGE.REQUESTED";
}

export function dashboardExportToImageRequested(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardExportToImageRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.IMAGE.REQUESTED",
        ctx,
        correlationId,
    };
}

/**
 * This event is emitted at the end of successful 'dashboard export to image' command processing.
 * In its payload, there is an uri of the resulting image file.
 *
 * @beta
 */
export interface DashboardExportToImageResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.IMAGE.RESOLVED";
    readonly payload: DashboardExportToImageResolvedPayload;
}

export function dashboardExportToImageResolved(
    ctx: DashboardContext,
    result: IExportResult,
    correlationId?: string,
): DashboardExportToImageResolved {
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

/**
 * Payload of the {@link DashboardIgnoreExecutionTimestampChanged} event.
 * @alpha
 */
export interface DashboardIgnoreExecutionTimestampChangedPayload {
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
export interface DashboardIgnoreExecutionTimestampChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.IGNORE_EXECUTION_TIMESTAMP_CHANGED";
    readonly payload: DashboardIgnoreExecutionTimestampChangedPayload;
}

export function dashboardIgnoreExecutionTimestampChanged(
    ctx: DashboardContext,
    ignoreExecutionTimestamp: boolean,
    correlationId?: string,
): DashboardIgnoreExecutionTimestampChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardIgnoreExecutionTimestampChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardIgnoreExecutionTimestampChanged =
    eventGuard<DashboardIgnoreExecutionTimestampChanged>("GDC.DASH/EVT.IGNORE_EXECUTION_TIMESTAMP_CHANGED");
