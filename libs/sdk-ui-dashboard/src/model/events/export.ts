// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

/**
 * @internal
 */
export interface DashboardAsyncRenderForExportRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.ASYNC_RENDER.REQUESTED";
    readonly payload: {
        /**
         * Item identifier.
         */
        readonly id: string;
    };
}

/**
 * @internal
 */
export function asyncRenderForExportRequested(
    id: string,
    ctx: DashboardContext,
    correlationId?: string,
): DashboardAsyncRenderForExportRequested {
    return {
        type: "GDC.DASH/EVT.EXPORT.ASYNC_RENDER.REQUESTED",
        correlationId,
        ctx,
        payload: {
            id,
        },
    };
}

/**
 * @internal
 */
export interface DashboardAsyncRenderForExportResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.EXPORT.ASYNC_RENDER.RESOLVED";
    readonly payload: {
        /**
         * Item identifier.
         */
        readonly id: string;
    };
}

/**
 * @internal
 */
export function asyncRenderForExportResolved(
    id: string,
    ctx: DashboardContext,
    correlationId?: string,
): DashboardAsyncRenderForExportResolved {
    return {
        type: "GDC.DASH/EVT.EXPORT.ASYNC_RENDER.RESOLVED",
        correlationId,
        ctx,
        payload: {
            id,
        },
    };
}
