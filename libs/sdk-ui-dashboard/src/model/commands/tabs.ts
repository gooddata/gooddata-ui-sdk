// (C) 2025 GoodData Corporation

import { IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link SwitchDashboardTab} command.
 * @alpha
 */
export interface SwitchDashboardTabPayload {
    /**
     * Identifier of the tab to switch to.
     */
    readonly tabId: string;
}

/**
 * Command to switch to a different dashboard tab.
 *
 * @remarks
 * This command will:
 * - Save the current layout and filter context to the currently active tab
 * - Switch to the specified tab
 * - Load the new tab's layout and filter context into the main dashboard state
 *
 * @alpha
 */
export interface SwitchDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.SWITCH";
    readonly payload: SwitchDashboardTabPayload;
}

/**
 * Creates the SwitchDashboardTab command.
 *
 * @param tabId - identifier of the tab to switch to
 * @param correlationId - specify correlation id to use for this command
 * @returns switch dashboard tab command
 *
 * @alpha
 */
export function switchDashboardTab(tabId: string, correlationId?: string): SwitchDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.SWITCH",
        correlationId,
        payload: {
            tabId,
        },
    };
}

/**
 * Command to reposition a dashboard tab.
 *
 * @remarks
 * This command will:
 * - Reorder the tabs in the dashboard to reflect the new position of the tab
 *
 * @alpha
 */
export interface RepositionDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.REPOSITION";
    readonly payload: RepositionDashboardTabPayload;
}

/**
 * Payload of the {@link RepositionDashboardTab} command.
 * @alpha
 */
export interface RepositionDashboardTabPayload {
    /**
     * Old index of the tab before the reposition.
     */
    readonly oldIndex: number;
    /**
     * New index of the tab after the reposition.
     */
    readonly newIndex: number;
}

/**
 * Creates the RepositionDashboardTab command.
 *
 * @param oldIndex - old index of the tab before the reposition
 * @param newIndex - new index of the tab after the reposition
 * @param correlationId - specify correlation id to use for this command
 * @returns reposition dashboard tab command
 *
 * @alpha
 */
export function repositionDashboardTab(
    oldIndex: number,
    newIndex: number,
    correlationId?: string,
): RepositionDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.REPOSITION",
        correlationId,
        payload: {
            oldIndex,
            newIndex,
        },
    };
}
