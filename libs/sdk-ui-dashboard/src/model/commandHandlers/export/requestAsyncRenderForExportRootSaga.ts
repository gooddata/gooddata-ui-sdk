// (C) 2021 GoodData Corporation
import { Task } from "redux-saga";
import { delay, take, fork, join, race, call, all } from "redux-saga/effects";
import { DashboardEvents } from "../../events";
import { Action } from "@reduxjs/toolkit";

// Time to wait for re-execution
// that could be invoked by changed execution definition after visualization render.
// (e.g. by data received from PluggableVisualization pushData callback)
const REEXECUTION_DELAY = 2000;

function* wait(ms: number): any {
    yield delay(ms);
    return true;
}

const isDashboardEvent =
    <T extends DashboardEvents["type"]>(
        eventType: T,
        pred?: (event: DashboardEvents & { type: T }) => boolean,
    ) =>
    (event: Action): boolean => {
        if (event?.type !== eventType) {
            return false;
        }
        return pred?.(event as DashboardEvents & { type: T }) ?? true;
    };

const isAsyncRenderResolvedEvent = (id: string) =>
    isDashboardEvent("GDC.DASH/EVT.EXPORT.ASYNC_RENDER.RESOLVED", (e) => e.payload.id === id);

const isAsyncRenderRequestedEvent = (id: string) =>
    isDashboardEvent("GDC.DASH/EVT.EXPORT.ASYNC_RENDER.REQUESTED", (e) => e.payload.id === id);

export function* waitForAsyncRenderResolution(id: string): any {
    // Avoid infinite loop
    const maxRetries = 3;
    let retries = 0;

    while (true) {
        yield take(isAsyncRenderResolvedEvent(id));

        // Wait for possible re-execution to cover executions
        // invoked by changed execution definition after visualization render.
        // (e.g. by data received from PluggableVisualization pushData callback)
        const { timeout } = yield race({
            timeout: call(wait, REEXECUTION_DELAY),
            anotherExecution: take(isAsyncRenderRequestedEvent(id)),
        });

        retries += 1;

        // No re-execution, or max retry limit reached - leave the loop
        if (timeout || retries === maxRetries) {
            return;
        }
    }
}

export function* requestAsyncRenderForExportRootSaga(): any {
    yield take("GDC.DASH/EVT.LOADED");
    const twoSecondsToRequestAsyncRenders: Task = yield fork(wait, 2000);
    const sixtySecondsToResolveAsyncRenders: Task = yield fork(wait, 60000);
    const asyncRenderTasks: Map<string, Task> = new Map();

    // Wait max 2 seconds for all async render requests.
    try {
        while (true) {
            const { asyncRenderRequested, finished } = yield race({
                asyncRenderRequested: take("GDC.DASH/EVT.EXPORT.ASYNC_RENDER.REQUESTED"),
                finished: join(twoSecondsToRequestAsyncRenders),
            });

            if (asyncRenderRequested) {
                const asyncRenderId = asyncRenderRequested.payload.id;

                // Check whether async render is already registered.
                // If so, skip it, because possible re-executions are covered in the async render task itself.
                if (asyncRenderTasks.has(asyncRenderId)) {
                    continue;
                }

                // New async render requested, track it.
                const asyncRenderTask = yield fork(waitForAsyncRenderResolution, asyncRenderId);
                asyncRenderTasks.set(asyncRenderId, asyncRenderTask);
            }

            // 2 seconds for async render requests passed. Continue and does not accept new registrations.
            if (finished) {
                break;
            }
        }
    } catch (err) {
        // throw unexpected error.
    }

    // Now, wait for resolution of all the requested async renders, or max 60 seconds.
    const tasksToJoin = Array.from(asyncRenderTasks, ([, task]) => task);
    yield race({
        success: all(tasksToJoin.map((task) => join(task))),
        timeout: join(sixtySecondsToResolveAsyncRenders),
    });
}
