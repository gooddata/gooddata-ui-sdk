// (C) 2020-2026 GoodData Corporation

import { partial } from "lodash-es";
import { type Action, type Dispatch } from "redux";

import { type AdCommand, type GdcMessageEventListener, GdcProductName } from "@gooddata/sdk-embedding";
import { messagingUtils } from "@gooddata/sdk-embedding/internal";

import { commandReceived } from "../actions/command_received_actions.js";
import { SUPPORTED_COMMANDS } from "../outgoing/supported_commands_events.js";

let commandListeners: GdcMessageEventListener;

export function commandListenersWithDispatchReduxAction(
    dispatch: Dispatch<Action>,
    command: AdCommand,
): boolean {
    dispatch(commandReceived(command.data, command.origin));
    return true;
}

export function registerCommands(dispatch: Dispatch, supportedCommands = SUPPORTED_COMMANDS): void {
    // setConfig below narrows the stream to AD's own supported commands, so the listener only ever
    // sees an AdCommand even though the messaging utils type it as any product's message event.
    commandListeners = partial(commandListenersWithDispatchReduxAction, dispatch) as GdcMessageEventListener;
    // TODO SDK8 add transformation of the events to legacy?
    messagingUtils.setConfig(GdcProductName.ANALYTICAL_DESIGNER, supportedCommands);
    messagingUtils.addListener(commandListeners);
}

export function unregisterCommands(): void {
    messagingUtils.removeListener(commandListeners);
}
