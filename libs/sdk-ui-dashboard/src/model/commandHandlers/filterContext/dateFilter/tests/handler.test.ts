// (C) 2021 GoodData Corporation
import { changeDateFilterSelection, clearDateFilterSelection, loadDashboard } from "../../../../commands";
import { DashboardTester, SimpleDashboardRecording } from "../../../../tests/DashboardTester";
import { selectFilterContextDateFilter } from "../../../../state/filterContext/filterContextSelectors";

describe("dateFilterChangeSelectionCommandHandler", () => {
    async function getInitializedTester(): Promise<DashboardTester> {
        const tester = DashboardTester.forRecording(SimpleDashboardRecording);

        tester.dispatch(loadDashboard());
        await tester.waitFor("GDC.DASH/EVT.LOADED");
        tester.resetMonitors();

        return tester;
    }

    it("should emit the appropriate events for changed date filter", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0, "testCorrelation"));
        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the date filter in the state when a date filter is changed", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0));
        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(selectFilterContextDateFilter(tester.state())).toMatchSnapshot();
    });

    it("should clear the date filter in the state when a date filter is cleared", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0));
        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        tester.dispatch(clearDateFilterSelection());
        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(selectFilterContextDateFilter(tester.state())).toBeUndefined();
    });
});
