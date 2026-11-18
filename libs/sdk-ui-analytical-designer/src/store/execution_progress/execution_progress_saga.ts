// (C) 2026 GoodData Corporation

import { type EventChannel, eventChannel } from "redux-saga";
import {
    type SagaReturnType,
    call,
    cancelled,
    put,
    race,
    select,
    take,
    takeLatest,
} from "redux-saga/effects";

import {
    type IComputationProfile,
    type IExecutionProgressEvent,
    getExecutionProgress,
} from "@gooddata/sdk-backend-tiger";

import { reportExecutionStarted } from "../../actions/report_actions.js";
import { type IExecutedResult, getLastExecutedResult, subscribeToExecutedResults } from "../../backend.js";
import { isExecutionProgressEnabled } from "../../selectors/feature_flag_selector.js";
import { isReportExecutableSelector } from "../../selectors/report_selector.js";

import {
    executionProgressCleared,
    executionProgressEventReceived,
    executionProgressStarted,
    executionProgressStreamClosed,
    executionProgressUnavailable,
    executionStatsOpened,
    executionStatsProfileFailed,
    executionStatsProfileLoaded,
    executionStatsProfileLoading,
} from "./execution_progress_actions.js";
import { getExecutionProgressMock } from "./execution_progress_mock.js";
import { getExecutionProgressState } from "./execution_progress_selectors.js";
import { type IExecutionProgressState } from "./execution_progress_state.js";

/** how long the report execution waits for its execute call before giving the progress up */
const EXECUTE_WAIT_MS = 15_000;
/** an execute call that resolved this long before the report execution started still belongs to it */
const EXECUTE_GRACE_MS = 50;
const MAX_SHOWN_EXECUTIONS = 200;

/**
 * Backend execution ids whose progress was followed to the end. The client caches execution
 * results, so an execute call answered from the cache resolves to the execution that produced the
 * result originally. A stream that was cancelled or failed is not remembered: it is followed again.
 */
const shownExecutionIds = new Set<string>();

function rememberShownExecution(executionId: string): void {
    shownExecutionIds.delete(executionId);
    shownExecutionIds.add(executionId);
    if (shownExecutionIds.size > MAX_SHOWN_EXECUTIONS) {
        const oldest = shownExecutionIds.values().next().value;
        if (oldest !== undefined) {
            shownExecutionIds.delete(oldest);
        }
    }
}

/**
 * Loads the stored profile of the CURRENT report execution's result. Results are not kept in the
 * store (not serializable), so the loader is kept here, keyed by the report execution.
 */
let profileLoader:
    | { reportExecutionId: string; load: (signal?: AbortSignal) => Promise<IComputationProfile | null> }
    | undefined;

function createExecutedResultChannel(): EventChannel<IExecutedResult> {
    return eventChannel((emit) => subscribeToExecutedResults(emit));
}

type StreamMessage =
    | { type: "event"; event: IExecutionProgressEvent }
    | { type: "error"; error: unknown }
    | { type: "done" };

function createStreamChannel(stream: ReadableStream<IExecutionProgressEvent>): EventChannel<StreamMessage> {
    return eventChannel((emit) => {
        const reader = stream.getReader();
        let active = true;
        const pump = async () => {
            try {
                while (active) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    emit({ type: "event", event: value });
                }
            } catch (error) {
                if (active) {
                    emit({ type: "error", error });
                }
            }
            if (active) {
                emit({ type: "done" });
            }
        };
        void pump();
        return () => {
            active = false;
            reader.cancel().catch(() => {});
        };
    });
}

/**
 * The FIRST execute call after the report execution started is the report's own: the
 * visualization executes its data first, the secondary executions (forecast, clustering,
 * tooltips) follow once it rendered.
 */
