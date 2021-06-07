// (C) 2021 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { addAttributeFilter, loadDashboard } from "../../../../commands";
import { DashboardTester, SimpleDashboardRecording } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../state/filterContext/filterContextSelectors";

describe("addAttributeFilterHandler", () => {
    async function getInitializedTester(): Promise<DashboardTester> {
        const tester = DashboardTester.forRecording(SimpleDashboardRecording);

        tester.dispatch(loadDashboard());
        await tester.waitFor("GDC.DASH/EVT.LOADED");
        tester.resetMonitors();

        return tester;
    }

    it("should emit the appropriate events for added attribute filter", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(
            addAttributeFilter(ReferenceLdm.Product.Name.attribute.displayForm, 0, "testCorrelation"),
        );
        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute filter in state when it is added", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(
            addAttributeFilter(ReferenceLdm.Product.Name.attribute.displayForm, 0, "testCorrelation"),
        );
        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(selectFilterContextAttributeFilters(tester.state())[0]).toMatchSnapshot({
            attributeFilter: {
                localIdentifier: expect.any(String),
            },
        });
    });

    it("should emit the appropriate events when trying to add a duplicate attribute filter", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(
            addAttributeFilter(ReferenceLdm.Department.attribute.displayForm, 0, "testCorrelation"),
        );
        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to add a duplicate attribute filter", async () => {
        const tester = await getInitializedTester();

        const originalFilters = selectFilterContextAttributeFilters(tester.state());

        tester.dispatch(
            addAttributeFilter(ReferenceLdm.Department.attribute.displayForm, 0, "testCorrelation"),
        );
        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(tester.state())).toEqual(originalFilters);
    });
});
