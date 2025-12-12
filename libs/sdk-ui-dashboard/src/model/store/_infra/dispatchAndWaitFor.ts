// (C) 2021-2025 GoodData Corporation

import { commandEnvelopeWithPromise } from "./rootCommandHandler.js";
import { type DashboardCommands } from "../../commands/index.js";
import { type DashboardDispatch } from "../types.js";

/**
 * Dispatches a command and returns a promise to wait for it to get resolved.
 *
 * @param dispatch - dashboard dispatch to use
 * @param command - command to trigger and wait for resolution of
 * @returns Promise of the command resolution
 * @alpha
 */
export async function dispatchAndWaitFor<TCommand extends DashboardCommands, TResult>(
    dispatch: DashboardDispatch,
    command: TCommand,
): Promise<TResult> {
    const { promise, envelope } = commandEnvelopeWithPromise<TCommand, TResult>(command);

    dispatch(envelope);

    return promise;
}
