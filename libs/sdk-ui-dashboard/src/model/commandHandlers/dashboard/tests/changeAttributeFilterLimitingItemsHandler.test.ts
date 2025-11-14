// (C) 2024-2025 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { setAttributeFilterLimitingItems } from "../../../commands/index.js";
import { selectFilterContextAttributeFilters } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

const LIMITING_ITEM = idRef("my-metric", "measure");
describe("changeAttributeFilterLimitingItemsHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for changed attribute filter limiting items", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(setAttributeFilterLimitingItems(firstFilterLocalId, [LIMITING_ITEM]));

        await Tester.waitFor("GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the limiting items in state to filter context", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(setAttributeFilterLimitingItems(firstFilterLocalId, [LIMITING_ITEM]));

        await Tester.waitFor("GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toMatchSnapshot();
    });

    it("should emit the appropriate events when trying to update limiting items of a non-existent attribute filter", async () => {
        Tester.dispatch(setAttributeFilterLimitingItems("NON EXISTENT LOCAL ID", [LIMITING_ITEM]));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter context state when trying to update mode of a non-existent attribute filter", async () => {
        const originalAttributeFilterConfigs = selectFilterContextAttributeFilters(Tester.state());

        Tester.dispatch(setAttributeFilterLimitingItems("NON EXISTENT LOCAL ID", [LIMITING_ITEM]));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalAttributeFilterConfigs);
    });
});
