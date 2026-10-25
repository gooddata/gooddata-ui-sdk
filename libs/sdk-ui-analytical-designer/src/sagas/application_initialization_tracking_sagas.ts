// (C) 2022-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, fork, select, take } from "redux-saga/effects";
import { type FCPMetric, type LCPMetric, type Metric, onFCP, onLCP } from "web-vitals";

import { type IAppFinishedInitialization } from "../actions/app_context_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import {
    logAdFullyInitialized,
    logAdFullyInitializedInactiveWindow,
    logEmptyAdFullyInitialized,
    logEmptyAdFullyInitializedInactiveWindow,
    logFirstContentfulPaint,
    logLargestContentfulPaint,
} from "../services/telemetry/tracking_events.js";
import { type IWindowTracker, registerWindowTracker } from "../services/telemetry/windowTracker.js";
import { type IAppState } from "../store/types.js";

const metricValue = (metric: Metric) => Math.round(metric.value);

// FCP and LCP are not reported if the page was loaded in the background.
// All metrics are reported again (with the above exceptions) after a page is restored from the back/forward cache.
export function* reportWebVitals() {
    const appState: IAppState = yield select();

    onFCP((metric: FCPMetric) => logFirstContentfulPaint(appState, metricValue(metric)));
    // If user clicks on page before FCP is reported, LCP will be triggered at the same time as FCP and will
    // have the same value. If user clicks on page after FCP is reported, it will be triggered immediately
    // with the timestamp of the click. If the user does not click on anything, it will be reported at the
    // time it actually occurs.
    onLCP((metric: LCPMetric) => logLargestContentfulPaint(appState, metricValue(metric)));
}

export function* watchApplicationInitialization(): SagaIterator<void> {
    yield fork(watchCatalogLoad);
    yield fork(reportWebVitals);
}

export function* watchCatalogLoad() {
    const windowTracker = registerWindowTracker(document);
    const task: IAppFinishedInitialization = yield take(
        ActionTypeKeys.APP_FINISHED_SUCCESSFUL_INITIALIZATION,
    );
    yield call(handleApplicationInitialized, windowTracker, task.payload.isEmptyReport);
}

function* handleApplicationInitialized(windowTracker: IWindowTracker, isEmptyReport: boolean) {
    const applicationDuration: number = yield call(getApplicationInitializationDuration);
    const wasWindowActive = windowTracker.wasWindowAlwaysActive();

    yield call(logDurationToTracker, applicationDuration, wasWindowActive, isEmptyReport);
}

function* getApplicationInitializationDuration() {
    const initializationTimestamp: number = yield call(getInitializationTimestamp);
    return Date.now() - initializationTimestamp;
}

function getInitializationTimestamp() {
    return window.INITIALIZATION_TIMESTAMP;
}

function* logDurationToTracker(duration: number, wasWindowActive: boolean, isEmptyReport: boolean) {
    if (wasWindowActive) {
        yield call(logDurationForActiveWindowToTracker, duration, isEmptyReport);
    } else {
        yield call(logDurationForInactiveWindowToTracker, duration, isEmptyReport);
    }
}

function* logDurationForActiveWindowToTracker(duration: number, isEmptyReport: boolean) {
    const state: IAppState = yield select();
    if (isEmptyReport) {
        yield call(logEmptyAdFullyInitialized, { state, value: duration });
    } else {
        yield call(logAdFullyInitialized, { state, value: duration });
    }
}

function* logDurationForInactiveWindowToTracker(duration: number, isEmptyReport: boolean) {
    const state: IAppState = yield select();
    if (isEmptyReport) {
        yield call(logEmptyAdFullyInitializedInactiveWindow, { state, value: duration });
    } else {
        yield call(logAdFullyInitializedInactiveWindow, { state, value: duration });
    }
}
