// (C) 2021-2022 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures";
import { renameDashboard } from "../../../commands";
import { DashboardRenamed } from "../../../events";
import { selectDashboardTitle, selectPersistedDashboard } from "../../../store/meta/metaSelectors";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";

describe("rename dashboard handler", () => {
    const TestTitle = "newTitle";

    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        // each test starts with a new dashboard
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, undefined),
        );

        it("should allow to set empty title", async () => {
            const event: DashboardRenamed = await Tester.dispatchAndWaitFor(
                renameDashboard(""),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(event.payload.newTitle).toEqual("");
        });

        it("should allow to set title", async () => {
            const event: DashboardRenamed = await Tester.dispatchAndWaitFor(
                renameDashboard(TestTitle),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(event.payload.newTitle).toEqual(TestTitle);
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                renameDashboard(TestTitle, TestCorrelation),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for existing dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier),
        );

        it("should set title in descriptor and keep persisted dashboard data untouched", async () => {
            const event: DashboardRenamed = await Tester.dispatchAndWaitFor(
                renameDashboard(TestTitle),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(event.payload.newTitle).toEqual(TestTitle);
            expect(selectDashboardTitle(Tester.state())).toEqual(TestTitle);
            expect(selectPersistedDashboard(Tester.state())?.title).not.toEqual(TestTitle);
        });
    });
});
