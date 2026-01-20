// (C) 2021-2026 GoodData Corporation

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type IRenderingWorkerConfiguration } from "../commandHandlers/render/types.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * This event is emitted as soon as the dashboard component is mounted,
 * and rendering of its content started.
 *
 * @public
 */
export type DashboardRenderRequested = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.RENDER.REQUESTED";
};

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
export type DashboardAsyncRenderRequestedPayload = {
    /**
     * Item identifier.
     */
    readonly id: string;
};

/**
 * This event is emitted when a component on the dashboard requests async rendering.
 *
 * @public
 */
export type DashboardAsyncRenderRequested = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.RENDER.ASYNC.REQUESTED";
    readonly payload: {
        /**
         * Item identifier.
         */
        readonly id: string;
    };
};

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
export type DashboardAsyncRenderResolvedPayload = {
    /**
     * Item identifier.
     */
    readonly id: string;
};

/**
 * This event is emitted when a component on the dashboard resolves async rendering.
 *
 * @public
 */
export type DashboardAsyncRenderResolved = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.RENDER.ASYNC.RESOLVED";
    readonly payload: DashboardAsyncRenderResolvedPayload;
};

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
export type DashboardRenderResolved = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.RENDER.RESOLVED";
    readonly payload?: {
        config: Omit<IRenderingWorkerConfiguration, "correlationIdGenerator">;
    };
};

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
 * This event is emitted as soon as the dashboard component is fully rendered,
 * and asynchronous rendering of each component is complete.
 *
 * @public
 */
export function renderResolvedWithDetails(
    ctx: DashboardContext,
    config: Omit<IRenderingWorkerConfiguration, "correlationIdGenerator">,
    correlationId?: string,
): DashboardRenderResolved {
    return {
        type: "GDC.DASH/EVT.RENDER.RESOLVED",
        payload: {
            config,
        },
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
