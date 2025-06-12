// (C) 2021-2024 GoodData Corporation
import { IDashboardCommand } from "./base.js";

/**
 * Loads all workspace users.
 *
 * @internal
 */
export interface LoadAllWorkspaceUsers extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.USERS.LOAD_ALL";
}

/**
 * Creates the LoadAllWorkspaceUsers command.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function loadAllWorkspaceUsers(correlationId?: string): LoadAllWorkspaceUsers {
    return {
        type: "GDC.DASH/CMD.USERS.LOAD_ALL",
        correlationId,
    };
}
