// (C) 2021-2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IDashboard, idRef } from "@gooddata/sdk-model";

import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext.js";
import { defaultDateFilterConfig } from "../../../../_staging/dateFilterConfig/defaultConfig.js";
import { initializeDashboard } from "../../../commands/dashboard.js";
import { requestAsyncRender, resolveAsyncRender } from "../../../commands/render.js";
import { DashboardTester } from "../../../tests/DashboardTester.js";
import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
} from "../../../tests/fixtures/Dashboard.fixtures.js";
import { type PrivateDashboardContext } from "../../../types/commonTypes.js";
import { EmptyDashboardLayout } from "../../dashboard/common/dashboardInitialize.js";

const advanceStep = 25;
const maxAdvance = 10000;

/**
 * The rendering worker is driven purely by timeouts (redux-saga `delay`), so on real timers these tests spend
 * their whole runtime sleeping. With fake timers the clock can be jumped instead: this helper advances the fake
 * clock in small steps - flushing microtasks in between, so that the sagas and promise chains can progress -
 * until the awaited promise settles, and then propagates its outcome.
 */
async function settle<T>(promise: Promise<T>): Promise<T> {
    let settled = false;

    // capture the outcome instead of re-throwing it, so that a rejection is never left unhandled
    // while the fake clock is still being advanced below
    const outcome = promise.then(
        (value) => {
            settled = true;
            return { rejected: false as const, value };
        },
        (reason: unknown) => {
            settled = true;
            return { rejected: true as const, reason };
        },
    );

    for (let elapsed = 0; !settled && elapsed < maxAdvance; elapsed += advanceStep) {
        await vi.advanceTimersByTimeAsync(advanceStep);
    }

    if (!settled) {
        throw new Error(`Promise did not settle within ${maxAdvance}ms of fake time`);
    }

    const result = await outcome;

    if (result.rejected) {
        throw result.reason;
    }

    return result.value;
}

describe("renderingWorker", () => {
    let Tester: DashboardTester;

    const dashboardWithDefaults: IDashboard = {
        ...EmptyDashboardWithReferences.dashboard,
        ref: idRef(EmptyDashboardIdentifier),
        identifier: EmptyDashboardIdentifier,
        layout: EmptyDashboardLayout,
        filterContext: createDefaultFilterContext(
            defaultDateFilterConfig,
            true,
        ) as IDashboard["filterContext"],
    };

    const customizationFnsWithPreload: PrivateDashboardContext = {
        preloadedDashboard: dashboardWithDefaults,
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("maximum timeout", () => {
        const asyncRenderRequestedTimeout = 200;
        const asyncRenderResolvedTimeout = 200;
        const maxTimeout = 400;

        beforeEach(
            () =>
                (Tester = DashboardTester.forRecording(EmptyDashboardIdentifier, {
                    renderingWorkerConfig: {
                        asyncRenderRequestedTimeout,
                        asyncRenderResolvedTimeout,
                        maxTimeout,
                        correlationIdGenerator: () => "correlation",
                    },
                    customizationFns: customizationFnsWithPreload,
                })) as any,
        );

        it("should emit render resolved, when async rendering is still running, but the maximum timeout reached", async () => {
            const componentId = "component";
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            Tester.dispatch(requestAsyncRender(componentId));
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", maxTimeout + 100)); // wait for a bit longer to stabilize this test
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("async rendering resolution", () => {
        const asyncRenderRequestedTimeout = 200;
        const asyncRenderResolvedTimeout = 200;
        const maxTimeout = 2000;

        beforeEach(
            () =>
                (Tester = DashboardTester.forRecording(EmptyDashboardIdentifier, {
                    renderingWorkerConfig: {
                        asyncRenderRequestedTimeout,
                        asyncRenderResolvedTimeout,
                        maxTimeout,
                        correlationIdGenerator: () => "correlation",
                    },
                    customizationFns: customizationFnsWithPreload,
                })) as any,
        );

        it("should emit render resolved, when no async rendering is requested during the asyncRenderRequestedTimeout", async () => {
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderRequestedTimeout));
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should emit render resolved, when async renderings are resolved during the asyncRenderRequestedTimeout", async () => {
            const componentId = "component";
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            Tester.dispatch(requestAsyncRender(componentId));
            Tester.dispatch(resolveAsyncRender(componentId));
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderRequestedTimeout));
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should emit render resolved after async rendering resolution", async () => {
            const componentId = "component";
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            Tester.dispatch(requestAsyncRender(componentId));
            await settle(Tester.wait(asyncRenderRequestedTimeout));
            Tester.dispatch(resolveAsyncRender(componentId));
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout));
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should emit render resolved after async rendering resolution, even if the component requested async rendering multiple times before the resolution", async () => {
            const componentId = "component";
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            Tester.dispatch(requestAsyncRender(componentId));
            await settle(Tester.wait(asyncRenderRequestedTimeout));
            Tester.dispatch(requestAsyncRender(componentId));
            Tester.dispatch(resolveAsyncRender(componentId));
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout));
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should not emit render resolved, when async rendering is not resolved", async () => {
            const componentId = "component";
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            Tester.dispatch(requestAsyncRender(componentId));
            await settle(Tester.wait(asyncRenderRequestedTimeout));
            await expect(
                settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout)),
            ).rejects.toThrowErrorMatchingSnapshot();
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should accept new async rendering requests, when running requests are not yet resolved", async () => {
            const componentId = "component";
            const componentId2 = "component2";
            const componentId3 = "component3";
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            Tester.dispatch(requestAsyncRender(componentId));
            await settle(Tester.wait(asyncRenderRequestedTimeout));
            Tester.dispatch(requestAsyncRender(componentId2));
            Tester.dispatch(requestAsyncRender(componentId3));
            await settle(Tester.wait(300));
            Tester.dispatch(resolveAsyncRender(componentId));
            Tester.dispatch(resolveAsyncRender(componentId2));
            Tester.dispatch(resolveAsyncRender(componentId3));
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout));
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should accept new async rendering request, when it's fired within time limit after resolution", async () => {
            const componentId = "component";
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED"));
            await settle(Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED"));
            Tester.dispatch(requestAsyncRender(componentId));
            await settle(Tester.wait(asyncRenderRequestedTimeout));
            Tester.dispatch(resolveAsyncRender(componentId));
            Tester.dispatch(requestAsyncRender(componentId));
            await settle(Tester.wait(300));
            Tester.dispatch(resolveAsyncRender(componentId));
            await settle(Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout));
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
