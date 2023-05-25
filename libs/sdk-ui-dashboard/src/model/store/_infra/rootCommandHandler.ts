// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { actionChannel, call, take } from "redux-saga/effects";
import noop from "lodash/noop.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { DashboardCommands, IDashboardCommand } from "../../commands/index.js";
import { dispatchDashboardEvent } from "./eventDispatcher.js";
import {
    commandRejected,
    dashboardCommandStarted,
    internalErrorOccurred,
    isDashboardCommandFailed,
} from "../../events/general.js";
import { isDashboardEvent } from "../../events/base.js";
import { DefaultCommandHandlers } from "../../commandHandlers/index.js";
import { getDashboardContext } from "./contexts.js";

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
    onError: (err: Error) => void;
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
        onError: eventHandlers?.onError ?? noop,
        onStart: eventHandlers?.onStart ?? noop,
        onSuccess: eventHandlers?.onSuccess ?? noop,
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

    while (true) {
        const command: DashboardCommands | CommandEnvelope<DashboardCommands, any> = yield take(
            commandChannel,
        );
        const envelope = ensureCommandWrappedInEnvelope(command);
        const ctx: DashboardContext = yield call(getDashboardContext);

        yield call(processCommand, ctx, envelope);
    }
}
