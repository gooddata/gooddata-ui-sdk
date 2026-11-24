// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    ITigerAbsoluteGranularityDateFilter,
    ITigerDashboardAbsoluteGranularityDateFilter,
    ITigerFilter,
    ITigerFilterContextItem,
} from "./TigerTypes.js";
import {
    isTigerFilter,
    isTigerFilterContextItem,
    isTigerFilterContextItemOfAnyType,
    isTigerFilterContextItems,
    isTigerFilterContextItemsOfAnyType,
    isTigerFilterOfAnyType,
    isTigerFilters,
    isTigerFiltersOfAnyType,
} from "./typeGuards.js";

describe("typeGuards", () => {
    const compoundMeasureValueFilter = {
        measureValueFilter: {
            measure: { identifier: { id: "m1", type: "metric" } },
            localIdentifier: "mvf1",
            condition: {
                compound: {
                    treatNullValuesAs: 0,
                    conditions: [
                        { comparison: { operator: "GREATER_THAN", value: 10 } },
                        { range: { operator: "BETWEEN", from: 1, to: 5 } },
                    ],
                },
            },
        },
    } as unknown as ITigerFilter;

    const attributeDashboardFilter: ITigerFilterContextItem = {
        attributeFilter: {
            displayForm: { identifier: { id: "label.product.name", type: "label" } },
            negativeSelection: false,
            attributeElements: { values: ["North"] },
        },
    };

    const dateDashboardFilter: ITigerFilterContextItem = {
        dateFilter: {
            type: "absolute",
            dataSet: { identifier: { id: "dataset.closedDate", type: "dataset" } },
            from: "2020-01-01",
            to: "2020-12-31",
            granularity: "GDC.time.date",
        },
    };

    const arbitraryAttributeDashboardFilter: ITigerFilterContextItem = {
        arbitraryAttributeFilter: {
            displayForm: { identifier: { id: "label.product.name", type: "label" } },
            values: ["North", "South"],
            negativeSelection: false,
        },
    };

    const matchAttributeDashboardFilter: ITigerFilterContextItem = {
        matchAttributeFilter: {
            displayForm: { identifier: { id: "label.product.name", type: "label" } },
            operator: "contains",
            literal: "North",
            caseSensitive: false,
            negativeSelection: false,
        },
    };

    it("recognizes Tiger filter with compound measure value condition", () => {
        expect(isTigerFilter(compoundMeasureValueFilter)).toBe(true);
    });

    it("applies structural Tiger filter checks", () => {
        expect(isTigerFilter({ measureValueFilter: { condition: {} } })).toBe(true);
        expect(isTigerFilter({ foo: "bar" })).toBe(false);
        expect(isTigerFilter(null)).toBe(false);
    });

    it("recognizes Tiger filter arrays and rejects mixed arrays", () => {
        expect(isTigerFilters([compoundMeasureValueFilter])).toBe(true);
        expect(isTigerFilters([compoundMeasureValueFilter, { foo: "bar" }])).toBe(false);
    });

    it("recognizes dashboard filters", () => {
        expect(isTigerFilterContextItem(attributeDashboardFilter)).toBe(true);
        expect(isTigerFilterContextItem(dateDashboardFilter)).toBe(true);
        expect(isTigerFilterContextItem(arbitraryAttributeDashboardFilter)).toBe(true);
        expect(isTigerFilterContextItem(matchAttributeDashboardFilter)).toBe(true);
        expect(isTigerFilterContextItem({ dateFilter: { from: "2020-01-01", to: "2020-12-31" } })).toBe(true);
    });

    it("recognizes dashboard filter arrays and rejects mixed arrays", () => {
        expect(
            isTigerFilterContextItems([
                attributeDashboardFilter,
                dateDashboardFilter,
                arbitraryAttributeDashboardFilter,
                matchAttributeDashboardFilter,
            ]),
        ).toBe(true);
        expect(isTigerFilterContextItems([attributeDashboardFilter, { foo: "bar" }])).toBe(false);
    });

    const granularityDateFilter: ITigerAbsoluteGranularityDateFilter = {
        absoluteGranularityDateFilter: {
            dataSet: { identifier: "dataset.closedDate", type: "dataSet" },
            granularity: "GDC.time.month",
            from: "2026-01",
            to: "2026-03",
        },
    };

    const granularityDateDashboardFilter: ITigerDashboardAbsoluteGranularityDateFilter = {
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.month",
            to: "2026-03",
        },
    };

    it("recognizes filter context items of any type", () => {
        expect(isTigerFilterContextItemOfAnyType(granularityDateDashboardFilter)).toBe(true);
        expect(isTigerFilterContextItemOfAnyType(attributeDashboardFilter)).toBe(true);
        expect(isTigerFilterContextItemOfAnyType(granularityDateFilter)).toBe(false);
        expect(isTigerFilterContextItemOfAnyType(null)).toBe(false);
    });

    it("recognizes filter context item arrays of any type and rejects mixed arrays", () => {
        expect(
            isTigerFilterContextItemsOfAnyType([
                attributeDashboardFilter,
                granularityDateDashboardFilter,
                dateDashboardFilter,
            ]),
        ).toBe(true);
        expect(isTigerFilterContextItemsOfAnyType([granularityDateDashboardFilter, { foo: "bar" }])).toBe(
            false,
        );
    });

    it("recognizes filters of any type", () => {
        expect(isTigerFilterOfAnyType(granularityDateFilter)).toBe(true);
        expect(isTigerFilterOfAnyType(compoundMeasureValueFilter)).toBe(true);
        expect(isTigerFilterOfAnyType(granularityDateDashboardFilter)).toBe(false);
        expect(isTigerFilterOfAnyType(null)).toBe(false);
    });

    it("recognizes filter arrays of any type and rejects mixed arrays", () => {
        expect(isTigerFiltersOfAnyType([compoundMeasureValueFilter, granularityDateFilter])).toBe(true);
        expect(isTigerFiltersOfAnyType([granularityDateFilter, { foo: "bar" }])).toBe(false);
    });

    it("does not match the absolute date filter with granularity by the guards that are not of any type", () => {
        expect(isTigerFilter(granularityDateFilter)).toBe(false);
        expect(isTigerFilters([compoundMeasureValueFilter, granularityDateFilter])).toBe(false);
        expect(isTigerFilterContextItem(granularityDateDashboardFilter)).toBe(false);
        expect(isTigerFilterContextItems([attributeDashboardFilter, granularityDateDashboardFilter])).toBe(
            false,
        );
    });
});
