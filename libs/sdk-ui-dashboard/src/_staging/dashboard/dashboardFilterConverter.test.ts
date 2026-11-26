// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { type IUiAbsoluteGranularityDateFilterForm } from "@gooddata/sdk-ui-filters";

import { dateFilterOptionToDashboardDateFilter } from "./dashboardFilterConverter.js";

describe("dateFilterOptionToDashboardDateFilter", () => {
    const dataSet = idRef("date", "dataSet");

    it("should convert whole periods to the absolute date filter with granularity", () => {
        const option: IUiAbsoluteGranularityDateFilterForm = {
            localIdentifier: "option",
            type: "absoluteGranularityForm",
            visible: true,
            granularity: "GDC.time.quarter",
            from: "2026-1",
            to: "2026-3",
            emptyValueHandling: "exclude",
        };

        expect(dateFilterOptionToDashboardDateFilter(option, false, undefined, "df")).toStrictEqual({
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.quarter",
                from: "2026-1",
                to: "2026-3",
                dataSet: undefined,
                localIdentifier: "df",
                emptyValueHandling: "exclude",
            },
        });
    });

    it("should keep the date dataset and only one bound of whole periods", () => {
        const option: IUiAbsoluteGranularityDateFilterForm = {
            localIdentifier: "option",
            type: "absoluteGranularityForm",
            visible: true,
            granularity: "GDC.time.year",
            to: "2026",
        };

        expect(dateFilterOptionToDashboardDateFilter(option, false, dataSet)).toEqual({
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.year",
                to: "2026",
                dataSet,
            },
        });
    });
});
