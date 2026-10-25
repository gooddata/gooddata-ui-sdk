// (C) 2026 GoodData Corporation

import { commandReceived } from "../postMessageApi/actions/command_received_actions.js";
import { store } from "../reduxStore.js";

import { type AdCommandEnvelope, HOST_ADAPTER_ORIGIN } from "./hostBridge.js";
import { type HostCommandOwner, isHostCommandDeliveryOpen, queueHostCommand } from "./hostCommandGate.js";

/**
 * Injects a command into AD exactly where the postMessage transport does: the commandReceived
 * action, so origin/command-type validation and per-command routing are reused end to end. Until AD
 * listens for commands, the command waits (see hostCommandGate).
 */
export function sendCommandToAd(envelope: AdCommandEnvelope, owner: HostCommandOwner): void {
    if (isHostCommandDeliveryOpen()) {
        store.dispatch(commandReceived(envelope, HOST_ADAPTER_ORIGIN));
    } else {
        queueHostCommand(envelope, owner);
    }
}
