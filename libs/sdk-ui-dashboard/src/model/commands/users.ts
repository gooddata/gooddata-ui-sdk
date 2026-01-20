// (C) 2021-2026 GoodData Corporation

import { type IDashboardCommand } from "./base.js";

/**
 * Loads all workspace users.
 *
 * @internal
 */
export interface ILoadAllWorkspaceUsers extends IDashboardCommand {
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
export function loadAllWorkspaceUsers(correlationId?: string): ILoadAllWorkspaceUsers {
    return {
        type: "GDC.DASH/CMD.USERS.LOAD_ALL",
        correlationId,
    };
}
