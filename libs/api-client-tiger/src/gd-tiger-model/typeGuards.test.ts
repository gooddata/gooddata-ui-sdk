// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { ITigerFilter, ITigerFilterContextItem } from "./TigerTypes.js";
import {
    isTigerFilter,
    isTigerFilterContextItem,
    isTigerFilterContextItems,
    isTigerFilters,
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
        expect(isTigerFilterContextItem({ dateFilter: { from: "2020-01-01", to: "2020-12-31" } })).toBe(
            false,
        );
    });

    it("recognizes dashboard filter arrays and rejects mixed arrays", () => {
        expect(isTigerFilterContextItems([attributeDashboardFilter, dateDashboardFilter])).toBe(true);
        expect(isTigerFilterContextItems([attributeDashboardFilter, { foo: "bar" }])).toBe(false);
    });
});
