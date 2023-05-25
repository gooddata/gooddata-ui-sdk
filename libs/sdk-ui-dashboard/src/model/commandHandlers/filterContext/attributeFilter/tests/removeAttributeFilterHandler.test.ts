// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { removeAttributeFilter } from "../../../../commands/index.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilters,
} from "../../../../store/filterContext/filterContextSelectors.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { selectLayout } from "../../../../store/layout/layoutSelectors.js";
import { IDashboardAttributeFilterReference, IInsightWidget } from "@gooddata/sdk-model";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures.js";

describe("removeAttributeFilterHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for removed attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        await Tester.dispatchAndWaitFor(
            removeAttributeFilter(firstFilterLocalId, TestCorrelation),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should remove resolved attribute display form metadata", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        await Tester.dispatchAndWaitFor(
            removeAttributeFilter(firstFilterLocalId, TestCorrelation),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const displayForms = selectAttributeFilterDisplayFormsMap(Tester.state());
        const remainingFilters = selectFilterContextAttributeFilters(Tester.state());

        expect(displayForms.size).toEqual(remainingFilters.length);
        remainingFilters.forEach((filter) => {
            expect(displayForms.has(filter.attributeFilter.displayForm)).toBeTruthy();
        });
    });

    it("should set the attribute selection in state on removed attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        await Tester.dispatchAndWaitFor(
            removeAttributeFilter(firstFilterLocalId, TestCorrelation),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        expect(selectFilterContextAttributeFilters(Tester.state()).length).toEqual(1);
        expect(
            selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter.localIdentifier,
        ).not.toEqual(firstFilterLocalId);
    });

    it("should emit the appropriate events when trying to remove a non-existent attribute filter", async () => {
        await Tester.dispatchAndWaitFor(
            removeAttributeFilter("NON EXISTENT LOCAL ID", TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to remove a non-existent attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        await Tester.dispatchAndWaitFor(
            removeAttributeFilter("NON EXISTENT LOCAL ID", TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

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
