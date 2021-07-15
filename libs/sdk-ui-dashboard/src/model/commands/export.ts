// (C) 2021 GoodData Corporation
import { IDashboardCommand } from "./base";

/**
 * @internal
 */
export interface RequestAsyncRenderForExport extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXPORT.ASYNC_RENDER.REQUEST";
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
export function requestAsyncRenderForExport(id: string, correlationId?: string): RequestAsyncRenderForExport {
    return {
        type: "GDC.DASH/CMD.EXPORT.ASYNC_RENDER.REQUEST",
        correlationId,
        payload: {
            id,
        },
    };
}

/**
 * @internal
 */
export interface ResolveAsyncRenderForExport extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXPORT.ASYNC_RENDER.RESOLVE";
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
export function resolveAsyncRenderForExport(id: string, correlationId?: string): ResolveAsyncRenderForExport {
    return {
        type: "GDC.DASH/CMD.EXPORT.ASYNC_RENDER.RESOLVE",
        correlationId,
        payload: {
            id,
        },
    };
}
