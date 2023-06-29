// (C) 2021-2022 GoodData Corporation
import { Task, SagaIterator } from "redux-saga";
import { put, delay, take, join, race, call, all, spawn, cancel, actionChannel } from "redux-saga/effects";
import { v4 as uuidv4 } from "uuid";
import { DashboardContext } from "../../types/commonTypes.js";
import { newDashboardEventPredicate } from "../../events/index.js";
import { renderRequested, renderResolved } from "../../events/render.js";

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

/**
 * @internal
 */
export interface RenderingWorkerConfiguration {
    /**
     * Maximum time limit for rendering the dashboard.
     * Somehow in sync with limits of exporter
     * https://github.com/gooddata/gdc-exporters-microservices/blob/master/microservices/visual-exporter-service/src/main/kotlin/com/gooddata/exporters/visual/config/TabSessionConfig.kt
     *
     * Default: 20*60000 (20min).
     * @privateRemarks
     * If changing this value update it also in documentation of {@link requestAsyncRender} command creator and {@link useDashboardAsyncRender} hook.
     */
    maxTimeout: number;

    /**
     * Maximum time limit for the first asynchronous rendering request.
     * If no asynchronous rendering request is fired in this time limit, the dashboard will announce that it is rendered.
     *
     * Default: 2000 (2s).
     */
    asyncRenderRequestedTimeout: number;

    /**
     * Maximum time limit to re-request asynchronous rendering of the component once it's resolved.
     *
     * Default: 2000 (2s).
     */
    asyncRenderResolvedTimeout: number;

    /**
     * Generator of correlation ids
     *
     * Default: uuid4
     */
    correlationIdGenerator: () => string;
}

export function newRenderingWorker(
    config: RenderingWorkerConfiguration = {
        asyncRenderRequestedTimeout: 2000,
        asyncRenderResolvedTimeout: 2000,
        maxTimeout: 20 * 60000,
        correlationIdGenerator: uuidv4,
    },
) {
    return function* renderingWorker(ctx: DashboardContext): SagaIterator<void> {
        try {
            // Provide a correlation id so that event handlers can correlate the start and end of the rendering
            const correlationId = config.correlationIdGenerator();

            // First, notify that the rendering of the whole dashboard started.
            yield put(renderRequested(ctx, correlationId));

            // Wait for the dashboard initialization.
            yield take("GDC.DASH/EVT.INITIALIZED");

            // Collect async rendering requests.
            const asyncRenderTasks = yield call(collectAsyncRenderTasks, config);

            // Wait for the resolution of all async rendering tasks.
            yield call(waitForAsyncRenderTasksResolution, asyncRenderTasks, config);

            // Notify that the dashboard is fully rendered.
            yield put(renderResolved(ctx, correlationId));
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
