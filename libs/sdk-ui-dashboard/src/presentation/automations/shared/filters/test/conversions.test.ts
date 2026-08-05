// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAutomationVisibleFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { getVisibleFiltersByFilters } from "../conversions.js";

describe("getVisibleFiltersByFilters", () => {
    const allValuesAttributeFilter: FilterContextItem = {
        attributeFilter: {
            displayForm: { identifier: "attr.df" },
            negativeSelection: true,
            attributeElements: { values: [] },
            localIdentifier: "allValuesAttr",
        },
    };
    const selectedAttributeFilter: FilterContextItem = {
        attributeFilter: {
            displayForm: { identifier: "attr.df2" },
            negativeSelection: true,
            attributeElements: { values: ["element1"] },
            localIdentifier: "selectedAttr",
        },
    };
    const allTimeDateFilter: FilterContextItem = newAllTimeDashboardDateFilter(
        { identifier: "ds" },
        "allTimeDate",
    );
    const relativeDateFilter: FilterContextItem = newRelativeDashboardDateFilter(
        "GDC.time.date",
        -1,
        0,
        { identifier: "ds2" },
        "relativeDate",
    );

    const visibleFiltersMetadata: IAutomationVisibleFilter[] = [
        { localIdentifier: "allValuesAttr", title: "All Values Attr" },
        { localIdentifier: "selectedAttr", title: "Selected Attr" },
        { localIdentifier: "allTimeDate", title: "All Time Date" },
        { localIdentifier: "relativeDate", title: "Relative Date" },
    ];

    it("should return undefined when storeFilters is false", () => {
        const result = getVisibleFiltersByFilters([selectedAttributeFilter], visibleFiltersMetadata, false);
        expect(result).toBeUndefined();
    });

    it("should exclude all-values attribute filters from visible filters metadata", () => {
        const result = getVisibleFiltersByFilters(
            [allValuesAttributeFilter, selectedAttributeFilter],
            visibleFiltersMetadata,
            true,
        );

        expect(result).toHaveLength(1);
        expect(result![0].localIdentifier).toBe("selectedAttr");
    });

    it("should keep date filters including all-time with isAllTimeDateFilter flag", () => {
        const result = getVisibleFiltersByFilters(
            [allTimeDateFilter, relativeDateFilter],
            visibleFiltersMetadata,
            true,
        );

        expect(result).toHaveLength(2);
        expect(result![0].localIdentifier).toBe("allTimeDate");
        expect(result![0].isAllTimeDateFilter).toBe(true);
        expect(result![1].localIdentifier).toBe("relativeDate");
        expect(result![1].isAllTimeDateFilter).toBe(false);
    });

    it("should return only non-all-values filters when mixed with date filters", () => {
        const result = getVisibleFiltersByFilters(
            [allValuesAttributeFilter, selectedAttributeFilter, relativeDateFilter],
            visibleFiltersMetadata,
            true,
        );

        expect(result).toHaveLength(2);
        expect(result!.map((f) => f.localIdentifier)).toEqual(["selectedAttr", "relativeDate"]);
    });

    it("should return empty array when all filters are all-values attribute filters", () => {
        const result = getVisibleFiltersByFilters([allValuesAttributeFilter], visibleFiltersMetadata, true);

        expect(result).toEqual([]);
    });
});
