// (C) 2021 GoodData Corporation
import { loadDashboard, removeAttributeFilter } from "../../../../commands";
import { DashboardTester } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../state/filterContext/filterContextSelectors";
import { SimpleDashboardIdentifier } from "../../../../tests/Dashboard.fixtures";

describe("removeAttributeFilterHandler", () => {
    async function getInitializedTester(): Promise<DashboardTester> {
        const tester = DashboardTester.forRecording(SimpleDashboardIdentifier);

        tester.dispatch(loadDashboard());
        await tester.waitFor("GDC.DASH/EVT.LOADED");
        tester.resetMonitors();

        return tester;
    }

    it("should emit the appropriate events for removed attribute filter", async () => {
        const tester = await getInitializedTester();

        const firstFilterLocalId = selectFilterContextAttributeFilters(tester.state())[0].attributeFilter
            .localIdentifier!;

        tester.dispatch(removeAttributeFilter(firstFilterLocalId, "testCorrelation"));

        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute selection in state on removed attribute filter", async () => {
        const tester = await getInitializedTester();

        const firstFilterLocalId = selectFilterContextAttributeFilters(tester.state())[0].attributeFilter
            .localIdentifier!;

        tester.dispatch(removeAttributeFilter(firstFilterLocalId, "testCorrelation"));

        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(selectFilterContextAttributeFilters(tester.state()).length).toEqual(1);
        expect(
            selectFilterContextAttributeFilters(tester.state())[0].attributeFilter.localIdentifier,
        ).not.toEqual(firstFilterLocalId);
    });

    it("should emit the appropriate events when trying to remove a non-existent attribute filter", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(removeAttributeFilter("NON EXISTENT LOCAL ID", "testCorrelation"));

        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to remove a non-existent attribute filter", async () => {
        const tester = await getInitializedTester();

        const originalFilters = selectFilterContextAttributeFilters(tester.state());

        tester.dispatch(removeAttributeFilter("NON EXISTENT LOCAL ID", "testCorrelation"));

        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(tester.state())).toEqual(originalFilters);
    });
});
