// (C) 2026 GoodData Corporation

import { type call, put, select } from "redux-saga/effects";
import { afterEach, describe, expect, it, vi } from "vitest";

import { reportExecutionStarted } from "../../actions/report_actions.js";
import { isExecutionProgressEnabled } from "../../selectors/feature_flag_selector.js";

import {
    executionProgressStarted,
    executionStatsOpened,
    executionStatsProfileLoading,
} from "./execution_progress_actions.js";
import {
    clearStaleExecutionProgress,
    loadExecutionStatsProfile,
    trackReportExecutionProgress,
} from "./execution_progress_saga.js";
import { type IExecutionProgressState, executionProgressInitialState } from "./execution_progress_state.js";

// the mock is available in development builds only
const buildParams = vi.hoisted(() => ({ debug: true }));
vi.mock("../../buildParams.js", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    get IS_DEBUG() {
        return buildParams.debug;
    },
}));

const MOCK_STORAGE_KEY = "executionProgressMock";

describe("execution progress saga", () => {
    afterEach(() => {
        window.localStorage.removeItem(MOCK_STORAGE_KEY);
        buildParams.debug = true;
    });

    // the sagas are stepped by hand: each step receives the result of the effect yielded before
    type SteppedSaga = Generator<unknown, unknown, unknown>;
    const start = () => trackReportExecutionProgress(reportExecutionStarted("report-1", 1000)) as SteppedSaga;

    describe("trackReportExecutionProgress", () => {
        it("should start no progress work when the flag is off", () => {
            const saga = start();

            expect(saga.next().value).toEqual(select(isExecutionProgressEnabled));
            expect(saga.next(false).done).toBe(true);
        });

        it("should start no progress work when the flag is off, even with the mock on", () => {
            window.localStorage.setItem(MOCK_STORAGE_KEY, "fresh");
            const saga = start();

            saga.next();
            expect(saga.next(false).done).toBe(true);
        });

        it("should wait for the report's execute call when the flag is on", () => {
            const saga = start();

            saga.next();
            const effect = saga.next(true).value as ReturnType<typeof call>;
            expect(effect.type).toBe("CALL");
            expect(effect.payload.args).toEqual([1000]);
        });

        it("should follow the mocked stream when the flag is on and the mock is on", () => {
            window.localStorage.setItem(MOCK_STORAGE_KEY, "fresh");
            const saga = start();

            saga.next();
            expect(saga.next(true).value).toEqual(
                put(
                    executionProgressStarted({
                        reportExecutionId: "report-1",
                        executionId: "mock-report-1",
                        source: "network",
                        resultId: "mock-result-report-1",
                    }),
                ),
            );
        });

        it("should ignore the mock in a production build", () => {
            buildParams.debug = false;
            window.localStorage.setItem(MOCK_STORAGE_KEY, "fresh");
            const saga = start();

            saga.next();
            const effect = saga.next(true).value as ReturnType<typeof call>;
            // waits for the real execute call instead of starting the mocked stream
            expect(effect.type).toBe("CALL");
            expect(effect.payload.args).toEqual([1000]);
        });
    });

    describe("loadExecutionStatsProfile", () => {
        it("should load again when the stats reopen while a cancelled load left the profile loading", () => {
            // the mocked execution registers the profile loader of report-1
            window.localStorage.setItem(MOCK_STORAGE_KEY, "cacheHit");
            const tracking = start();
            tracking.next();
            tracking.next(true);

            const state: IExecutionProgressState = {
                ...executionProgressInitialState,
                reportExecutionId: "report-1",
                storedProfile: { status: "loading", profile: null },
            };
            const saga = loadExecutionStatsProfile(
                executionStatsOpened({ reportExecutionId: "report-1" }),
            ) as SteppedSaga;

            saga.next();
            expect(saga.next(state).value).toEqual(
                put(executionStatsProfileLoading({ reportExecutionId: "report-1" })),
            );
        });
    });

    describe("clearStaleExecutionProgress", () => {
        it("should do nothing when the flag is off", () => {
            const saga = clearStaleExecutionProgress() as SteppedSaga;

            expect(saga.next().value).toEqual(select(isExecutionProgressEnabled));
            expect(saga.next(false).done).toBe(true);
        });
    });
});
