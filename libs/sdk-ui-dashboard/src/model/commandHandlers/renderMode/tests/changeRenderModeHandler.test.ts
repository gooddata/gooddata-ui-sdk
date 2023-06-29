// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { SimpleDashboardNoDrillsIdentifier } from "../../../tests/fixtures/SimpleDashboardNoDrills.fixtures.js";
import { selectRenderMode } from "../../../store/index.js";
import {
    changeRenderMode,
    initializeDashboard,
    cancelEditRenderMode,
    switchToEditRenderMode,
} from "../../../commands/index.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";

describe("changeRenderModeHandler", () => {
    let Tester: DashboardTester;

    describe("without initial config", () => {
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardNoDrillsIdentifier);
        });

        it("should be view if initialRenderMode is not specified on config", async () => {
            const renderMode = await Tester.select(selectRenderMode);
            expect(renderMode).toBe("view");
        });

        it("should process render mode change", async () => {
            await Tester.dispatchAndWaitFor(
                changeRenderMode("edit", { resetDashboard: true }, TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = await Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });

        it("should process switch to edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                switchToEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = await Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });

        it("should process cancel edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                cancelEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = await Tester.select(selectRenderMode);
            expect(renderMode).toBe("view");
        });
    });

    describe("with initial config for new dashboard", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                async (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    initCommand: initializeDashboard({
                        initialRenderMode: "edit",
                    }),
                },
            );
        });

        it("should respect initialRenderMode config", async () => {
            const renderMode = await Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });
    });

    describe("with initial config for existing dashboard", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                async (tester) => {
                    Tester = tester;
                },
                SimpleDashboardNoDrillsIdentifier,
                {
                    initCommand: initializeDashboard({
                        initialRenderMode: "edit",
                    }),
                },
            );
        });

        it("should respect initialRenderMode config", async () => {
            const renderMode = await Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });
    });
});
