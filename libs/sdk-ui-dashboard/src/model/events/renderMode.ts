// (C) 2022-2023 GoodData Corporation

import { IDashboardEvent } from "./base";
import { eventGuard } from "./util";
import { RenderMode } from "../../types";
import { DashboardContext } from "../types/commonTypes";

/**
 * Payload of the {@link DashboardRenderModeChanged} event.
 * @beta
 */
export interface DashboardRenderModeChangedPayload {
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
export interface DashboardRenderModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER_MODE.CHANGED";
    readonly payload: DashboardRenderModeChangedPayload;
}

/**
 * @beta
 */
export function renderModeChanged(
    ctx: DashboardContext,
    renderMode: RenderMode,
    correlationId?: string,
): DashboardRenderModeChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardRenderModeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardRenderModeChanged = eventGuard<DashboardRenderModeChanged>(
    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
);
