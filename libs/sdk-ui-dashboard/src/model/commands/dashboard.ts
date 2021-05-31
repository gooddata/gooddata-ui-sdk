// (C) 2021 GoodData Corporation

import { DashboardConfig } from "../types/commonTypes";
import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { IDashboardCommand } from "./base";

/**
 * The initial load of the dashboard will use this correlation id.
 *
 * @internal
 */
export const InitialLoadCorrelationId = "initialLoad";

/**
 * Loads dashboard from analytical backend.
 *
 * @internal
 */
export interface LoadDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.LOAD";
    readonly payload: {
        readonly config?: DashboardConfig;
        readonly permissions?: IWorkspacePermissions;
    };
}

/**
 * Creates the LoadDashboard command. Dispatching this command will result in the load of all
 * the essential data from the backend and initializing the state of Dashboard to a point where the
 * dashboard can be rendered.
 *
 * @param config - optionally specify configuration to use for for the Dashboard; you MAY provide partial configuration.
 *  During the LoadDashboard processing the Dashboard component will resolve all the missing parts by reading them
 *  from the backend.
 * @param permissions - optionally specify permissions to use when determining whether the user is eligible for some
 *  actions with the dashboard; if you do not specify permissions Dashboard component will load the permissions
 *  from the backend.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @internal
 */
export function loadDashboard(
    config?: DashboardConfig,
    permissions?: IWorkspacePermissions,
    correlationId?: string,
): LoadDashboard {
    return {
        type: "GDC.DASH/CMD.LOAD",
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
 * @internal
 */
export interface SaveDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SAVE";
    readonly payload: {
        readonly identifier?: string;
    };
}

/**
 * Creates the SaveDashboard command. Dispatching this command will result in persisting all the accumulated
 * dashboard modification to backend.
 *
 * The command will not have any effect if dashboard is not initialized or is empty.
 *
 * @param identifier - optionally specify identifier to set for the saved dashboard. If specified, the
 *  identifier will be used only during the initial save of a new dashboard. When the SaveDashboard is called
 *  of a dashboard that already exists on a backend, then the identifier will be ignored. If no identifier
 *  is specified for the initial save, then the identifier will be generated.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @internal
 */
export function saveDashboard(identifier?: string, correlationId?: string): SaveDashboard {
    return {
        type: "GDC.DASH/CMD.SAVE",
        correlationId,
        payload: {
            identifier,
        },
    };
}

//
//
//

/**
 * @internal
 */
export interface SaveDashboardAs extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SAVEAS";
    readonly payload: {
        readonly identifier?: string;
        readonly title?: string;
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
 * @param identifier - identifier to assign to the newly created dashboard; if not specified a random identifier
 *  will be generated
 * @param title - new title for the dashboard; if not specified, the title of original dashboard will be used
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @internal
 */
export function saveDashboardAs(
    identifier?: string,
    title?: string,
    correlationId?: string,
): SaveDashboardAs {
    return {
        type: "GDC.DASH/CMD.SAVEAS",
        correlationId,
        payload: {
            identifier,
            title,
        },
    };
}

//
//
//

/**
 * @internal
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
 * @internal
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
 * @internal
 */
export interface ResetDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RESET";
}

/**
 * Creates the ResetDashboard command. Dispatching this command will result in dropping all in-memory modifications
 * of the dashboard and reverting to a state after the initial LoadCommand.
 *
 * Note: reset dashboard will not reload dashboard data from backend.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function resetDashboard(correlationId?: string): ResetDashboard {
    return {
        type: "GDC.DASH/CMD.RESET",
        correlationId,
    };
}
