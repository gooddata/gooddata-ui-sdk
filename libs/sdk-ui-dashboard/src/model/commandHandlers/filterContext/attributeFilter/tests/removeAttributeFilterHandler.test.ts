// (C) 2021 GoodData Corporation
import { removeAttributeFilter } from "../../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../state/filterContext/filterContextSelectors";
import { SimpleDashboardIdentifier } from "../../../../tests/Dashboard.fixtures";

describe("removeAttributeFilterHandler", () => {
    let Tester: DashboardTester;
    beforeEach(preloadedTesterFactory((tester) => (Tester = tester), SimpleDashboardIdentifier));

    it("should emit the appropriate events for removed attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(removeAttributeFilter(firstFilterLocalId, "testCorrelation"));

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute selection in state on removed attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(removeAttributeFilter(firstFilterLocalId, "testCorrelation"));

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextAttributeFilters(Tester.state()).length).toEqual(1);
        expect(
            selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter.localIdentifier,
        ).not.toEqual(firstFilterLocalId);
    });

    it("should emit the appropriate events when trying to remove a non-existent attribute filter", async () => {
        Tester.dispatch(removeAttributeFilter("NON EXISTENT LOCAL ID", "testCorrelation"));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to remove a non-existent attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        Tester.dispatch(removeAttributeFilter("NON EXISTENT LOCAL ID", "testCorrelation"));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalFilters);
    });
});
