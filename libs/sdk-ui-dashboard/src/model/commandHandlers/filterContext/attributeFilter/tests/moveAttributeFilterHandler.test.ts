// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { moveAttributeFilter } from "../../../../commands/index.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import { selectFilterContextAttributeFilters } from "../../../../store/filterContext/filterContextSelectors.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures.js";

describe("moveAttributeFilterHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for moved attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(moveAttributeFilter(firstFilterLocalId, 1, TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute selection in state on moved attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(moveAttributeFilter(firstFilterLocalId, 1, TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextAttributeFilters(Tester.state())[0]).toMatchSnapshot({
            attributeFilter: {
                localIdentifier: expect.any(String),
            },
        });
    });

    it("should emit the appropriate events when trying to move a non-existent attribute filter", async () => {
        Tester.dispatch(moveAttributeFilter("NON EXISTENT LOCAL ID", 1, TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to move a non-existent attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        Tester.dispatch(moveAttributeFilter("NON EXISTENT LOCAL ID", 1, TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalFilters);
    });

    it("should emit the appropriate events when trying to move an attribute filter to an invalid index", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(moveAttributeFilter(firstFilterLocalId, 1000, TestCorrelation));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
