// (C) 2021 GoodData Corporation

import { DashboardConfig } from "../types/commonTypes";
import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { IDashboardCommand } from "./base";

/**
 * The initial load of the dashboard will use this correlation id.
 *
 * @alpha
 */
export const InitialLoadCorrelationId = "initialLoad";

/**
 * Loads dashboard from analytical backend.
 *
 * @alpha
 */
export interface InitializeDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INITIALIZE";
    readonly payload: {
        readonly config?: DashboardConfig;
        readonly permissions?: IWorkspacePermissions;
    };
}

/**
 * Creates the InitializeDashboard command. Dispatching this command will result in the load of all
 * the essential data from the backend and initializing the state of Dashboard to a point where the
 * dashboard can be rendered.
 *
 * Note that the command takes the dashboard to initialize from context - from the properties of the Dashboard
 * component in which it runs:
 *
 * -  If Dashboard component is referencing an existing, persisted dashboard, then the dashboard will be loaded and
 *    rendered.
 *
 * -  If Dashboard component does not reference any dashboard, then the component will initialize for an empty
 *    dashboard with default filter setup.
 *
 * In both cases the essential configuration, permissions and additional metadata gets loaded from the backend.
 *
 * @param config - optionally specify configuration to use for for the Dashboard; you MAY provide partial configuration.
 *  During the LoadDashboard processing the Dashboard component will resolve all the missing parts by reading them
 *  from the backend.
 * @param permissions - optionally specify permissions to use when determining whether the user is eligible for some
 *  actions with the dashboard; if you do not specify permissions Dashboard component will load the permissions
 *  from the backend.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function initializeDashboard(
    config?: DashboardConfig,
    permissions?: IWorkspacePermissions,
    correlationId?: string,
): InitializeDashboard {
    return {
        type: "GDC.DASH/CMD.INITIALIZE",
        correlationId,
        payload: {
            config,
            permissions,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface SaveDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SAVE";
}

/**
 * Creates the SaveDashboard command. Dispatching this command will result in persisting all the accumulated
 * dashboard modification to backend.
 *
 * The command will not have any effect if dashboard is not initialized or is empty.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function saveDashboard(correlationId?: string): SaveDashboard {
    return {
        type: "GDC.DASH/CMD.SAVE",
        correlationId,
    };
}

//
//
//

/**
 * @alpha
 */
export interface SaveDashboardAs extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SAVEAS";
    readonly payload: {
        /**
         * Specify new title for the dashboard that will be created during the Save As operation.
         */
        readonly title?: string;

        /**
         * Indicate whether the dashboard component should switch to the copy of the dashboard or whether
         * it should stay on the current dashboard.
         */
        readonly switchToCopy?: boolean;

        /**
         * Indicates whether new dashboard should use the original filter context or whether to use the one
         * with current filter selection.
         */
        readonly useOriginalFilterContext?: boolean;
    };
}

/**
 * Creates the SaveDashboardAs command. Dispatching this command will result in creation of a copy of the
 * current dashboard. The copy will reflect the current state of the dashboard including any modifications done
 * on top of the original dashboard.
 *
 * Upon success, a copy of the dashboard will be persisted on the backend. The context of the dashboard component
 * that processed the command is unchanged - it still works with the original dashboard.
 *
 * @param title - new title for the dashboard; if not specified, the title of original dashboard will be used
 * @param switchToCopy - optionally indicate whether the dashboard component should switch to the dashboard that will
 *  be created during save-as; the default is false
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *  @param useOriginalFilterContext - optionally indicate whether new dashboard should use original filter context
 *  or the one with current filter selection.
 * @alpha
 */
export function saveDashboardAs(
    title?: string,
    switchToCopy?: boolean,
    useOriginalFilterContext?: boolean,
    correlationId?: string,
): SaveDashboardAs {
    return {
        type: "GDC.DASH/CMD.SAVEAS",
        correlationId,
        payload: {
            title,
            switchToCopy,
            useOriginalFilterContext,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface RenameDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RENAME";
    readonly payload: {
        readonly newTitle: string;
    };
}

/**
 * Creates the RenameDashboard command. Dispatching this command will result in rename of the dashboard. The changes
 * will be done only in-memory and have to be flushed to backend using the SaveDashboard command.
 *
 * @param newTitle - new dashboard title
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function renameDashboard(newTitle: string, correlationId?: string): RenameDashboard {
    return {
        type: "GDC.DASH/CMD.RENAME",
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
 * @alpha
 */
export interface ResetDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RESET";
}

/**
 * Creates the ResetDashboard command. Dispatching this command will result in dropping all in-memory modifications
 * of the dashboard and reverting to a state that is persisted on the backend. In other words reset will get
 * dashboard to a state after the last save.
 *
 * Note: if a dashboard is not saved on a backend, then reset will clear the dashboard to an empty state.
 *
 * Limitation: reset command will have no impact on alerts or scheduled emails. These entites are persisted outside
 * of the dashboard and have their own lifecycle.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function resetDashboard(correlationId?: string): ResetDashboard {
    return {
        type: "GDC.DASH/CMD.RESET",
        correlationId,
    };
}

//
//
//

/**
 * @alpha
 */
export interface DeleteDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DELETE";
}

/**
 * Creates the DeleteDashboard command. Dispatching this command will result in removal of the currently
 * rendered dashboard from analytical backend and reverting the dashboard component to an 'empty' state where
 * it is initialized to create a new dashboard.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function deleteDashboard(correlationId?: string): DeleteDashboard {
    return {
        type: "GDC.DASH/CMD.DELETE",
        correlationId,
    };
}

//
//
//

/**
 * @alpha
 */
export interface ExportDashboardToPdf extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXPORT.PDF";
}

/**
 * Creates the {@link ExportDashboardToPdf} command. Dispatching this command will result in a request to export
 * the dashboard to a PDF file. If successful, an instance of {@link DashboardExportToPdfResolved} will be emitted
 * with the URL of the resulting file.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function exportDashboardToPdf(correlationId?: string): ExportDashboardToPdf {
    return {
        type: "GDC.DASH/CMD.EXPORT.PDF",
        correlationId,
    };
}
