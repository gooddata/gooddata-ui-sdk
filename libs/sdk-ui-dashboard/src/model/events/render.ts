// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

/**
 * This event is emitted as soon as the dashboard component is mounted,
 * and rendering of its content started.
 *
 * @alpha
 */
export interface DashboardRenderRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER.REQUESTED";
}

/**
 * @alpha
 */
export function renderRequested(ctx: DashboardContext, correlationId?: string): DashboardRenderRequested {
    return {
        type: "GDC.DASH/EVT.RENDER.REQUESTED",
        correlationId,
        ctx,
    };
}

/**
 * This event is emitted when a component on the dashboard requests async rendering.
 *
 * @alpha
 */
export interface DashboardAsyncRenderRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER.ASYNC.REQUESTED";
    readonly payload: {
        /**
         * Item identifier.
         */
        readonly id: string;
    };
}

/**
 * @alpha
 */
export function asyncRenderRequested(
    id: string,
    ctx: DashboardContext,
    correlationId?: string,
): DashboardAsyncRenderRequested {
    return {
        type: "GDC.DASH/EVT.RENDER.ASYNC.REQUESTED",
        correlationId,
        ctx,
        payload: {
            id,
        },
    };
}

/**
 * This event is emitted when a component on the dashboard resolves async rendering.
 *
 * @alpha
 */
export interface DashboardAsyncRenderResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER.ASYNC.RESOLVED";
    readonly payload: {
        /**
         * Item identifier.
         */
        readonly id: string;
    };
}

/**
 * @alpha
 */
export function asyncRenderResolved(
    id: string,
    ctx: DashboardContext,
    correlationId?: string,
): DashboardAsyncRenderResolved {
    return {
        type: "GDC.DASH/EVT.RENDER.ASYNC.RESOLVED",
        correlationId,
        ctx,
        payload: {
            id,
        },
    };
}

/**
 * @alpha
 */
export interface DashboardRenderResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER.RESOLVED";
}

/**
 * This event is emitted as soon as the dashboard component is fully rendered,
 * and asynchronous rendering of each component is complete.
 *
 * @alpha
 */
export function renderResolved(ctx: DashboardContext, correlationId?: string): DashboardRenderResolved {
    return {
        type: "GDC.DASH/EVT.RENDER.RESOLVED",
        correlationId,
        ctx,
    };
}
