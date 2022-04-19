// (C) 2022 GoodData Corporation

import { IDashboardCommand } from "./base";
import { RenderMode } from "../../types";

/**
 * Payload of the {@link ChangeRenderMode} command.
 * @internal
 */
export interface ChangeRenderModePayload {
    readonly renderMode: RenderMode;
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function changeRenderMode(renderMode: RenderMode, correlationId?: string): ChangeRenderMode {
    return {
        type: "GDC.DASH/CMD.CHANGE_RENDER_MODE",
        correlationId,
        payload: {
            renderMode,
        },
    };
}
