// (C) 2026 GoodData Corporation

import { expectSaga, testSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { DATA_SAMPLING_URL } from "../constants/data_sampling.js";
import { logDataSamplingDisabled } from "../services/telemetry/tracking_events.js";
import { type IAppState } from "../store/types.js";

import { logDataSamplingDeleted } from "./data_sample_sagas.js";

/**
 * The sessionStorage removal lives in the saga rather than the reducer, and sequences BEFORE the
 * telemetry in the same takeEvery worker. The guard around it is what keeps a blocked-storage
 * environment from tearing down watchDataSampling and silencing every later sampling event.
 */
describe("logDataSamplingDeleted", () => {
    const state = {} as IAppState;
    const removeSamplingEntry = call([window.sessionStorage, "removeItem"], DATA_SAMPLING_URL);

    // testSaga, not expectSaga: the ORDER is the contract here — the storage call sequences
    // BEFORE the telemetry in the same worker, which is the whole reason it needs guarding.
    // expectSaga's `.call()` assertions are order-independent, so they would pass just as
    // happily with the two effects swapped.
    it("removes the sampling entry, then selects, then logs the disabled event", () => {
        testSaga(logDataSamplingDeleted)
            .next()
            .call([window.sessionStorage, "removeItem"], DATA_SAMPLING_URL)
            .next()
            .select()
            .next(state)
            .call(logDataSamplingDisabled, { state })
            .next()
            .isDone();
    });

    it("still logs the disabled event when the storage access throws", async () => {
        await expectSaga(logDataSamplingDeleted)
            .provide([
                [removeSamplingEntry, throwError(new Error("storage blocked"))],
                [select(), state],
                [call(logDataSamplingDisabled, { state }), undefined],
            ])
            .call(logDataSamplingDisabled, { state })
            .run();
    });
});
