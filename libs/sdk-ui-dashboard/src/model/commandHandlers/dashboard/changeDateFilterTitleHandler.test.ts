// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboardAbsoluteGranularityDateFilter } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard, setDateFilterConfigTitle } from "../../commands/dashboard.js";
import { changeDateFilterSelection, changeDateFilterSelectionOfAnyType } from "../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import {
    type IDashboardDateFilterOfAnyTypeTitleChanged,
    type IDashboardDateFilterTitleChanged,
} from "../../events/filters.js";

describe("changeDateFilterTitleHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                initCommand: initializeDashboard({ settings: { enableAbsoluteDateFilterGranularity: true } }),
            },
        );
    });

    const findEvent = <T>(type: string): T | undefined =>
        Tester.emittedEvents().find((event) => event.type === type) as T | undefined;

    it("emits both title events for the common date filter of the old type", async () => {
        await Tester.dispatchAndWaitFor(
            changeDateFilterSelection("relative", "GDC.time.month", -3, 0),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );
        Tester.resetMonitors();

        await Tester.dispatchAndWaitFor(
            setDateFilterConfigTitle(undefined, "Period"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const oldEvent = findEvent<IDashboardDateFilterTitleChanged>(
            "GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED",
        );
        const newEvent = findEvent<IDashboardDateFilterOfAnyTypeTitleChanged>(
            "GDC.DASH/EVT.DATE_FILTER_OF_ANY_TYPE_CONFIG.TITLE_CHANGED",
        );
        expect(oldEvent?.payload.filterConfig.filterName).toBe("Period");
        expect(newEvent?.payload).toEqual(oldEvent?.payload);
    });

    it("emits only the title event of any type for the common date filter of the new type", async () => {
        const weekFilter: IDashboardAbsoluteGranularityDateFilter = {
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.week",
                from: "2026-05",
            },
        };
        await Tester.dispatchAndWaitFor(
            changeDateFilterSelectionOfAnyType(weekFilter),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );
        Tester.resetMonitors();

        await Tester.dispatchAndWaitFor(
            setDateFilterConfigTitle(undefined, "Period"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const newEvent = findEvent<IDashboardDateFilterOfAnyTypeTitleChanged>(
            "GDC.DASH/EVT.DATE_FILTER_OF_ANY_TYPE_CONFIG.TITLE_CHANGED",
        );
        expect(newEvent?.payload.filter).toEqual(weekFilter);
        expect(newEvent?.payload.filterConfig.filterName).toBe("Period");
        expect(findEvent("GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED")).toBeUndefined();
    });
});
