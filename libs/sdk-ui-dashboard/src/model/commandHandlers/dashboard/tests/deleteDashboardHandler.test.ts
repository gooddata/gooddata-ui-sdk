// (C) 2021 GoodData Corporation

import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { deleteDashboard } from "../../../commands";
import { DashboardCommandFailed, DashboardDeleted } from "../../../events";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures";
import { selectLayout } from "../../../state/layout/layoutSelectors";
import { selectDashboardTitle, selectPersistedDashboard } from "../../../state/meta/metaSelectors";
import { selectEffectiveDateFilterConfig } from "../../../state/dateFilterConfig/dateFilterConfigSelectors";
import { selectDateFilterConfig } from "../../../state/config/configSelectors";
import { selectFilterContextAttributeFilters } from "../../../state/filterContext/filterContextSelectors";
import { selectInsights } from "../../../state/insights/insightsSelectors";

describe("delete dashboard handler", () => {
    describe("for unsaved dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, undefined),
        );

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
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier),
        );

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
