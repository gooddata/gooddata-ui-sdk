// (C) 2021-2026 GoodData Corporation

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type IDashboardCommand } from "../commands/base.js";
import { type IDashboardQuery } from "../queries/base.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IDashboardCommandStarted} event.
 * @beta
 */
export interface IDashboardCommandStartedPayload<TCommand extends IDashboardCommand> {
    /**
     * The command that started processing.
     */
    readonly command: TCommand;
}

/**
 * This event is emitted when a particular command processing starts.
 *
 * @beta
 */
export interface IDashboardCommandStarted<TCommand extends IDashboardCommand> extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.STARTED";
    readonly payload: IDashboardCommandStartedPayload<TCommand>;
}
export function dashboardCommandStarted<TCommand extends IDashboardCommand>(
    ctx: DashboardContext,
    command: TCommand,
): IDashboardCommandStarted<TCommand> {
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
 * Tests whether the provided object is an instance of {@link IDashboardCommandStarted}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardCommandStarted = eventGuard<IDashboardCommandStarted<any>>(
    "GDC.DASH/EVT.COMMAND.STARTED",
);

/**
 * @beta
 */
export type ActionFailedErrorReason = "USER_ERROR" | "INTERNAL_ERROR";

/**
 * Payload of the {@link IDashboardCommandFailed} event.
 * @beta
 */
export interface IDashboardCommandFailedPayload<TCommand extends IDashboardCommand> {
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
}

/**
 * This event is emitted if a particular command processing fails. The failure may be for two general reasons:
 *
 * -  A user error was made; dispatched command is found to have bad payload or the dispatched command is not applicable
 *    in the current state of the dashboard
 *
 * -  An internal error has occurred in the dashboard component - highly likely due to a bug.
 *
 * @beta
 */
export interface IDashboardCommandFailed<TCommand extends IDashboardCommand = IDashboardCommand>
    extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.FAILED";
    readonly payload: IDashboardCommandFailedPayload<TCommand>;
}

export function internalErrorOccurred<TCommand extends IDashboardCommand>(
    ctx: DashboardContext,
    command: TCommand,
    message: string,
    error?: Error,
): IDashboardCommandFailed<TCommand> {
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
): IDashboardCommandFailed<TCommand> {
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
 * Tests whether the provided object is an instance of {@link IDashboardCommandFailed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardCommandFailed = eventGuard<IDashboardCommandFailed<any>>(
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
 * @beta
 */
export interface IDashboardCommandRejected extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.REJECTED";
}

export function commandRejected(ctx: DashboardContext, correlationId?: string): IDashboardCommandRejected {
    return {
        type: "GDC.DASH/EVT.COMMAND.REJECTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardCommandRejected}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardCommandRejected = eventGuard<IDashboardCommandRejected>(
    "GDC.DASH/EVT.COMMAND.REJECTED",
);

//
//
//

/**
 * This event is emitted when the submitted query has been rejected by the dashboard component because it does
 * not know how to handle the query.
 *
 * @beta
 */
export interface IDashboardQueryRejected extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.REJECTED";
}

export function queryRejected(ctx: DashboardContext, correlationId?: string): IDashboardQueryRejected {
    return {
        type: "GDC.DASH/EVT.QUERY.REJECTED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardQueryRejected}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardQueryRejected = eventGuard<IDashboardQueryRejected>("GDC.DASH/EVT.QUERY.REJECTED");

//
//
//

/**
 * Payload of the {@link IDashboardQueryFailed} event.
 * @beta
 */
export interface IDashboardQueryFailedPayload {
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
}

/**
 * This event is emitted if a particular query processing fails. The failure may be for two general reasons:
 *
 * -  A user error was made; dispatched query is found to have bad payload or the dispatched query is not applicable
 *    in the current state of the dashboard
 *
 * -  An internal error has occurred in the dashboard component - highly likely due to a bug.
 *
 * @beta
 */
export interface IDashboardQueryFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.FAILED";
    readonly payload: IDashboardQueryFailedPayload;
}

export function internalQueryErrorOccurred(
    ctx: DashboardContext,
    message: string,
    error?: Error,
    correlationId?: string,
): IDashboardQueryFailed {
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
): IDashboardQueryFailed {
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
 * Tests whether the provided object is an instance of {@link IDashboardCommandFailed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardQueryFailed = eventGuard<IDashboardQueryFailed>("GDC.DASH/EVT.QUERY.FAILED");

//
//
//

/**
 * Payload of the {@link IDashboardQueryStarted} event.
 * @beta
 */
export interface IDashboardQueryStartedPayload {
    /**
     * The query that is starting to be run.
     */
    readonly query: IDashboardQuery;
}

/**
 * This event is emitted when query processing starts.
 *
 * @beta
 */
export interface IDashboardQueryStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.STARTED";
    readonly payload: IDashboardQueryStartedPayload;
}

export function queryStarted(
    ctx: DashboardContext,
    query: IDashboardQuery,
    correlationId?: string,
): IDashboardQueryStarted {
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
 * Tests whether the provided object is an instance of {@link IDashboardQueryStarted}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardQueryStarted = eventGuard<IDashboardQueryStarted>("GDC.DASH/EVT.QUERY.STARTED");

//
//
//

/**
 * Payload of the {@link IDashboardQueryCompleted} event.
 * @beta
 */
export interface IDashboardQueryCompletedPayload<TQuery extends IDashboardQuery, TResult> {
    /**
     * The query that was run to get the given result.
     */
    readonly query: TQuery;
    /**
     * The result of the query.
     */
    readonly result: TResult;
}

/**
 * This event is emitted when query processing completes with success. Both the query payload and the result are
 * included.
 *
 * @beta
 */
export interface IDashboardQueryCompleted<TQuery extends IDashboardQuery, TResult> extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.COMPLETED";
    readonly payload: IDashboardQueryCompletedPayload<TQuery, TResult>;
}

export function queryCompleted<TQuery extends IDashboardQuery, TResult>(
    ctx: DashboardContext,
    query: TQuery,
    result: TResult,
    correlationId?: string,
): IDashboardQueryCompleted<TQuery, TResult> {
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
 * Tests whether the provided object is an instance of {@link IDashboardQueryCompleted}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardQueryCompleted = eventGuard<IDashboardQueryCompleted<any, any>>(
    "GDC.DASH/EVT.QUERY.COMPLETED",
);
