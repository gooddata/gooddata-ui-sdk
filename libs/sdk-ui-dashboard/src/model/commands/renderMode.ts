// (C) 2022-2026 GoodData Corporation

import { type IDashboardCommand } from "./base.js";
import { type RenderMode } from "../../types.js";

/**
 * @beta
 */
export interface IRenderModeChangeOptions {
    readonly resetDashboard: boolean;
}

/**
 * Payload of the {@link IChangeRenderMode} command.
 * @beta
 */
export interface IChangeRenderModePayload {
    readonly renderMode: RenderMode;
    readonly renderModeChangeOptions: IRenderModeChangeOptions;
}

/**
 * @beta
 */
export interface IChangeRenderMode extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.CHANGE_RENDER_MODE";
    readonly payload: IChangeRenderModePayload;
}

/**
 * Creates the ChangeRenderMode command. Dispatching this command will result in change of the render mode of dashboard component
 *
 * @param renderMode - render mode value
 * @param renderModeChangeOptions - options for render mode change
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeRenderMode(
    renderMode: RenderMode,
    renderModeChangeOptions: IRenderModeChangeOptions = { resetDashboard: true },
    correlationId?: string,
): IChangeRenderMode {
    return {
        type: "GDC.DASH/CMD.CHANGE_RENDER_MODE",
        correlationId,
        payload: {
            renderMode,
            renderModeChangeOptions,
        },
    };
}

/**
 * Creates the ChangeRenderMode command for switch to edit mode.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function switchToEditRenderMode(correlationId?: string): IChangeRenderMode {
    return changeRenderMode("edit", { resetDashboard: true }, correlationId);
}

/**
 * Creates the ChangeRenderMode command for cancel edit mode.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function cancelEditRenderMode(correlationId?: string): IChangeRenderMode {
    return changeRenderMode("view", { resetDashboard: true }, correlationId);
}
