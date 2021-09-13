// (C) 2021 GoodData Corporation
import { removeAttributeFilter } from "../../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../state/filterContext/filterContextSelectors";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures";
import { selectLayout } from "../../../../state/layout/layoutSelectors";
import { IDashboardAttributeFilterReference, IInsightWidget } from "@gooddata/sdk-backend-spi";

describe("removeAttributeFilterHandler", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier),
    );

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

    it("should remove the filter from widget ignore lists", async () => {
        const filterToRemove = selectFilterContextAttributeFilters(Tester.state())[1].attributeFilter;

        // first item in the section section should ignore the second attribute filter that is about to be
        // removed; do a quick check - invariant really, that this is indeed the case
        const originalLayout = selectLayout(Tester.state());
        expect((originalLayout.sections[1].items[0].widget as IInsightWidget).ignoreDashboardFilters).toEqual(
            [
                {
                    type: "attributeFilterReference",
                    displayForm: filterToRemove.displayForm,
                } as IDashboardAttributeFilterReference,
            ],
        );

        await Tester.dispatchAndWaitFor(
            removeAttributeFilter(filterToRemove.localIdentifier!),
            "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED",
        );

        // removing the filter should remove the item from the ignore list
        const updatedLayout = selectLayout(Tester.state());
        expect((updatedLayout.sections[1].items[0].widget as IInsightWidget).ignoreDashboardFilters).toEqual(
            [],
        );
    });

    it("should keep widget ignore list as-is if the removed filter was not ignored", async () => {
        const filterToRemove = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter;

        await Tester.dispatchAndWaitFor(
            removeAttributeFilter(filterToRemove.localIdentifier!),
            "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED",
        );

        // removing the filter should remove the item from the ignore list
        const updatedLayout = selectLayout(Tester.state());
        expect(
            (updatedLayout.sections[1].items[0].widget as IInsightWidget).ignoreDashboardFilters,
        ).not.toEqual([]);
    });
});
