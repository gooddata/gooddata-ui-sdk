// (C) 2021-2025 GoodData Corporation
import { omit } from "lodash-es";
import { SagaIterator, Task } from "redux-saga";
import { actionChannel, all, call, cancel, delay, join, put, race, spawn, take } from "redux-saga/effects";
import { v4 as uuidv4 } from "uuid";

import { RenderingWorkerConfiguration } from "./types.js";
import { newDashboardEventPredicate } from "../../events/index.js";
import { renderRequested, renderResolvedWithDetails } from "../../events/render.js";
import { executedActions } from "../../store/executed/index.js";
import { DashboardContext } from "../../types/commonTypes.js";

function* wait(ms: number): SagaIterator<true> {
    yield delay(ms);
    return true;
}

const isAsyncRenderResolvedEvent = (id?: string) =>
    newDashboardEventPredicate(
        "GDC.DASH/EVT.RENDER.ASYNC.RESOLVED",
        id ? (e) => e.payload.id === id : () => true,
    );

const isAsyncRenderRequestedEvent = (id?: string) =>
    newDashboardEventPredicate(
        "GDC.DASH/EVT.RENDER.ASYNC.REQUESTED",
        id ? (e) => e.payload.id === id : () => true,
    );

const baseConfig: RenderingWorkerConfiguration = {
    asyncRenderRequestedTimeout: 5000,
    asyncRenderResolvedTimeout: 2000,
    maxTimeout: 20 * 60000,
    correlationIdGenerator: uuidv4,
    isExport: false,
};

export function newRenderingWorker(renderingWorkerConfig: Partial<RenderingWorkerConfiguration>) {
    return function* renderingWorker(ctx: DashboardContext): SagaIterator<void> {
        const config = { ...baseConfig, ...renderingWorkerConfig };
        try {
            // Provide a correlation id so that event handlers can correlate the start and end of the rendering
            const correlationId = config.correlationIdGenerator();

            // set flag
            yield put(executedActions.setDashboardExecutionStart());

            // First, notify that the rendering of the whole dashboard started.
            yield put(renderRequested(ctx, correlationId));

            // Wait for the dashboard initialization.
            yield take("GDC.DASH/EVT.INITIALIZED");

            // Collect async rendering requests.
            const asyncRenderTasks = yield call(collectAsyncRenderTasks, config);

            // Wait for the resolution of all async rendering tasks.
            yield call(waitForAsyncRenderTasksResolution, asyncRenderTasks, config);

            // set flag
            yield put(executedActions.setDashboardExecutionDone());

            // Notify that the dashboard is fully rendered.
            yield put(renderResolvedWithDetails(ctx, omit(config, "correlationIdGenerator"), correlationId));
        } catch (err) {
            console.error("Rendering worker failed", err);
        }
    };
}

function* collectAsyncRenderTasks(config: RenderingWorkerConfiguration): SagaIterator<Map<string, Task>> {
    const asyncRenderTasks = new Map<string, Task>();
    const timeout: Task = yield spawn(wait, config.asyncRenderRequestedTimeout);
    const renderRequestedChannel = yield actionChannel(isAsyncRenderRequestedEvent());

    while (true) {
        const { asyncRenderRequested, timeoutResolved } = yield race({
            asyncRenderRequested: take(renderRequestedChannel),
            timeoutResolved: join(timeout),
        });

        if (timeoutResolved) {
            if (
                config.asyncRenderExpectedCount !== undefined &&
                config.asyncRenderExpectedCount !== 0 &&
                config.isExport
            ) {
                // put as console.error in export mode to get to the exporter logs
                console.error(
                    `Rendering worker reached timeout with ${asyncRenderTasks.size} registered tasks, expected ${config.asyncRenderExpectedCount}`,
                );
            }
            break;
        }

        const asyncRenderId = asyncRenderRequested.payload.id;

        // Check whether async render is already registered.
        // If so, skip it, because possible re-executions are covered in the async render task itself.
        if (asyncRenderTasks.has(asyncRenderId)) {
            continue;
        }

        // New async render requested, spawn it.
        const asyncRenderTask = yield spawn(waitForAsyncRenderResolution, asyncRenderId, config);
        asyncRenderTasks.set(asyncRenderId, asyncRenderTask);

        // expected count of async renders was received, no need to wait longer
        if (
            config.asyncRenderExpectedCount !== undefined &&
            asyncRenderTasks.size >= config.asyncRenderExpectedCount
        ) {
            break;
        }
    }

    return asyncRenderTasks;
}

function* waitForAsyncRenderTasksResolution(
    asyncRenderTasks: Map<string, Task>,
    config: RenderingWorkerConfiguration,
): SagaIterator<void> {
    const timeout: Task = yield spawn(wait, config.maxTimeout - config.asyncRenderRequestedTimeout);
    const renderRequestedChannel = yield actionChannel(isAsyncRenderRequestedEvent());
    while (true) {
        // Now, wait for resolution of all the requested async renders, or max `config.maxTimeout` milliseconds.
        // Accept also new async render requests, but only in case that all tasks are not already resolved.
        const asyncRenderTasksList = Array.from(asyncRenderTasks, ([, task]) => task);

        const { asyncTasksResolved, asyncRenderRequested, timeoutResolved } = yield race({
            asyncRenderRequested: take(renderRequestedChannel),
            asyncTasksResolved: all(asyncRenderTasksList.map((task) => join(task))),
            timeoutResolved: join(timeout),
        });

        if (timeoutResolved || asyncTasksResolved) {
            asyncRenderTasksList.forEach((task) => task.cancel());
            yield cancel(timeout);
            return;
        }

        // If the previous async rendering tasks have not yet been resolved,
        // also accept the new asynchronous rendering requests.
        if (asyncRenderRequested) {
            const asyncRenderId = asyncRenderRequested.payload.id;

            // Check whether async render is already registered.
            // If so, skip it, because possible re-executions are covered in the async render task itself.
            if (asyncRenderTasks.has(asyncRenderId)) {
                continue;
            }

            // New async render requested, track it.
            const asyncRenderTask = yield spawn(waitForAsyncRenderResolution, asyncRenderId, config);
            asyncRenderTasks.set(asyncRenderId, asyncRenderTask);
        }
    }
}

function* waitForAsyncRenderResolution(id: string, config: RenderingWorkerConfiguration): SagaIterator<void> {
    // Avoid infinite loop
    const maxRetries = 3;
    let retries = 0;
    const renderResolvedChannel = yield actionChannel(isAsyncRenderResolvedEvent(id));

    while (true) {
        yield take(renderResolvedChannel);

        // Wait for possible re-execution to cover executions
        // invoked by changed execution definition after visualization render.
        // (e.g. by data received from PluggableVisualization pushData callback)
        const { timeout } = yield race({
            timeout: call(wait, config.asyncRenderResolvedTimeout),
            anotherExecution: take(isAsyncRenderRequestedEvent(id)),
        });

        retries += 1;

        // No re-execution, or max retry limit reached - leave the loop
        if (timeout || retries === maxRetries) {
            return;
        }
    }
}
