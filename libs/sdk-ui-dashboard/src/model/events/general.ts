// (C) 2021 GoodData Corporation

import { IDashboardEvent } from "./base";
import { DashboardContext } from "../types/commonTypes";
import isEmpty from "lodash/isEmpty";
import { IDashboardQuery } from "../queries";

/**
 * @internal
 */
export type ActionFailedErrorReason = "USER_ERROR" | "INTERNAL_ERROR";

/**
 * This event is emitted if a particular command processing fails. The failure may be for two general reasons:
 *
 * -  A user error was made; dispatched command is found to have bad payload or the dispatched command is not applicable
 *    in the current state of the dashboard
 *
 * -  An internal error has occurred in the dashboard component - highly likely due to a bug.
 *
 * @internal
 */
export interface DashboardCommandFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.FAILED";
    readonly payload: {
        /**
         * Reason for the failure.
         */
        readonly reason: ActionFailedErrorReason;

        /**
         * Message explaining the nature of the failure.
         */
        readonly message: string;

        /**
         * Error that has occurred and caused the command to fail.
         */
        readonly error?: Error;
    };
}

export function internalErrorOccurred(
    ctx: DashboardContext,
    message: string,
    error?: Error,
    correlationId?: string,
): DashboardCommandFailed {
    return {
        type: "GDC.DASH/EVT.COMMAND.FAILED",
        ctx,
        correlationId,
        payload: {
            reason: "INTERNAL_ERROR",
            message,
            error,
        },
    };
}

export function invalidArgumentsProvided(
    ctx: DashboardContext,
    message: string,
    correlationId?: string,
): DashboardCommandFailed {
    return {
        type: "GDC.DASH/EVT.COMMAND.FAILED",
        ctx,
        correlationId,
        payload: {
            reason: "USER_ERROR",
            message,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardCommandFailed}.
 *
 * @param obj - object to test
 * @internal
 */
export function isDashboardCommandFailed(obj: unknown): obj is DashboardCommandFailed {
    return !isEmpty(obj) && (obj as DashboardCommandFailed).type === "GDC.DASH/EVT.COMMAND.FAILED";
}

//
//
//

/**
 * This event is emitted when the submitted command has been rejected by the dashboard component because it does
 * not know how to handle the command.
 *
 * This typically indicates user error, perhaps a typo in the command type name.
 *
 * @internal
 */
export interface DashboardCommandRejected extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.REJECTED";
}

export function commandRejected(ctx: DashboardContext, correlationId?: string): DashboardCommandRejected {
    return {
        type: "GDC.DASH/EVT.COMMAND.REJECTED",
        ctx,
        correlationId,
    };
}

//
//
//

/**
 * This event is emitted when the submitted query has been rejected by the dashboard component because it does
 * not know how to handle the query.
 *
 * @internal
 */
export interface DashboardQueryRejected extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.REJECTED";
}

export function queryRejected(ctx: DashboardContext, correlationId?: string): DashboardQueryRejected {
    return {
        type: "GDC.DASH/EVT.QUERY.REJECTED",
        ctx,
        correlationId,
    };
}

//
//
//

/**
 * This event is emitted if a particular query processing fails. The failure may be for two general reasons:
 *
 * -  A user error was made; dispatched query is found to have bad payload or the dispatched query is not applicable
 *    in the current state of the dashboard
 *
 * -  An internal error has occurred in the dashboard component - highly likely due to a bug.
 *
 * @internal
 */
export interface DashboardQueryFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.FAILED";
    readonly payload: {
        /**
         * Reason for the failure.
         */
        readonly reason: ActionFailedErrorReason;

        /**
         * Message explaining the nature of the failure.
         */
        readonly message: string;

        /**
         * Error that has occurred and caused the command to fail.
         */
        readonly error?: Error;
    };
}

export function internalQueryErrorOccurred(
    ctx: DashboardContext,
    message: string,
    error?: Error,
    correlationId?: string,
): DashboardQueryFailed {
    return {
        type: "GDC.DASH/EVT.QUERY.FAILED",
        ctx,
        correlationId,
        payload: {
            reason: "INTERNAL_ERROR",
            message,
            error,
        },
    };
}

export function invalidQueryArguments(
    ctx: DashboardContext,
    message: string,
    correlationId?: string,
): DashboardQueryFailed {
    return {
        type: "GDC.DASH/EVT.QUERY.FAILED",
        ctx,
        correlationId,
        payload: {
            reason: "USER_ERROR",
            message,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardCommandFailed}.
 *
 * @param obj - object to test
 * @internal
 */
export function isDashboardQueryFailed(obj: unknown): obj is DashboardQueryFailed {
    return !isEmpty(obj) && (obj as DashboardQueryFailed).type === "GDC.DASH/EVT.QUERY.FAILED";
}

//
//
//

/**
 * This event is emitted when query processing starts.
 *
 * @internal
 */
export interface DashboardQueryStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.STARTED";
}

export function queryStarted(ctx: DashboardContext, correlationId?: string): DashboardQueryStarted {
    return {
        type: "GDC.DASH/EVT.QUERY.STARTED",
        ctx,
        correlationId,
    };
}

//
//
//

/**
 * This event is emitted when query processing completes with success. Both the query payload and the result are
 * included.
 *
 * @internal
 */
export interface DashboardQueryCompleted<TQuery extends IDashboardQuery<TResult>, TResult>
    extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.COMPLETED";
    readonly payload: {
        readonly query: TQuery;
        readonly result: TResult;
    };
}

export function queryCompleted<TQuery extends IDashboardQuery<TResult>, TResult>(
    ctx: DashboardContext,
    query: TQuery,
    result: TResult,
    correlationId?: string,
): DashboardQueryCompleted<TQuery, TResult> {
    return {
        type: "GDC.DASH/EVT.QUERY.COMPLETED",
        ctx,
        correlationId,
        payload: {
            query,
            result,
        },
    };
}
