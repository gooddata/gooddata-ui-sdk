// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import { call, cancel } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";

import { initializeDashboard } from "../../../commands/dashboard.js";
import { type IDashboardEvent } from "../../../events/base.js";
import { isDashboardCommandFailed } from "../../../events/general.js";
import { type DashboardEvents } from "../../../events/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { createDashboardStore } from "../../dashboardStore.js";
import { commandEnvelopeWithPromise } from "../rootCommandHandler.js";

/**
 * Every interaction blocks forever, standing in for an export still polling when the store is torn down.
 * `then` yields the proxy, which called as a thenable never invokes its callbacks.
 */
function blockingBackend(): IAnalyticalBackend {
    const blocking: any = new Proxy(function () {}, {
        get: (_target, prop) => (typeof prop === "symbol" ? undefined : blocking),
        apply: () => blocking,
    });

    return blocking;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

function createTestStore(backgroundWorkers: ((context: DashboardContext) => SagaIterator<void>)[] = []) {
    return createDashboardStore({
        dashboardContext: {
            backend: blockingBackend(),
            workspace: "test-workspace",
            dashboardRef: idRef("test-dashboard"),
        } as DashboardContext,
        backgroundWorkers,
        initialRenderMode: "view",
    });
}

const failures = (events: DashboardEvents[]) =>
    events.filter((event) => isDashboardCommandFailed(event as IDashboardEvent));

describe("in-flight command cancellation", () => {
    it("reports a failure for an in-flight command when the root saga task is cancelled", async () => {
        const dashboardStore = createTestStore();
        const events: DashboardEvents[] = [];
        dashboardStore.registerEventHandler({
            eval: () => true,
            handler: (event) => events.push(event),
        });

        dashboardStore.store.dispatch(initializeDashboard(undefined, undefined, "correlation-1") as any);
        await tick();
        expect(failures(events)).toEqual([]);

        dashboardStore.rootSagaTask.cancel();
        await tick();

        expect(failures(events)).toHaveLength(1);
        const failure = failures(events)[0] as any;
        expect(failure.correlationId).toEqual("correlation-1");
        expect(failure.payload.reason).toEqual("CANCELLED");
        expect(failure.payload.command.type).toEqual("GDC.DASH/CMD.INITIALIZE");
    });

    it("rejects the promise of an in-flight command when the root saga task is cancelled", async () => {
        const dashboardStore = createTestStore();
        const { promise, envelope } = commandEnvelopeWithPromise(
            initializeDashboard(undefined, undefined, "correlation-2"),
        );
        const onRejected = vi.fn();
        void promise.catch(onRejected);

        dashboardStore.store.dispatch(envelope as any);
        await tick();
        expect(onRejected).not.toHaveBeenCalled();

        dashboardStore.rootSagaTask.cancel();
        await tick();

        expect(onRejected).toHaveBeenCalledTimes(1);
        expect(onRejected.mock.calls[0][0].payload.reason).toEqual("CANCELLED");
    });

    it("reports a failure for a command still queued behind the in-flight one", async () => {
        const dashboardStore = createTestStore();
        const events: DashboardEvents[] = [];
        dashboardStore.registerEventHandler({
            eval: () => true,
            handler: (event) => events.push(event),
        });

        // Commands are processed one at a time, so the second one is still sitting in the channel buffer.
        dashboardStore.store.dispatch(initializeDashboard(undefined, undefined, "in-flight") as any);
        dashboardStore.store.dispatch(initializeDashboard(undefined, undefined, "queued") as any);
        await tick();

        dashboardStore.rootSagaTask.cancel();
        await tick();

        expect(
            failures(events)
                .map((event) => event.correlationId)
                .sort(),
        ).toEqual(["in-flight", "queued"]);
    });

    it("stops emitting events once a background worker has brought the sagas down", async () => {
        const crashingWorker = function* (): SagaIterator<void> {
            yield call(() => Promise.resolve());
            throw new Error("background worker failed");
        };
        const logged: unknown[] = [];
        vi.spyOn(console, "error").mockImplementation((...args) => logged.push(args[0]));
        const dashboardStore = createTestStore([crashingWorker]);
        const events: DashboardEvents[] = [];
        dashboardStore.registerEventHandler({
            eval: () => true,
            handler: (event) => events.push(event),
        });
        await tick();

        events.length = 0;
        dashboardStore.store.dispatch({ type: "CUSTOM/EVT.PROBE" } as unknown as Action);
        await tick();

        // A surviving emitter would keep invoking handlers, which are given `dispatch`, on a dead store.
        expect(events).toEqual([]);
        // The crash itself must not be swallowed - nothing here catches it, so redux-saga reports it.
        expect(logged.some((entry) => (entry as Error)?.message === "background worker failed")).toBe(true);
    });

    it("keeps processing commands when a background worker cancels itself", async () => {
        const selfCancellingWorker = function* (): SagaIterator<void> {
            yield call(() => Promise.resolve());
            yield cancel();
        };
        const dashboardStore = createTestStore([selfCancellingWorker]);
        const events: DashboardEvents[] = [];
        dashboardStore.registerEventHandler({
            eval: () => true,
            handler: (event) => events.push(event),
        });
        await tick();

        dashboardStore.store.dispatch(initializeDashboard(undefined, undefined, "after-worker") as any);
        await tick();

        // One saga bringing itself down must not take the command pipeline with it: the dashboard would look
        // healthy while silently ignoring everything dispatched at it.
        expect(events.map((event) => event.type)).toContain("GDC.DASH/EVT.COMMAND.STARTED");
    });

    it("does not report a failure for a command that already finished", async () => {
        const dashboardStore = createTestStore();
        const events: DashboardEvents[] = [];
        dashboardStore.registerEventHandler({
            eval: () => true,
            handler: (event) => events.push(event),
        });

        // An unknown command is rejected, so it runs to completion - and the rejection also proves the emitter
        // is delivering, which is what makes the empty failure list below mean something.
        dashboardStore.store.dispatch({
            type: "GDC.DASH/CMD.NO_SUCH_COMMAND",
            correlationId: "finished",
        } as unknown as Action);
        await tick();
        expect(events.map((event) => event.type)).toContain("GDC.DASH/EVT.COMMAND.REJECTED");

        dashboardStore.rootSagaTask.cancel();
        await tick();

        expect(failures(events)).toEqual([]);
    });
});
