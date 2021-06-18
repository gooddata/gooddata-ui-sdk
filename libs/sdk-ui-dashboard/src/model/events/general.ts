// (C) 2021 GoodData Corporation

import { IDashboardEvent } from "./base";
import { DashboardContext } from "../types/commonTypes";
import isEmpty from "lodash/isEmpty";

/**
 * @internal
 */
export type CommandFailedErrorReason = "USER_ERROR" | "INTERNAL_ERROR";

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
        readonly reason: CommandFailedErrorReason;

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
