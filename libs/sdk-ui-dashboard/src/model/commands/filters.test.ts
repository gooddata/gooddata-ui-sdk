// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type DateAttributeGranularity,
    idRef,
    newAbsoluteDateFilter,
    newAbsoluteGranularityDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { applyDateFilter, changeDateFilterSelectionOfAnyType } from "./filters.js";

describe("applyDateFilter", () => {
    it.each([
        ["GDC.time.month", "GDC.time.month"],
        ["GDC.time.month_in_year", "GDC.time.date"],
        ["GDC.time.week", "GDC.time.date"],
        [undefined, "GDC.time.date"],
    ] as [DateAttributeGranularity | undefined, string][])(
        "applies an absolute date filter at %s as %s",
        (granularity, expected) => {
            const filter = newAbsoluteDateFilter(idRef("closed", "dataSet"), "2026-03-01", "2026-04-30", {
                granularity,
            });

            expect(applyDateFilter(filter).payload.granularity).toBe(expected);
        },
    );

    it("applies an absolute date filter with granularity as a change of a date filter of any type", () => {
        const filter = newAbsoluteGranularityDateFilter(
            idRef("closed", "dataSet"),
            "GDC.time.month",
            "2026-03",
            "2026-04",
            { localIdentifier: "date" },
        );

        expect(applyDateFilter(filter, "correlation")).toEqual(
            changeDateFilterSelectionOfAnyType(
                {
                    dashboardAbsoluteGranularityDateFilter: {
                        granularity: "GDC.time.month",
                        from: "2026-03",
                        to: "2026-04",
                        dataSet: idRef("closed", "dataSet"),
                        localIdentifier: "date",
                    },
                },
                { correlationId: "correlation" },
            ),
        );
    });

    it("applies an absolute date filter with granularity with only one bound", () => {
        const filter = newAbsoluteGranularityDateFilter(
            idRef("closed", "dataSet"),
            "GDC.time.week",
            undefined,
            "2026-05",
        );

        expect(applyDateFilter(filter).payload.filter).toEqual({
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.week",
                to: "2026-05",
                dataSet: idRef("closed", "dataSet"),
            },
        });
    });
});

describe("changeDateFilterSelectionOfAnyType", () => {
    it("creates the command with the options", () => {
        const filter = newAllTimeDashboardDateFilter();

        expect(
            changeDateFilterSelectionOfAnyType(filter, {
                dateFilterOptionLocalId: "option",
                isWorkingSelectionChange: true,
                correlationId: "correlation",
            }),
        ).toEqual({
            type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER_OF_ANY_TYPE.CHANGE_SELECTION",
            correlationId: "correlation",
            payload: {
                filter,
                dateFilterOptionLocalId: "option",
                isWorkingSelectionChange: true,
            },
        });
    });
});
