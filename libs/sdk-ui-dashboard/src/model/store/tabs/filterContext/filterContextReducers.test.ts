// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import {
    type IDashboardAbsoluteGranularityDateFilter,
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    idRef,
    isDashboardCommonDateFilterOfAnyType,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../DashboardTester.js";
import { tabsActions } from "../index.js";

import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilterOfAnyType,
    selectFilterContextDateFilterOfAnyTypeByDataSet,
    selectFilterContextDraggableFilterItemsOfAnyType,
    selectFilterContextFilters,
    selectWorkingFilterContextDateFilterOfAnyType,
    selectWorkingFilterContextDateFiltersWithDimensionOfAnyType,
} from "./filterContextSelectors.js";

describe("upsertDateFilter of the common date filter", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    const weekFilter = (localIdentifier?: string): IDashboardAbsoluteGranularityDateFilter => ({
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.week",
            from: "2026-05",
            to: "2026-08",
            ...(localIdentifier ? { localIdentifier } : {}),
        },
    });

    const setOldType = (localIdentifier: string) =>
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.month",
                from: -3,
                to: 0,
                localIdentifier,
            }),
        );

    const setNewType = (isWorkingSelectionChange?: boolean) =>
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "absoluteGranularity",
                granularity: "GDC.time.week",
                from: "2026-05",
                to: "2026-08",
                isWorkingSelectionChange,
            }),
        );

    it("replaces the old type by the new type keeping its local identifier", () => {
        setOldType("date");
        setNewType();

        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(weekFilter("date"));
    });

    it("writes the new type with only one bound", () => {
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "absoluteGranularity",
                granularity: "GDC.time.quarter",
                to: "2026-2",
            }),
        );

        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toMatchObject({
            dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.quarter", to: "2026-2" },
        });
        expect(
            selectFilterContextDateFilterOfAnyType(Tester.state()) as IDashboardAbsoluteGranularityDateFilter,
        ).not.toHaveProperty("dashboardAbsoluteGranularityDateFilter.from");
    });

    it("replaces the new type by the old type keeping its local identifier", () => {
        setOldType("date");
        setNewType();
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.year",
                from: -1,
                to: -1,
                emptyValueHandling: "exclude",
            }),
        );

        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual({
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.year",
                from: -1,
                to: -1,
                localIdentifier: "date",
                emptyValueHandling: "exclude",
            },
        });
    });

    it("replaces the new type by All time with empty values keeping its local identifier", () => {
        setOldType("date");
        setNewType();
        Tester.dispatch(tabsActions.upsertDateFilter({ type: "allTime", emptyValueHandling: "only" }));

        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(
            newAllTimeDashboardDateFilter(undefined, "date", "only"),
        );
    });

    it("stages All time over the new type keeping its local identifier", () => {
        setOldType("date");
        setNewType();
        Tester.dispatch(tabsActions.upsertDateFilter({ type: "allTime", isWorkingSelectionChange: true }));

        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(weekFilter("date"));
        expect(selectWorkingFilterContextDateFilterOfAnyType(Tester.state())).toMatchObject({
            dateFilter: { type: "relative", localIdentifier: "date" },
        });
    });

    it("stages the new type without changing the applied filter", () => {
        setOldType("date");
        setNewType(true);

        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toMatchObject({
            dateFilter: { type: "relative", localIdentifier: "date" },
        });
        expect(selectWorkingFilterContextDateFilterOfAnyType(Tester.state())).toEqual(weekFilter("date"));
    });
});

