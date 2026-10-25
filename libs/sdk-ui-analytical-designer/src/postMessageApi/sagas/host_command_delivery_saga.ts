// (C) 2026 GoodData Corporation

import { call, put } from "redux-saga/effects";

import { type AdCommandEnvelope, HOST_ADAPTER_ORIGIN } from "../../embedding/hostBridge.js";
import { closeHostCommandDelivery, openHostCommandDelivery } from "../../embedding/hostCommandGate.js";
import { commandReceived } from "../actions/command_received_actions.js";

const waitUntilCancelled = () => new Promise<never>(() => {});

/**
 * Delivers the in-process host commands once the command watchers listen. The root saga starts it
 * after every watcher, so their takes are registered before the first command arrives. It keeps the
 * delivery open until the root saga is cancelled.
 */
export function* deliverHostCommands() {
    try {
        const queued: AdCommandEnvelope[] = yield call(openHostCommandDelivery);
        for (const envelope of queued) {
            yield put(commandReceived(envelope, HOST_ADAPTER_ORIGIN));
        }
        yield call(waitUntilCancelled);
    } finally {
        closeHostCommandDelivery();
    }
}
