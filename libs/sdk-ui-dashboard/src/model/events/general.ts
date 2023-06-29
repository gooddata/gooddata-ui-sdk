// (C) 2021-2023 GoodData Corporation

import { IDashboardEvent } from "./base.js";
import { DashboardContext } from "../types/commonTypes.js";
import { IDashboardQuery } from "../queries/index.js";
import { IDashboardCommand } from "../commands/index.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardCommandStarted} event.
 * @beta
 */
export interface DashboardCommandStartedPayload<TCommand extends IDashboardCommand> {
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
export interface DashboardCommandStarted<TCommand extends IDashboardCommand> extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.STARTED";
    readonly payload: DashboardCommandStartedPayload<TCommand>;
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
 * @beta
 */
export const isDashboardCommandStarted = eventGuard<DashboardCommandStarted<any>>(
    "GDC.DASH/EVT.COMMAND.STARTED",
);

/**
 * @beta
 */
export type ActionFailedErrorReason = "USER_ERROR" | "INTERNAL_ERROR";

/**
 * Payload of the {@link DashboardCommandFailed} event.
 * @beta
 */
export interface DashboardCommandFailedPayload<TCommand extends IDashboardCommand> {
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
export interface DashboardCommandFailed<TCommand extends IDashboardCommand = IDashboardCommand>
    extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.COMMAND.FAILED";
    readonly payload: DashboardCommandFailedPayload<TCommand>;
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
 * @beta
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
 * @beta
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
 * @beta
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
 * @beta
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
 * @beta
 */
export const isDashboardQueryRejected = eventGuard<DashboardQueryRejected>("GDC.DASH/EVT.QUERY.REJECTED");

//
//
//

/**
 * Payload of the {@link DashboardQueryFailed} event.
 * @beta
 */
export interface DashboardQueryFailedPayload {
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
export interface DashboardQueryFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.FAILED";
    readonly payload: DashboardQueryFailedPayload;
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
 * @beta
 */
export const isDashboardQueryFailed = eventGuard<DashboardQueryFailed>("GDC.DASH/EVT.QUERY.FAILED");

//
//
//

/**
 * Payload of the {@link DashboardQueryStarted} event.
 * @beta
 */
export interface DashboardQueryStartedPayload {
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
export interface DashboardQueryStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.STARTED";
    readonly payload: DashboardQueryStartedPayload;
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
 * @beta
 */
export const isDashboardQueryStarted = eventGuard<DashboardQueryStarted>("GDC.DASH/EVT.QUERY.STARTED");

//
//
//

/**
 * Payload of the {@link DashboardQueryCompleted} event.
 * @beta
 */
export interface DashboardQueryCompletedPayload<TQuery extends IDashboardQuery, TResult> {
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
export interface DashboardQueryCompleted<TQuery extends IDashboardQuery, TResult> extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.QUERY.COMPLETED";
    readonly payload: DashboardQueryCompletedPayload<TQuery, TResult>;
}

export function queryCompleted<TQuery extends IDashboardQuery, TResult>(
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
 * @beta
 */
export const isDashboardQueryCompleted = eventGuard<DashboardQueryCompleted<any, any>>(
    "GDC.DASH/EVT.QUERY.COMPLETED",
);
