// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { initializeDashboard } from "../../../commands/dashboard.js";
import {
    cancelEditRenderMode,
    changeRenderMode,
    switchToEditRenderMode,
} from "../../../commands/renderMode.js";
import { selectRenderMode } from "../../../store/renderMode/renderModeSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardNoDrillsIdentifier } from "../../../tests/fixtures/SimpleDashboardNoDrills.fixtures.js";

describe("changeRenderModeHandler", () => {
    let Tester: DashboardTester;

    describe("without initial config", () => {
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardNoDrillsIdentifier);
        });

        it("should be view if initialRenderMode is not specified on config", () => {
            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("view");
        });

        it("should process render mode change", async () => {
            await Tester.dispatchAndWaitFor(
                changeRenderMode("edit", { resetDashboard: true }, TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });

        it("should process switch to edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                switchToEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });

        it("should process cancel edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                cancelEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("view");
        });
    });

    describe("with initial config for new dashboard", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
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

        it("should respect initialRenderMode config", () => {
            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });
    });

    describe("with initial config for existing dashboard", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
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

        it("should respect initialRenderMode config", () => {
            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });
    });
});
