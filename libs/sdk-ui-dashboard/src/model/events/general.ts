// (C) 2021 GoodData Corporation

import { IDashboardEvent } from "./base";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardQuery } from "../queries";
import { IDashboardCommand } from "../commands";
import { eventGuard } from "./util";

/**
 * This event is emitted when a particular command processing starts.
 *
 * @alpha
 */
export interface DashboardCommandStarted<TCommand extends IDashboardCommand> extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.STARTED";
    readonly payload: {
        /**
         * The command that started processing.
         */
        readonly command: TCommand;
    };
}

export function dashboardCommandStarted<TCommand extends IDashboardCommand>(
    ctx: DashboardContext,
    command: TCommand,
): DashboardCommandStarted<TCommand> {
    return {
        type: "GDC.DASH/EVT.COMMAND.STARTED",
        ctx,
        correlationId: command.correlationId,
        payload: {
            command,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardCommandStarted}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardCommandStarted = eventGuard<DashboardCommandStarted<any>>(
    "GDC.DASH/EVT.COMMAND.STARTED",
);

/**
 * @alpha
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
 * @alpha
 */
export interface DashboardCommandFailed<TCommand extends IDashboardCommand> extends IDashboardEvent {
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

        /**
         * The command that failed.
         */
        readonly command: TCommand;
    };
}

export function internalErrorOccurred<TCommand extends IDashboardCommand>(
    ctx: DashboardContext,
    command: TCommand,
    message: string,
    error?: Error,
): DashboardCommandFailed<TCommand> {
    return {
        type: "GDC.DASH/EVT.COMMAND.FAILED",
        ctx,
        correlationId: command.correlationId,
        payload: {
            reason: "INTERNAL_ERROR",
            command,
            message,
            error,
        },
    };
}

export function invalidArgumentsProvided<TCommand extends IDashboardCommand>(
    ctx: DashboardContext,
    command: TCommand,
    message: string,
): DashboardCommandFailed<TCommand> {
    return {
        type: "GDC.DASH/EVT.COMMAND.FAILED",
        ctx,
        correlationId: command.correlationId,
        payload: {
            reason: "USER_ERROR",
            command,
            message,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardCommandFailed}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardCommandFailed = eventGuard<DashboardCommandFailed<any>>(
    "GDC.DASH/EVT.COMMAND.FAILED",
);

//
//
//

/**
 * This event is emitted when the submitted command has been rejected by the dashboard component because it does
 * not know how to handle the command.
 *
 * This typically indicates user error, perhaps a typo in the command type name.
 *
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DashboardCommandRejected}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardCommandRejected = eventGuard<DashboardCommandRejected>(
    "GDC.DASH/EVT.COMMAND.REJECTED",
);

//
//
//

/**
 * This event is emitted when the submitted query has been rejected by the dashboard component because it does
 * not know how to handle the query.
 *
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DashboardQueryRejected}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardQueryRejected = eventGuard<DashboardQueryRejected>("GDC.DASH/EVT.QUERY.REJECTED");

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
 * @alpha
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
 * @alpha
 */
export const isDashboardQueryFailed = eventGuard<DashboardQueryFailed>("GDC.DASH/EVT.QUERY.FAILED");

//
//
//

/**
 * This event is emitted when query processing starts.
 *
 * @alpha
 */
export interface DashboardQueryStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.STARTED";
    readonly payload: {
        readonly query: IDashboardQuery;
    };
}

export function queryStarted(
    ctx: DashboardContext,
    query: IDashboardQuery,
    correlationId?: string,
): DashboardQueryStarted {
    return {
        type: "GDC.DASH/EVT.QUERY.STARTED",
        ctx,
        correlationId,
        payload: {
            query,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardQueryStarted}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardQueryStarted = eventGuard<DashboardQueryStarted>("GDC.DASH/EVT.QUERY.STARTED");

//
//
//

/**
 * This event is emitted when query processing completes with success. Both the query payload and the result are
 * included.
 *
 * @alpha
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

/**
 * Tests whether the provided object is an instance of {@link DashboardQueryCompleted}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardQueryCompleted = eventGuard<DashboardQueryCompleted<any, any>>(
    "GDC.DASH/EVT.QUERY.COMPLETED",
);
