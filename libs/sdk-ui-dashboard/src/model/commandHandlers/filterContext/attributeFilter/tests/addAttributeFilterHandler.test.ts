// (C) 2021 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { addAttributeFilter } from "../../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../state/filterContext/filterContextSelectors";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures";

describe("addAttributeFilterHandler", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier),
    );

    it("should emit the appropriate events for added attribute filter", async () => {
        Tester.dispatch(
            addAttributeFilter(ReferenceLdm.Product.Name.attribute.displayForm, 0, TestCorrelation),
        );
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute filter in state when it is added", async () => {
        Tester.dispatch(
            addAttributeFilter(ReferenceLdm.Product.Name.attribute.displayForm, 0, TestCorrelation),
        );
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextAttributeFilters(Tester.state())[0]).toMatchSnapshot({
            attributeFilter: {
                localIdentifier: expect.any(String),
            },
        });
    });

    it("should emit the appropriate events when trying to add a duplicate attribute filter", async () => {
        Tester.dispatch(
            addAttributeFilter(ReferenceLdm.Department.attribute.displayForm, 0, TestCorrelation),
        );
        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to add a duplicate attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        Tester.dispatch(
            addAttributeFilter(ReferenceLdm.Department.attribute.displayForm, 0, TestCorrelation),
        );
        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalFilters);
    });
});
