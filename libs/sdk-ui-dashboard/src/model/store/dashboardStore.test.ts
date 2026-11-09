// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { take } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-base";

import { configActions } from "./config/index.js";
import { createDashboardStore } from "./dashboardStore.js";

describe("dashboard store root saga lifecycle", () => {
    it("keeps the existing root saga when it is already running", () => {
        const workerStarted = vi.fn();
        const dashboardStore = createDashboardStore({
            dashboardContext: { backend: dummyBackend(), workspace: "test-workspace" },
            backgroundWorkers: [
                function* (): SagaIterator<void> {
                    workerStarted();
                    yield take("test/command");
                },
            ],
            initialRenderMode: "view",
        });
        const originalTask = dashboardStore.rootSagaTask;

        try {
            dashboardStore.startRootSaga();
            expect(dashboardStore.rootSagaTask).toBe(originalTask);
            expect(workerStarted).toHaveBeenCalledOnce();
        } finally {
            dashboardStore.rootSagaTask.cancel();
        }
    });

    it("restarts cancelled sagas without resetting state or losing event handlers", () => {
        const workerStarted = vi.fn();
        const commandHandled = vi.fn();
        const eventHandler = vi.fn();
        const dashboardStore = createDashboardStore({
            dashboardContext: { backend: dummyBackend(), workspace: "test-workspace" },
            backgroundWorkers: [
                function* (): SagaIterator<void> {
                    workerStarted();
                    while (true) {
                        yield take("test/command");
                        commandHandled();
                    }
                },
            ],
            initialRenderMode: "view",
        });
        dashboardStore.registerEventHandler({ eval: () => true, handler: eventHandler });
        dashboardStore.store.dispatch(configActions.setAiMode("active"));
        const retainedState = dashboardStore.store.getState();
        const originalTask = dashboardStore.rootSagaTask;

        try {
            for (let cycle = 0; cycle < 2; cycle++) {
                dashboardStore.rootSagaTask.cancel();
                dashboardStore.store.dispatch({ type: "test/command" });
                expect(commandHandled).toHaveBeenCalledTimes(cycle);

                dashboardStore.startRootSaga();

                expect(dashboardStore.rootSagaTask.isRunning()).toBe(true);
                expect(dashboardStore.rootSagaTask).not.toBe(originalTask);
                expect(dashboardStore.store.getState()).toBe(retainedState);
                dashboardStore.store.dispatch({ type: "test/command" });
                dashboardStore.store.dispatch({ type: "GDC.DASH/EVT.TEST" });
                expect(commandHandled).toHaveBeenCalledTimes(cycle + 1);
                expect(eventHandler).toHaveBeenCalledTimes(cycle + 1);
            }
            expect(workerStarted).toHaveBeenCalledTimes(3);
        } finally {
            dashboardStore.rootSagaTask.cancel();
        }
        expect(dashboardStore.rootSagaTask.isCancelled()).toBe(true);
    });
});
