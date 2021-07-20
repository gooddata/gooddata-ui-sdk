// (C) 2021 GoodData Corporation
import { Task, SagaIterator } from "redux-saga";
import { put, delay, take, join, race, call, all, spawn, cancel, actionChannel } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { newDashboardEventPredicate, renderResolved, renderRequested } from "../../events";

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
     *
     * Default: 60000 (60s).
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
}

export function newRenderingWorker(
    config: RenderingWorkerConfiguration = {
        asyncRenderRequestedTimeout: 2000,
        asyncRenderResolvedTimeout: 2000,
        maxTimeout: 60000,
    },
) {
    return function* renderingWorker(ctx: DashboardContext): SagaIterator<void> {
        try {
            // First, notify that the rendering of the whole dashboard started.
            yield put(renderRequested(ctx));

            // Wait for the dashboard initialization.
            yield take("GDC.DASH/EVT.LOADED");

            // Collect async rendering requests.
            const asyncRenderTasks = yield call(collectAsyncRenderTasks, config);

            // Wait for the resolution of all async rendering tasks.
            yield call(waitForAsyncRenderTasksResolution, asyncRenderTasks, config);

            // Notify that the dashboard is fully rendered.
            yield put(renderResolved(ctx));
        } catch (err) {
            // eslint-disable-next-line no-console
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
        // Now, wait for resolution of all the requested async renders, or max 60 seconds.
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
    const renderRequestedChannel = yield actionChannel(isAsyncRenderRequestedEvent(id));

    while (true) {
        yield take(renderResolvedChannel);

        // Wait for possible re-execution to cover executions
        // invoked by changed execution definition after visualization render.
        // (e.g. by data received from PluggableVisualization pushData callback)
        const { timeout } = yield race({
            timeout: call(wait, config.asyncRenderResolvedTimeout),
            anotherExecution: take(renderRequestedChannel),
        });

        retries += 1;

        // No re-execution, or max retry limit reached - leave the loop
        if (timeout || retries === maxRetries) {
            return;
        }
    }
}
