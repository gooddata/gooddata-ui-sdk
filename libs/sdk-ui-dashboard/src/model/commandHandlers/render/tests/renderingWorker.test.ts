// (C) 2021-2022 GoodData Corporation
import { initializeDashboard } from "../../../commands/index.js";
import { DashboardTester } from "../../../tests/DashboardTester.js";
import { EmptyDashboardIdentifier } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { requestAsyncRender, resolveAsyncRender } from "../../../commands/render.js";
import { describe, it, expect, beforeEach } from "vitest";

describe("renderingWorker", () => {
    let Tester: DashboardTester;

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
                })) as any,
        );

        it("should emit render resolved, when async rendering is still running, but the maximum timeout reached", async () => {
            const componentId = "component";
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.dispatch(requestAsyncRender(componentId));
            await Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", maxTimeout + 100); // wait for a bit longer to stabilize this test
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
                })) as any,
        );

        it("should emit render resolved, when no async rendering is requested during the asyncRenderRequestedTimeout", async () => {
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            await Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderRequestedTimeout);
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should emit render resolved, when async renderings are resolved during the asyncRenderRequestedTimeout", async () => {
            const componentId = "component";
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.dispatch(requestAsyncRender(componentId));
            Tester.dispatch(resolveAsyncRender(componentId));
            await Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderRequestedTimeout);
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should emit render resolved after async rendering resolution", async () => {
            const componentId = "component";
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.dispatch(requestAsyncRender(componentId));
            await Tester.wait(asyncRenderRequestedTimeout);
            Tester.dispatch(resolveAsyncRender(componentId));
            await Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout);
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should emit render resolved after async rendering resolution, even if the component requested async rendering multiple times before the resolution", async () => {
            const componentId = "component";
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.dispatch(requestAsyncRender(componentId));
            await Tester.wait(asyncRenderRequestedTimeout);
            Tester.dispatch(requestAsyncRender(componentId));
            Tester.dispatch(resolveAsyncRender(componentId));
            await Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout);
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should not emit render resolved, when async rendering is not resolved", async () => {
            const componentId = "component";
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.dispatch(requestAsyncRender(componentId));
            await Tester.wait(asyncRenderRequestedTimeout);
            await expect(
                Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout),
            ).rejects.toThrowErrorMatchingSnapshot();
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should accept new async rendering requests, when running requests are not yet resolved", async () => {
            const componentId = "component";
            const componentId2 = "component2";
            const componentId3 = "component3";
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.dispatch(requestAsyncRender(componentId));
            await Tester.wait(asyncRenderRequestedTimeout);
            Tester.dispatch(requestAsyncRender(componentId2));
            Tester.dispatch(requestAsyncRender(componentId3));
            await Tester.wait(300);
            Tester.dispatch(resolveAsyncRender(componentId));
            Tester.dispatch(resolveAsyncRender(componentId2));
            Tester.dispatch(resolveAsyncRender(componentId3));
            await Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout);
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should accept new async rendering request, when it's fired within time limit after resolution", async () => {
            const componentId = "component";
            await Tester.waitFor("GDC.DASH/EVT.RENDER.REQUESTED");
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.dispatch(requestAsyncRender(componentId));
            await Tester.wait(asyncRenderRequestedTimeout);
            Tester.dispatch(resolveAsyncRender(componentId));
            Tester.dispatch(requestAsyncRender(componentId));
            await Tester.wait(300);
            Tester.dispatch(resolveAsyncRender(componentId));
            await Tester.waitFor("GDC.DASH/EVT.RENDER.RESOLVED", asyncRenderResolvedTimeout);
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
