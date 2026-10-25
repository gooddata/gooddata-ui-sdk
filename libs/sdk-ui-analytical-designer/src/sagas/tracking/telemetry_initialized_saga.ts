// (C) 2025-2026 GoodData Corporation

import { takeEvery } from "redux-saga/effects";

import { ActionTypeKeys } from "../../constants/actions.js";
import { telemetryInitialized } from "../../services/telemetry/tracking_events.js";

export function* watchTelemetryInitialized() {
    yield takeEvery(ActionTypeKeys.TELEMETRY_INITIALIZED, telemetryInitialized);
}
