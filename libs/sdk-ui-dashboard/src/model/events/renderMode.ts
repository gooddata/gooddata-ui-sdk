// (C) 2022-2026 GoodData Corporation

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type RenderMode } from "../../types.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IDashboardRenderModeChanged} event.
 * @beta
 */
export interface IDashboardRenderModeChangedPayload {
    /**
     * Current render mode value
     */
    renderMode: RenderMode;
}

/**
 * This event is emitted after render mode change.
 *
 * @beta
 */
export interface IDashboardRenderModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER_MODE.CHANGED";
    readonly payload: IDashboardRenderModeChangedPayload;
}

/**
 * @beta
 */
export function renderModeChanged(
    ctx: DashboardContext,
    renderMode: RenderMode,
    correlationId?: string,
): IDashboardRenderModeChanged {
    return {
        type: "GDC.DASH/EVT.RENDER_MODE.CHANGED",
        ctx,
        correlationId,
        payload: {
            renderMode,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardRenderModeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardRenderModeChanged = eventGuard<IDashboardRenderModeChanged>(
    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
);
