// (C) 2021 GoodData Corporation
import { changeDateFilterSelection, clearDateFilterSelection } from "../../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester";
import { selectFilterContextDateFilter } from "../../../../store/filterContext/filterContextSelectors";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures";

describe("changeDateFilterSelectionHandler", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier),
    );

    it("should emit the appropriate events for changed date filter", async () => {
        Tester.dispatch(
            changeDateFilterSelection("relative", "GDC.time.month", -3, 0, "someLocalId", TestCorrelation),
        );
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the date filter in the state when a date filter is changed", async () => {
        Tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0));

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should set the date filter in the state when a date filter is added", async () => {
        Tester.dispatch(clearDateFilterSelection());
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        Tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0));
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should clear date filter in the state", async () => {
        Tester.dispatch(clearDateFilterSelection());

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should clear the date filter in the state when a date filter is cleared", async () => {
        Tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0));
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        Tester.dispatch(clearDateFilterSelection());
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toBeUndefined();
    });
});