function* waitForReportExecute(startTime: number) {
    const last = getLastExecutedResult();
    if (last && last.executedAt >= startTime - EXECUTE_GRACE_MS) {
        return last.result;
    }

    const channel: EventChannel<IExecutedResult> = yield call(createExecutedResultChannel);
    try {
        const { executed }: { executed?: IExecutedResult } = yield race({
            executed: take(channel),
            timeout: call(delay, EXECUTE_WAIT_MS),
        });
        return executed?.result;
    } finally {
        channel.close();
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function* trackReportExecutionProgress(action: ReturnType<typeof reportExecutionStarted>) {
    const enabled: SagaReturnType<typeof isExecutionProgressEnabled> =
        yield select(isExecutionProgressEnabled);
    if (!enabled) {
        return;
    }

    const reportExecutionId = action.meta.id;
    const mock = getExecutionProgressMock();
    profileLoader = undefined;

    let executionId: string;
    let resultId: string | undefined;
    let openStream: (signal: AbortSignal) => ReadableStream<IExecutionProgressEvent>;

    if (mock) {
        executionId = `mock-${reportExecutionId}`;
        resultId = `mock-result-${reportExecutionId}`;
        openStream = mock.stream;
        profileLoader = { reportExecutionId, load: mock.loadComputationProfile };
    } else {
        const result: SagaReturnType<typeof waitForReportExecute> = yield call(
            waitForReportExecute,
            action.meta.startTime,
        );
        const progress = result ? getExecutionProgress(result) : undefined;
        if (!progress) {
            yield put(executionProgressUnavailable({ reportExecutionId }));
            return;
        }
        resultId = result?.resultId?.();
        profileLoader = { reportExecutionId, load: progress.loadComputationProfile };
        if (shownExecutionIds.has(progress.executionId)) {
            yield put(
                executionProgressStarted({
                    reportExecutionId,
                    executionId: progress.executionId,
                    source: "browserCache",
                    resultId,
                }),
            );
            return;
        }
        executionId = progress.executionId;
        openStream = progress.stream;
    }

    yield put(executionProgressStarted({ reportExecutionId, executionId, source: "network", resultId }));

    const abortController = new AbortController();
    const channel: EventChannel<StreamMessage> = yield call(
        createStreamChannel,
        openStream(abortController.signal),
    );
    try {
        while (true) {
            const message: StreamMessage = yield take(channel);
            if (message.type === "error") {
                yield put(executionProgressUnavailable({ reportExecutionId }));
                return;
            }
            if (message.type === "done") {
                rememberShownExecution(executionId);
                yield put(executionProgressStreamClosed({ reportExecutionId }));
                return;
            }
            yield put(executionProgressEventReceived(reportExecutionId, message.event, Date.now()));
        }
    } finally {
        abortController.abort();
        channel.close();
    }
}

/**
 * Each report execution follows its own progress; a new execution cancels the previous stream.
 */
export function* watchExecutionProgress() {
    yield takeLatest(reportExecutionStarted.type, trackReportExecutionProgress);
}

/**
 * Loads the stored profile of the result the first time the execution stats are opened. A reopen
 * while the profile loads restarts the load (takeLatest cancels the previous one, which leaves the
 * status at `loading`), so only a loaded profile is skipped.
 */
export function* loadExecutionStatsProfile(action: ReturnType<typeof executionStatsOpened>) {
    const { reportExecutionId } = action.payload;
    const state: SagaReturnType<typeof getExecutionProgressState> = yield select(getExecutionProgressState);
    if (state.reportExecutionId !== reportExecutionId || state.storedProfile.status === "loaded") {
        return;
    }
    const loader = profileLoader?.reportExecutionId === reportExecutionId ? profileLoader.load : undefined;
    if (!loader) {
        yield put(executionStatsProfileFailed({ reportExecutionId, unavailable: true }));
        return;
    }
    yield put(executionStatsProfileLoading({ reportExecutionId }));
    const abortController = new AbortController();
    try {
        const profile: IComputationProfile | null = yield call(loader, abortController.signal);
        yield put(executionStatsProfileLoaded({ reportExecutionId, profile }));
    } catch {
        yield put(executionStatsProfileFailed({ reportExecutionId }));
    } finally {
        const wasCancelled: boolean = yield cancelled();
        if (wasCancelled) {
            abortController.abort();
        }
    }
}

export function* watchExecutionStats() {
    yield takeLatest(executionStatsOpened.type, loadExecutionStatsProfile);
}

/**
 * The stats of the last report execution are stale once the report does not execute any more: the
 * buckets were emptied (Clear, undo to an empty state), a new or non-executable insight is open.
 */
export function shouldClearExecutionProgress(isExecutable: boolean, state: IExecutionProgressState): boolean {
    return !isExecutable && state.reportExecutionId !== null;
}

export function* clearStaleExecutionProgress() {
    const enabled: SagaReturnType<typeof isExecutionProgressEnabled> =
        yield select(isExecutionProgressEnabled);
    if (!enabled) {
        return;
    }
    const state: SagaReturnType<typeof getExecutionProgressState> = yield select(getExecutionProgressState);
    if (state.reportExecutionId === null) {
        return;
    }
    const isExecutable: SagaReturnType<typeof isReportExecutableSelector> =
        yield select(isReportExecutableSelector);
    if (shouldClearExecutionProgress(isExecutable, state)) {
        yield put(executionProgressCleared());
    }
}

export function* watchExecutionProgressReset() {
    // any action may empty the report (bucket edits, clear, undo/redo, opening an insight); the
    // check is synchronous, so one loop does it without forking a task per action
    while (true) {
        yield take("*");
        yield call(clearStaleExecutionProgress);
    }
}