describe("date filter with a dimension of the new type", () => {
    let Tester: DashboardTester;
    const dataSet = idRef("closed", "dataSet");
    const localIdentifier = "closedDateFilter";

    const monthFilter: IDashboardAbsoluteGranularityDateFilter = {
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.month",
            from: "2026-03",
            to: "2026-05",
            dataSet,
            localIdentifier,
        },
    };

    const filterOfDataSet = () => selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet)(Tester.state());

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(tabsActions.addDateFilter({ index: -1, dateDataset: dataSet }));
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.year",
                from: -2,
                to: -2,
                dataSet,
                localIdentifier,
            }),
        );
    });

    const setMonths = (isWorkingSelectionChange?: boolean) =>
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "absoluteGranularity",
                granularity: "GDC.time.month",
                from: "2026-03",
                to: "2026-05",
                dataSet,
                isWorkingSelectionChange,
            }),
        );

    it("replaces the filter of the date dataset and keeps its local identifier and the common date filter", () => {
        const commonBefore = selectFilterContextDateFilterOfAnyType(Tester.state());

        setMonths();

        expect(filterOfDataSet()).toEqual(monthFilter);
        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(commonBefore);
    });

    it("keeps the date dataset when the new type changes back to the old type", () => {
        setMonths();
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "relative",
                granularity: "GDC.time.year",
                from: -1,
                to: -1,
                dataSet,
            }),
        );

        expect(filterOfDataSet()).toEqual(
            newRelativeDashboardDateFilter("GDC.time.year", -1, -1, dataSet, localIdentifier),
        );
    });

    it("sets All time on the date dataset of the new type", () => {
        setMonths();
        Tester.dispatch(tabsActions.upsertDateFilter({ type: "allTime", dataSet }));

        expect(filterOfDataSet()).toEqual(newAllTimeDashboardDateFilter(dataSet, localIdentifier));
    });

    it("sets the working All time on the date dataset of the new type", () => {
        setMonths(true);
        Tester.dispatch(
            tabsActions.upsertDateFilter({ type: "allTime", dataSet, isWorkingSelectionChange: true }),
        );

        expect(
            selectWorkingFilterContextDateFiltersWithDimensionOfAnyType(Tester.state()).find((filter) =>
                areObjRefsEqual(dashboardFilterObjRef(filter), dataSet),
            ),
        ).toEqual(newAllTimeDashboardDateFilter(dataSet, localIdentifier));
    });

    it("moves the filter of the new type", () => {
        setMonths();
        Tester.dispatch(tabsActions.moveDateFilter({ dataSet, index: 0 }));

        expect(selectFilterContextDraggableFilterItemsOfAnyType(Tester.state())[0]).toEqual(monthFilter);
    });

    it("removes the filter of the new type and the dependencies on it", () => {
        setMonths();
        const [attributeFilter] = selectFilterContextAttributeFilters(Tester.state());
        const filterLocalId = attributeFilter.attributeFilter.localIdentifier!;
        Tester.dispatch(
            tabsActions.setAttributeFilterDependentDateFilters({
                filterLocalId,
                dependentDateFilters: [{ filterLocalIdentifier: localIdentifier, isCommonDate: false }],
            }),
        );

        Tester.dispatch(tabsActions.removeDateFilter({ dataSet }));

        expect(filterOfDataSet()).toBeUndefined();
        expect(
            selectFilterContextAttributeFilters(Tester.state()).find(
                (filter) => filter.attributeFilter.localIdentifier === filterLocalId,
            )?.attributeFilter.filterElementsByDate ?? [],
        ).toEqual([]);
    });
});

describe("attribute filter positions after an absolute common date filter with granularity", () => {
    let Tester: DashboardTester;

    const filters = () => selectFilterContextFilters(Tester.state());
    const attributeFilterIds = () =>
        selectFilterContextAttributeFilters(Tester.state()).map(
            (filter) => filter.attributeFilter.localIdentifier!,
        );

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "absoluteGranularity",
                granularity: "GDC.time.month",
                from: "2026-01",
                to: "2026-02",
            }),
        );
    });

    it("keeps the common date filter first when an attribute filter moves to the front", () => {
        const [first, second] = attributeFilterIds();

        Tester.dispatch(tabsActions.moveAttributeFilter({ filterLocalId: second, index: 0 }));

        expect(isDashboardCommonDateFilterOfAnyType(filters()[0])).toBe(true);
        expect(attributeFilterIds()).toEqual([second, first]);
    });

    it("keeps the common date filter first when an attribute filter is added to the front", () => {
        Tester.dispatch(
            tabsActions.addAttributeFilter({
                displayForm: idRef("label.added"),
                index: 0,
                localIdentifier: "added",
            }),
        );

        expect(isDashboardCommonDateFilterOfAnyType(filters()[0])).toBe(true);
        expect(attributeFilterIds()[0]).toBe("added");
    });
});

describe("attribute filter positions with the All time common date filter", () => {
    let Tester: DashboardTester;
    const dataSet = idRef("closed", "dataSet");

    const filters = () => selectFilterContextFilters(Tester.state());
    const attributeFilterIds = () =>
        selectFilterContextAttributeFilters(Tester.state()).map(
            (filter) => filter.attributeFilter.localIdentifier!,
        );

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        // All time is stored as no common date filter, the date filter with a dimension goes first
        Tester.dispatch(tabsActions.addDateFilter({ index: 0, dateDataset: dataSet }));
    });

    it("moves an attribute filter in front of a date filter with a dimension", () => {
        const [, second] = attributeFilterIds();

        Tester.dispatch(tabsActions.moveAttributeFilter({ filterLocalId: second, index: 0 }));

        expect(filters()[0]).toEqual(expect.objectContaining({ attributeFilter: expect.anything() }));
        expect(attributeFilterIds()[0]).toBe(second);
    });

    it("adds an attribute filter in front of a date filter with a dimension", () => {
        Tester.dispatch(
            tabsActions.addAttributeFilter({
                displayForm: idRef("label.added"),
                index: 0,
                localIdentifier: "added",
            }),
        );

        expect(dashboardFilterLocalIdentifier(filters()[0])).toBe("added");
    });
});
