// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { type IDashboardAbsoluteGranularityDateFilter } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";
import {
    setDashboardDateFilterWithDimensionConfigMode,
    setDateFilterConfigTitle,
} from "../../../commands/dashboard.js";
import {
    type IRemoveDateFilters,
    addDateFilter,
    moveDateFilter,
    removeDateFilter,
} from "../../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../DashboardTester.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import {
    selectCanAddMoreFilters,
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilterOfAnyTypeByDataSet,
    selectFilterContextDraggableFilterItemsOfAnyType,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";

describe("date filter with a dimension of the new type", () => {
    let Tester: DashboardTester;
    const dataSet = ReferenceMd.DateDatasets.Closed.ref;
    const monthFilter: IDashboardAbsoluteGranularityDateFilter = {
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.month",
            from: "2026-03",
            to: "2026-05",
            dataSet,
        },
    };
    const eventTypes = () => Tester.emittedEventsDigest().map((event) => event.type);

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(tabsActions.addDateFilter({ index: -1, dateDataset: dataSet }));
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "absoluteGranularity",
                granularity: "GDC.time.month",
                from: "2026-03",
                to: "2026-05",
                dataSet,
            }),
        );
        Tester.resetMonitors();
    });

    it("rejects adding a second filter for its date dataset", async () => {
        const event: IDashboardCommandFailed<any> = await Tester.dispatchAndWaitFor(
            addDateFilter(dataSet, 0),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toBe("USER_ERROR");
        expect(selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet)(Tester.state())).toEqual(monthFilter);
    });

    it("counts toward the filter limit", () => {
        const draggableFilters = selectFilterContextDraggableFilterItemsOfAnyType(Tester.state());

        expect(draggableFilters).toContainEqual(monthFilter);
        expect(selectCanAddMoreFilters(Tester.state())).toBe(true);
    });

    it("removes it and emits only the event of any type", async () => {
        await Tester.dispatchAndWaitFor(removeDateFilter(dataSet), "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet)(Tester.state())).toBeUndefined();
        expect(eventTypes()).toContain("GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER_OF_ANY_TYPE.REMOVED");
        expect(eventTypes()).not.toContain("GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.REMOVED");
    });

    it("moves it and emits only the event of any type", async () => {
        await Tester.dispatchAndWaitFor(moveDateFilter(dataSet, 0), "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDraggableFilterItemsOfAnyType(Tester.state())[0]).toEqual(monthFilter);
        expect(eventTypes()).toContain("GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER_OF_ANY_TYPE.MOVED");
        expect(eventTypes()).not.toContain("GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.MOVED");
    });

    it("changes its mode and emits only the event of any type", async () => {
        await Tester.dispatchAndWaitFor(
            setDashboardDateFilterWithDimensionConfigMode(dataSet, "readonly"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        expect(eventTypes()).toContain("GDC.DASH/EVT.DATE_FILTER_OF_ANY_TYPE_CONFIG.MODE_CHANGED");
        expect(eventTypes()).not.toContain("GDC.DASH/EVT.DATE_FILTER_CONFIG.MODE_CHANGED");
    });

    it("changes its title and emits only the event of any type", async () => {
        await Tester.dispatchAndWaitFor(
            setDateFilterConfigTitle(dataSet, "Closed"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        expect(eventTypes()).toContain("GDC.DASH/EVT.DATE_FILTER_OF_ANY_TYPE_CONFIG.TITLE_CHANGED");
        expect(eventTypes()).not.toContain("GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED");
    });
    it("clears the dependencies on every date filter removed together", async () => {
        const activity = ReferenceMd.DateDatasets.Activity.ref;
        Tester.dispatch(tabsActions.addDateFilter({ index: -1, dateDataset: activity }));
        // filters added without a local identifier are referenced by the dataset identifier
        const identifierOf = (ref: typeof dataSet) => (ref as { identifier: string }).identifier;
        const [attributeFilter] = selectFilterContextAttributeFilters(Tester.state());
        const filterLocalId = attributeFilter.attributeFilter.localIdentifier!;
        Tester.dispatch(
            tabsActions.setAttributeFilterDependentDateFilters({
                filterLocalId,
                dependentDateFilters: [
                    { filterLocalIdentifier: identifierOf(dataSet), isCommonDate: false },
                    { filterLocalIdentifier: identifierOf(activity), isCommonDate: false },
                ],
            }),
        );
        const removeBoth: IRemoveDateFilters = {
            ...removeDateFilter(dataSet),
            payload: { dataSets: [dataSet, activity] },
        };

        await Tester.dispatchAndWaitFor(removeBoth, "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        const [afterRemoval] = selectFilterContextAttributeFilters(Tester.state());
        expect(afterRemoval.attributeFilter.filterElementsByDate ?? []).toEqual([]);
    });
});
