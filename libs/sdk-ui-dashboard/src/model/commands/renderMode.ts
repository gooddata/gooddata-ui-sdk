// (C) 2022 GoodData Corporation

import { IDashboardCommand } from "./base";
import { RenderMode } from "../../types";

/**
 * @internal
 */
export interface RenderModeChangeOptions {
    readonly resetDashboard: boolean;
}

/**
 * Payload of the {@link ChangeRenderMode} command.
 * @internal
 */
export interface ChangeRenderModePayload {
    readonly renderMode: RenderMode;
    readonly renderModeChangeOptions: RenderModeChangeOptions;
}

/**
 * @internal
 */
export interface ChangeRenderMode extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.CHANGE_RENDER_MODE";
    readonly payload: ChangeRenderModePayload;
}

/**
 * Creates the ChangeRenderMode command. Dispatching this command will result in change of the render mode of dashboard component
 *
 * @param renderMode - render mode value
 * @param renderModeChangeOptions - options for render mode change
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function changeRenderMode(
    renderMode: RenderMode,
    renderModeChangeOptions: RenderModeChangeOptions = { resetDashboard: true },
    correlationId?: string,
): ChangeRenderMode {
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
 * @internal
 */
export function switchToEditRenderMode(correlationId?: string): ChangeRenderMode {
    return changeRenderMode("edit", { resetDashboard: true }, correlationId);
}

/**
 * Creates the ChangeRenderMode command for cancel edit mode.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function cancelEditRenderMode(correlationId?: string): ChangeRenderMode {
    return changeRenderMode("view", { resetDashboard: true }, correlationId);
}
