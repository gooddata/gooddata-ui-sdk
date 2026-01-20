// (C) 2025-2026 GoodData Corporation

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link ISwitchDashboardTab} command.
 * @alpha
 */
export interface ISwitchDashboardTabPayload {
    /**
     * Identifier of the tab to switch to.
     */
    readonly tabId: string;
}

/**
 * Payload of the {@link IConvertDashboardTabFromDefault} command.
 *
 * @alpha
 */
export interface IConvertDashboardTabFromDefaultPayload {
    /**
     * Optional title for the new tab.
     */
    readonly title?: string;
}

/**
 * Command to convert a default dashboard tab into a regular tab.
 *
 * @remarks
 * This command will:
 * - Duplicate the default tab and create a new regular tab with the given title
 * - Remove the default tab
 *
 * @alpha
 */
export interface IConvertDashboardTabFromDefault extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.CONVERT_FROM_DEFAULT";
    readonly payload: IConvertDashboardTabFromDefaultPayload;
}

/**
 * Creates the ConvertDashboardTabFromDefault command.
 *
 * @param title - Optional title for the new tab.
 * @param correlationId - Specify correlation id to use for this command.
 * @returns Convert dashboard tab from default command.
 *
 * @alpha
 */
export function convertDashboardTabFromDefault(
    title?: string,
    correlationId?: string,
): IConvertDashboardTabFromDefault {
    return {
        type: "GDC.DASH/CMD.TAB.CONVERT_FROM_DEFAULT",
        correlationId,
        payload: { title },
    };
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
export interface ISwitchDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.SWITCH";
    readonly payload: ISwitchDashboardTabPayload;
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
export function switchDashboardTab(tabId: string, correlationId?: string): ISwitchDashboardTab {
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
export interface IRepositionDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.REPOSITION";
    readonly payload: IRepositionDashboardTabPayload;
}

/**
 * Payload of the {@link IRepositionDashboardTab} command.
 * @alpha
 */
export interface IRepositionDashboardTabPayload {
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
): IRepositionDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.REPOSITION",
        correlationId,
        payload: {
            oldIndex,
            newIndex,
        },
    };
}

/**
 * Payload of the {@link ICreateDashboardTab} command.
 * @alpha
 */
export interface ICreateDashboardTabPayload {
    /**
     * Optional title for the new tab. If not provided, empty title will be used.
     */
    readonly title?: string;
    /**
     * Optional index at which the new tab should be inserted. Defaults to the end of the list.
     */
    readonly index?: number;
    /**
     * Optional flag to indicate whether the new tab should be started in renaming mode.
     */
    readonly shouldStartRenaming?: boolean;
}

/**
 * Command to create a new dashboard tab.
 *
 * @remarks
 * This command will:
 * - Persist current main dashboard state (layout, filters, configs) into the currently active tab (if any)
 * - Create a new tab duplicating current main dashboard state
 * - Insert the tab at requested index (or append) and make it active
 *
 * @alpha
 */
export interface ICreateDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.CREATE";
    readonly payload: ICreateDashboardTabPayload;
}

/**
 * Creates the CreateDashboardTab command.
 *
 * @param title - optional title for the new tab
 * @param index - optional position to insert tab (defaults to end)
 * @param shouldStartRenaming - optional flag to indicate whether the new tab should be started in renaming mode
 * @param correlationId - specify correlation id to use for this command
 * @returns create dashboard tab command
 *
 * @alpha
 */
export function createDashboardTab(
    title?: string,
    index?: number,
    shouldStartRenaming?: boolean,
    correlationId?: string,
): ICreateDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.CREATE",
        correlationId,
        payload: {
            title,
            index,
            shouldStartRenaming,
        },
    };
}

/**
 * Payload of the {@link IDeleteDashboardTab} command.
 * @alpha
 */
export interface IDeleteDashboardTabPayload {
    /**
     * Identifier of the tab to delete.
     */
    readonly tabId: string;
}

/**
 * Command to delete a dashboard tab.
 *
 * @remarks
 * This command will:
 * - Remove the tab with the given identifier
 * - If the deleted tab is currently active, switch to the next available tab (or previous if next does not exist)
 * - If no tabs remain, clear the active tab
 *
 * @alpha
 */
export interface IDeleteDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.DELETE";
    readonly payload: IDeleteDashboardTabPayload;
}

/**
 * Creates the DeleteDashboardTab command.
 *
 * @param tabId - identifier of the tab to delete
 * @param correlationId - specify correlation id to use for this command
 * @returns delete dashboard tab command
 *
 * @alpha
 */
export function deleteDashboardTab(tabId: string, correlationId?: string): IDeleteDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.DELETE",
        correlationId,
        payload: {
            tabId,
        },
    };
}

/**
 * Payload of the {@link IStartRenamingDashboardTab} command.
 * @alpha
 */
export interface IStartRenamingDashboardTabPayload {
    /**
     * Optional identifier of the tab to start renaming. If not provided, the active tab is used.
     */
    readonly tabId?: string;
    /**
     * Optional flag to indicate whether the tab should be auto-selected before starting renaming.
     * Defaults to true.
     */
    readonly shouldSelectTab?: boolean;
}

/**
 * Command to start renaming mode for a tab.
 * @alpha
 */
export interface IStartRenamingDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.RENAME_MODE.START";
    readonly payload: IStartRenamingDashboardTabPayload;
}

/**
 * Creates the StartRenamingDashboardTab command.
 * @alpha
 */
export function startRenamingDashboardTab(
    tabId?: string,
    correlationId?: string,
    shouldSelectTab?: boolean,
): IStartRenamingDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.RENAME_MODE.START",
        correlationId,
        payload: { tabId, shouldSelectTab },
    };
}

/**
 * Payload of the {@link ICancelRenamingDashboardTab} command.
 * @alpha
 */
export interface ICancelRenamingDashboardTabPayload {
    /**
     * Optional identifier of the tab to cancel renaming. If not provided, the active tab is used.
     */
    readonly tabId?: string;
}

/**
 * Command to cancel renaming mode for a tab.
 * @alpha
 */
export interface ICancelRenamingDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.RENAME_MODE.CANCEL";
    readonly payload: ICancelRenamingDashboardTabPayload;
}

/**
 * Creates the CancelRenamingDashboardTab command.
 * @alpha
 */
export function cancelRenamingDashboardTab(
    tabId?: string,
    correlationId?: string,
): ICancelRenamingDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.RENAME_MODE.CANCEL",
        correlationId,
        payload: { tabId },
    };
}

/**
 * Payload of the {@link IRenameDashboardTab} command.
 * @alpha
 */
export interface IRenameDashboardTabPayload {
    /**
     * New title for the tab.
     */
    readonly title: string;
    /**
     * Optional identifier of the tab to rename. If not provided, the active tab is used.
     */
    readonly tabId?: string;
}

/**
 * Command to rename a dashboard tab.
 * @alpha
 */
export interface IRenameDashboardTab extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.TAB.RENAME";
    readonly payload: IRenameDashboardTabPayload;
}

/**
 * Creates the RenameDashboardTab command.
 * @alpha
 */
export function renameDashboardTab(
    title: string,
    tabId?: string,
    correlationId?: string,
): IRenameDashboardTab {
    return {
        type: "GDC.DASH/CMD.TAB.RENAME",
        correlationId,
        payload: { title, tabId },
    };
}
