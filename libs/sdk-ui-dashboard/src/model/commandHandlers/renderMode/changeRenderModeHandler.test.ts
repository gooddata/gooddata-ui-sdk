// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { TestCorrelation } from "../../../tests/Dashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { cancelEditRenderMode, changeRenderMode, switchToEditRenderMode } from "../../commands/renderMode.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { selectRenderMode } from "../../store/renderMode/renderModeSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { selectTimezoneOverride } from "../../store/ui/uiSelectors.js";
import { SimpleDashboardNoDrillsIdentifier } from "../tests/SimpleDashboardNoDrills.test.helpers.js";

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

        it("should reset the ad-hoc timezone override when entering edit mode", async () => {
            Tester.dispatch(uiActions.setTimezoneOverride("Europe/Prague"));
            expect(Tester.select(selectTimezoneOverride)).toBe("Europe/Prague");

            await Tester.dispatchAndWaitFor(
                switchToEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBeUndefined();
        });

        it("should keep the ad-hoc timezone override when leaving edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                switchToEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            // set after the entry reset, so that the assertion below is about leaving edit mode
            // and not about an override that the entry never cleared
            Tester.dispatch(uiActions.setTimezoneOverride("Europe/Prague"));

            await Tester.dispatchAndWaitFor(
                cancelEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBe("Europe/Prague");
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
