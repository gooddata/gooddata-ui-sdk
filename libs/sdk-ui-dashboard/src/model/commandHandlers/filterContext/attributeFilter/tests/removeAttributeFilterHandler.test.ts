// (C) 2021-2024 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { removeAttributeFilter } from "../../../../commands/index.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilters,
} from "../../../../store/filterContext/filterContextSelectors.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";
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
});
