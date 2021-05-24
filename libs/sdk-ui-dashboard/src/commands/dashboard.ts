// (C) 2021 GoodData Corporation

/**
 * All available command types.
 *
 * @internal
 */
export type DashboardCommandType = "GDC.DASHBOARD.CMD.LOAD";

/**
 * Base type for all commands.
 *
 * Commands are dispatched using dispatcher obtained by useDashboardDispatcher(). All the dispatchers are 'contextual' -
 * they target backend, workspace and dashboard in depending on the Dashboard component tree from which the dispatch
 * is done.
 *
 * @internal
 */
export interface IDashboardCommand {
    /**
     * Command type. Always starts with "GDC.DASHBOARD.CMD"
     */
    type: DashboardCommandType;

    /**
     * Correlation ID can be provided when creating a command. All events emitted during the command processing
     * will contain the same correlation ID.
     *
     * If the correlation ID is not specified, a random string will be assigned.
     */
    correlationId?: string;
}

//
//
//

/**
 * Loads dashboard from analytical backend.
 *
 * @internal
 */
export interface LoadDashboard extends IDashboardCommand {
    type: "GDC.DASHBOARD.CMD.LOAD";
}

/**
 * Creates the LoadDashboard command.
 *
 * @param correlationId - optionally specify correlation id to use for this command
 * @internal
 */
export function loadDashboard(correlationId?: string): LoadDashboard {
    return {
        type: "GDC.DASHBOARD.CMD.LOAD",
        correlationId,
    };
}

//
//
//

/**
 * @internal
 */
export type DashboardCommands = LoadDashboard;
