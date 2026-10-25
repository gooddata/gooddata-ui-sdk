// (C) 2007-2026 GoodData Corporation

import { put } from "redux-saga/effects";

import { telemetryInitialized } from "../../actions/telemetry_actions.js";
import { NoopAnalyticsTracker } from "../../services/telemetry/tracker.js";
import { registerHostForwardingTracker, registerTracker } from "../../services/telemetry/tracking_events.js";

export function* setupTigerTelemetryTracking() {
    if (!registerHostForwardingTracker()) {
        registerTracker(new NoopAnalyticsTracker());
    }

    yield put(telemetryInitialized());
}
