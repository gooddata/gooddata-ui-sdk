// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../types/commonTypes.js";
import { IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * This event is emitted as soon as the dashboard component is mounted,
 * and rendering of its content started.
 *
 * @public
 */
export interface DashboardRenderRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER.REQUESTED";
}

/**
 * @public
 */
export function renderRequested(ctx: DashboardContext, correlationId?: string): DashboardRenderRequested {
    return {
        type: "GDC.DASH/EVT.RENDER.REQUESTED",
        correlationId,
        ctx,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardRenderRequested}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardRenderRequested = eventGuard<DashboardRenderRequested>(
    "GDC.DASH/EVT.RENDER.REQUESTED",
);

//
//
//

/**
 * Payload of the {@link DashboardAsyncRenderRequested} event.
 * @public
 */
export interface DashboardAsyncRenderRequestedPayload {
    /**
     * Item identifier.
     */
    readonly id: string;
}

/**
 * This event is emitted when a component on the dashboard requests async rendering.
 *
 * @public
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
 * @public
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
 * Tests whether the provided object is an instance of {@link DashboardAsyncRenderRequested}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardAsyncRenderRequested = eventGuard<DashboardAsyncRenderRequested>(
    "GDC.DASH/EVT.RENDER.ASYNC.REQUESTED",
);

//
//
//

/**
 * Payload of the {@link DashboardAsyncRenderResolved} event.
 * @public
 */
export interface DashboardAsyncRenderResolvedPayload {
    /**
     * Item identifier.
     */
    readonly id: string;
}

/**
 * This event is emitted when a component on the dashboard resolves async rendering.
 *
 * @public
 */
export interface DashboardAsyncRenderResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER.ASYNC.RESOLVED";
    readonly payload: DashboardAsyncRenderResolvedPayload;
}

/**
 * @public
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
 * Tests whether the provided object is an instance of {@link DashboardAsyncRenderResolved}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardAsyncRenderResolved = eventGuard<DashboardAsyncRenderResolved>(
    "GDC.DASH/EVT.RENDER.ASYNC.RESOLVED",
);

//
//
//

/**
 * @public
 */
export interface DashboardRenderResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.RENDER.RESOLVED";
}

/**
 * This event is emitted as soon as the dashboard component is fully rendered,
 * and asynchronous rendering of each component is complete.
 *
 * @public
 */
export function renderResolved(ctx: DashboardContext, correlationId?: string): DashboardRenderResolved {
    return {
        type: "GDC.DASH/EVT.RENDER.RESOLVED",
        correlationId,
        ctx,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardRenderResolved}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardRenderResolved = eventGuard<DashboardRenderResolved>("GDC.DASH/EVT.RENDER.RESOLVED");
