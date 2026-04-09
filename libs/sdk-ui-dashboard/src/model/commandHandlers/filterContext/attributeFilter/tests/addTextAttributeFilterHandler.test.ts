// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    dashboardAttributeFilterItemLocalIdentifier,
    isDashboardArbitraryAttributeFilter,
    isDashboardMatchAttributeFilter,
} from "@gooddata/sdk-model";

import { addTextAttributeFilter } from "../../../../commands/filters.js";
import { selectFilterContextAttributeFilterItemByDisplayForm } from "../../../../store/tabs/filterContext/filterContextSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("addTextAttributeFilterHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should generate local identifier for arbitrary text filter when missing", async () => {
        const displayForm = ReferenceMd.Product.Name.attribute.displayForm;

        await Tester.dispatchAndWaitFor(
            addTextAttributeFilter(
                {
                    arbitraryAttributeFilter: {
                        displayForm,
                        values: ["value"],
                        negativeSelection: false,
                    },
                },
                0,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const addedFilter = selectFilterContextAttributeFilterItemByDisplayForm(displayForm)(Tester.state());
        expect(addedFilter).toBeDefined();
        expect(addedFilter && isDashboardArbitraryAttributeFilter(addedFilter)).toBe(true);
        expect(addedFilter && dashboardAttributeFilterItemLocalIdentifier(addedFilter)).toEqual(
            expect.any(String),
        );
    });

    it("should generate local identifier for match text filter when missing", async () => {
        const displayForm = ReferenceMd.Product.Name.attribute.displayForm;

        await Tester.dispatchAndWaitFor(
            addTextAttributeFilter(
                {
                    matchAttributeFilter: {
                        displayForm,
                        operator: "contains",
                        literal: "value",
                    },
                },
                0,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const addedFilter = selectFilterContextAttributeFilterItemByDisplayForm(displayForm)(Tester.state());
        expect(addedFilter).toBeDefined();
        expect(addedFilter && isDashboardMatchAttributeFilter(addedFilter)).toBe(true);
        expect(addedFilter && dashboardAttributeFilterItemLocalIdentifier(addedFilter)).toEqual(
            expect.any(String),
        );
    });
});
