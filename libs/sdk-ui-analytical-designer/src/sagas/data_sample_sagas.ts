// (C) 2020-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { type updateDataSamplingPercentage } from "../actions/data_sample_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { DATA_SAMPLING_URL, DEFAULT_DATA_SAMPLING_PERCENTAGE } from "../constants/data_sampling.js";
import {
    logDataSamplingDisabled,
    logDataSamplingEnabled,
    logDataSamplingPercentageChanged,
} from "../services/telemetry/tracking_events.js";
import { type IAppState } from "../store/types.js";

function* logDataSamplingUpdated({ payload }: ReturnType<typeof updateDataSamplingPercentage>) {
    const state: IAppState = yield select();
    // we consider updates with a default percentage to be the initial enabling of the feature
    if (payload === DEFAULT_DATA_SAMPLING_PERCENTAGE) {
        yield call(logDataSamplingEnabled, { state });
    } else {
        yield call(logDataSamplingPercentageChanged, { state, dataSamplingPercentage: payload });
    }
}

export function* logDataSamplingDeleted() {
    // lives here rather than in the reducer, because a case reducer must stay pure:
    // a case reducer must stay pure, and the saga is where this domain's side effects live.
    // Storage access itself can throw (blocked storage in an embedded iframe, private mode), and
    // this cleanup is best-effort: an unguarded throw in a takeEvery worker tears down
    // watchDataSampling, which would take every LATER sampling telemetry event with it.
    try {
        yield call([window.sessionStorage, "removeItem"], DATA_SAMPLING_URL);
    } catch {
        // ignore — the percentage leaf is already cleared by the slice
    }

    const state: IAppState = yield select();
    yield call(logDataSamplingDisabled, { state });
}

export function* watchDataSampling() {
    yield takeEvery(ActionTypeKeys.UPDATE_DATA_SAMPLING_PERCENTAGE, logDataSamplingUpdated);
    yield takeEvery(ActionTypeKeys.DELETE_DATA_SAMPLING_PERCENTAGE, logDataSamplingDeleted);
}
