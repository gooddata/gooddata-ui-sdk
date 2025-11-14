// (C) 2023-2025 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { setDashboardAttributeFilterConfigMode } from "../../../commands/index.js";
import { selectAttributeFilterConfigsOverrides } from "../../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectFilterContextAttributeFilters } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("changeAttributeFilterModeHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for changed attribute filter mode", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(setDashboardAttributeFilterConfigMode(firstFilterLocalId, "readonly"));

        await Tester.waitFor("GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute mode in state on changed attribute filter", async () => {
        const firstFilterLocalId = selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter
            .localIdentifier!;

        Tester.dispatch(setDashboardAttributeFilterConfigMode(firstFilterLocalId, "active"));

        await Tester.waitFor("GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED");

        expect(selectAttributeFilterConfigsOverrides(Tester.state())).toMatchSnapshot();
    });

    it("should emit the appropriate events when trying to update mode of a non-existent attribute filter", async () => {
        Tester.dispatch(setDashboardAttributeFilterConfigMode("NON EXISTENT LOCAL ID", "hidden"));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to update mode of a non-existent attribute filter", async () => {
        const originalAttributeFilterConfigs = selectAttributeFilterConfigsOverrides(Tester.state());

        Tester.dispatch(setDashboardAttributeFilterConfigMode("NON EXISTENT LOCAL ID", "hidden"));

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectAttributeFilterConfigsOverrides(Tester.state())).toEqual(originalAttributeFilterConfigs);
    });
});
