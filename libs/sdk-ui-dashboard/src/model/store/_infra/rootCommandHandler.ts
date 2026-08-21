// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { actionChannel, call, cancelled, flush, take } from "redux-saga/effects";

import { DefaultCommandHandlers } from "../../commandHandlers/index.js";
import { type IDashboardCommand } from "../../commands/base.js";
import { type DashboardCommands } from "../../commands/index.js";
import { isDashboardEvent } from "../../events/base.js";
import {
    type IDashboardCommandFailed,
    commandCancelled,
    commandRejected,
    dashboardCommandStarted,
    internalErrorOccurred,
    isDashboardCommandFailed,
} from "../../events/general.js";
import { type DashboardContext } from "../../types/commonTypes.js";

import { getDashboardContext } from "./contexts.js";
import { dispatchDashboardEvent } from "./eventDispatcher.js";

function* unhandledCommand(ctx: DashboardContext, cmd: IDashboardCommand) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}

/**
 * @internal
 */
export const CommandEnvelopeActionPrefix = "__C";

type CommandEnvelopeEventHandlers<TCommand extends IDashboardCommand, TResult> = {
    onStart: (command: TCommand) => void;
    onSuccess: (result: TResult) => void;
    // Command handlers signal failure by throwing the event; a plain Error only arrives from an unexpected throw.
    onError: (err: Error | IDashboardCommandFailed) => void;
};

type CommandEnvelope<TCommand extends IDashboardCommand, TResult> = Readonly<
    CommandEnvelopeEventHandlers<TCommand, TResult>
> & {
    readonly type: string;
    readonly command: TCommand;
};

export function commandEnvelope<TCommand extends IDashboardCommand, TResult>(
    command: TCommand,
    eventHandlers?: Partial<CommandEnvelopeEventHandlers<TCommand, TResult>>,
): CommandEnvelope<TCommand, TResult> {
    return {
        type: `${CommandEnvelopeActionPrefix}(${command.type})`,
        command,
        onError: eventHandlers?.onError ?? (() => {}),
        onStart: eventHandlers?.onStart ?? (() => {}),
        onSuccess: eventHandlers?.onSuccess ?? (() => {}),
    };
}

/**
 * @internal
 */
export function commandEnvelopeWithPromise<TCommand extends IDashboardCommand, TResult>(
    command: TCommand,
): {
    promise: Promise<TResult>;
    envelope: CommandEnvelope<TCommand, TResult>;
} {
    const commandEnvelopeEventHandlers: Partial<CommandEnvelopeEventHandlers<TCommand, TResult>> = {};

    const promise = new Promise<TResult>((resolve, reject) => {
        commandEnvelopeEventHandlers.onSuccess = resolve;
        commandEnvelopeEventHandlers.onError = reject;
    });

    const envelope = commandEnvelope(command, commandEnvelopeEventHandlers);

    return {
        promise,
        envelope,
    };
}

function isCommandEnvelope(obj: unknown): obj is CommandEnvelope<any, any> {
    return !!obj && (obj as CommandEnvelope<any, any>).type.startsWith(CommandEnvelopeActionPrefix);
}

function ensureCommandWrappedInEnvelope(
    action: DashboardCommands | CommandEnvelope<DashboardCommands, any>,
): CommandEnvelope<DashboardCommands, any> {
    return isCommandEnvelope(action) ? action : commandEnvelope(action as DashboardCommands);
}

/**
 * Callers wait either on the envelope callbacks or on the COMMAND.FAILED event, so both have to be told.
 */
function* reportCommandCancelled(
    ctx: DashboardContext,
    envelope: CommandEnvelope<DashboardCommands, any>,
): SagaIterator<void> {
    const { command } = envelope;
    const correlationIdForLog = command.correlationId ?? "(no correlationId provided)";
    const event = commandCancelled(ctx, command);

    try {
        envelope.onError(event);
    } catch (e) {
        console.warn(
            `An error has occurred while calling onError function provided for ${command.type}@${correlationIdForLog} processing:`,
            e,
        );
    }

    yield dispatchDashboardEvent(event);
}

function* processCommand(
    ctx: DashboardContext,
    envelope: CommandEnvelope<DashboardCommands, any>,
): SagaIterator<void> {
    const {
        command,
        command: { type, correlationId },
    } = envelope;
    const correlationIdForLog = correlationId ?? "(no correlationId provided)";

    const commandHandler = DefaultCommandHandlers[envelope.command.type] ?? unhandledCommand;

    try {
        yield dispatchDashboardEvent(dashboardCommandStarted(ctx, envelope.command));
        try {
            envelope.onStart(command);
        } catch (e) {
            console.warn(
                `An error has occurred while calling onStart function provided for ${type}@${correlationIdForLog} processing:`,
                e,
            );
        }

        const result = yield call(commandHandler, ctx, command);

        if (isDashboardEvent(result)) {
            yield dispatchDashboardEvent(result);
        }

        try {
            envelope.onSuccess(result);
        } catch (e) {
            console.warn(
                `An error has occurred while calling onSuccess function provided for ${type}@${correlationIdForLog} processing`,
                e,
            );
        }
    } catch (e: any) {
        try {
            envelope.onError(e);
        } catch (ne) {
            console.warn(
                `An error has occurred while calling onError function provided for ${type}@${correlationIdForLog} processing:`,
                ne,
            );
        }

        if (isDashboardCommandFailed(e)) {
            yield dispatchDashboardEvent(e);
        } else {
            // Errors during command handling should be caught and addressed in the handler, possibly with a
            // more meaningful error message. If the error bubbles up to here then there are holes in error
            // handling or something is seriously messed up.
            yield dispatchDashboardEvent(
                internalErrorOccurred(ctx, command, `Internal error has occurred while handling ${type}`, e),
            );
        }
    } finally {
        // A saga cancellation is not an exception, so it never reaches the catch above.
        if (yield cancelled()) {
            yield call(reportCommandCancelled, ctx, envelope);
        }
    }
}

/**
 * Root command handler is the central point through which all command processing is done. The handler registers
 * for all actions starting with `GDC.DASH/CMD` === all dashboard commands.
 *
 * The commands are intended for serial processing, without any forking. A buffering action channel is in place to
 * prevent loss of commands.
 *
 * TODO: refactor this so that root command handler is created dynamically similar to query processor. the handlers
 *  should be providable by the caller
 */
export function* rootCommandHandler(): SagaIterator<void> {
    const commandChannel = yield actionChannel(
        (action: any) =>
            action.type &&
            (action.type.startsWith(CommandEnvelopeActionPrefix) || action.type.startsWith("GDC.DASH/CMD")),
    );

    try {
        while (true) {
            const command: DashboardCommands | CommandEnvelope<DashboardCommands, any> =
                yield take(commandChannel);
            const envelope = ensureCommandWrappedInEnvelope(command);
            const ctx: DashboardContext = yield call(getDashboardContext);

            yield call(processCommand, ctx, envelope);
        }
    } finally {
        // Whatever is still buffered never reached processCommand, so nothing else can report it.
        if (yield cancelled()) {
            const buffered: (DashboardCommands | CommandEnvelope<DashboardCommands, any>)[] =
                yield flush(commandChannel);
            const ctx: DashboardContext = yield call(getDashboardContext);

            for (const command of buffered) {
                yield call(reportCommandCancelled, ctx, ensureCommandWrappedInEnvelope(command));
            }
        }
    }
}
