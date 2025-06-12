// (C) 2021-2022 GoodData Corporation

import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { deleteDashboard } from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardDeleted } from "../../../events/index.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { selectDashboardTitle, selectPersistedDashboard } from "../../../store/meta/metaSelectors.js";
import { selectEffectiveDateFilterConfig } from "../../../store/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfig } from "../../../store/config/configSelectors.js";
import { selectFilterContextAttributeFilters } from "../../../store/filterContext/filterContextSelectors.js";
import { selectInsights } from "../../../store/insights/insightsSelectors.js";

describe("delete dashboard handler", () => {
    describe("for unsaved dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            });
        });

        it("should fail", async () => {
            const event: DashboardCommandFailed<any> = await Tester.dispatchAndWaitFor(
                deleteDashboard(TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for an existing dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should revert to empty dashboard after delete", async () => {
            const event: DashboardDeleted = await Tester.dispatchAndWaitFor(
                deleteDashboard(TestCorrelation),
                "GDC.DASH/EVT.DELETED",
            );

            expect(event.payload.dashboard.identifier).toEqual(SimpleDashboardIdentifier);
            expect(event.ctx.dashboardRef).toBeUndefined();

            const newState = Tester.state();
            expect(selectLayout(newState).sections).toEqual([]);
            expect(selectEffectiveDateFilterConfig(newState)).toEqual(selectDateFilterConfig(newState));
            expect(selectFilterContextAttributeFilters(newState)).toEqual([]);
            expect(selectDashboardTitle(newState)).toEqual("");
            expect(selectPersistedDashboard(newState)).toBeUndefined();
            expect(selectInsights(newState)).toEqual([]);
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(deleteDashboard(TestCorrelation), "GDC.DASH/EVT.DELETED");

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
