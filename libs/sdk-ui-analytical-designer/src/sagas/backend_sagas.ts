// (C) 2022-2026 GoodData Corporation

import { put } from "redux-saga/effects";

import { backendInitialized } from "./application_context/application_context_actions.js";

export function* waitForBackendInitialization() {
    // The host supplies the backend at mount, so there is nothing to re-initialize and no iframe
    // parent to wait for a token from.
    yield put(backendInitialized());
}
