// (C) 2021 GoodData Corporation
/**
 * All available command types.
 *
 * @internal
 */
export type DashboardCommandType =
    | "GDC.DASHBOARD.CMD.LOAD"
    | "GDC.DASHBOARD.CMD.SAVE"
    | "GDC.DASHBOARD.CMD.SAVEAS"
    | "GDC.DASHBOARD.CMD.RESET"
    | "GDC.DASHBOARD.CMD.RENAME"
    | "GDC.DASHBOARD.CMD.AF.ADD"
    | "GDC.DASHBOARD.CMD.AF.REMOVE"
    | "GDC.DASHBOARD.CMD.AF.MOVE"
    | "GDC.DASHBOARD.CMD.AF.CHANGE_SELECTION"
    | "GDC.DASHBOARD.CMD.AF.SET_PARENT";
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
    readonly type: DashboardCommandType;

    /**
     * Correlation ID can be provided when creating a command. All events emitted during the command processing
     * will contain the same correlation ID.
     *
     * If the correlation ID is not specified, a random string will be assigned.
     */
    readonly correlationId?: string;
}
