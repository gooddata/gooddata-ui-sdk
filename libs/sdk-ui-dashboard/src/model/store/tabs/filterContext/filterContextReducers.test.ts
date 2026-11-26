// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import {
    type IDashboardAbsoluteGranularityDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../DashboardTester.js";
import { tabsActions } from "../index.js";

import {
    selectFilterContextDateFilterOfAnyType,
    selectWorkingFilterContextDateFilterOfAnyType,
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
