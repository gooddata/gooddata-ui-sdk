// (C) 2023 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { setAttributeFilterTitle } from "../../../../commands/index.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { selectFilterContextAttributeFilters } from "../../../../store/filterContext/filterContextSelectors.js";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures.js";

describe("changeAttributeTitleHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for changed attribute filter title", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(setAttributeFilterTitle(firstFilterLocalId, "Updated title", TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute title in state on changed attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(setAttributeFilterTitle(firstFilterLocalId, "Updated title", TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED");

        expect(selectFilterContextAttributeFilters(Tester.state())[0]).toMatchSnapshot({
            attributeFilter: {
                localIdentifier: expect.any(String),
            },
        });
    });

    it("should emit the appropriate events when trying to update title of a non-existent attribute filter", async () => {
        Tester.dispatch(setAttributeFilterTitle("NON EXISTENT LOCAL ID", "Title", TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to update title of a non-existent attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        Tester.dispatch(setAttributeFilterTitle("NON EXISTENT LOCAL ID", "Title", TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalFilters);
    });
});
