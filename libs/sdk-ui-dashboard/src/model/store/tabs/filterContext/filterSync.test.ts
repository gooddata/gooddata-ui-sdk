// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IDashboardMeasureValueFilter,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { type ITabState } from "../tabsState.js";

import { type FilterContextState, type WorkingFilterContextItem } from "./filterContextState.js";
import { findCounterpartFilter } from "./filterSync.js";

const measure = idRef("amount", "measure");

function measureFilter(
    localIdentifier: string,
    value: number,
    dimensionality?: ObjRef[],
): IDashboardMeasureValueFilter {
    return {
        dashboardMeasureValueFilter: {
            measure,
            localIdentifier,
            conditions: [{ comparison: { operator: "GREATER_THAN", value } }],
            ...(dimensionality?.length ? { dimensionality } : {}),
        },
    };
}

function filterContext(
    filters: FilterContextItem[],
    working: WorkingFilterContextItem[] = [],
    original?: FilterContextItem[],
): FilterContextState {
    return {
        filtersWithInvalidSelection: [],
        filterContextDefinition: { title: "", description: "", filters },
        workingFilterContextDefinition: { filters: working },
        ...(original
            ? { originalFilterContextDefinition: { title: "", description: "", filters: original } }
            : {}),
    };
}

function tab(localIdentifier: string, filters: FilterContextItem[]): ITabState {
    return { localIdentifier, filterContext: filterContext(filters) };
}

describe("findCounterpartFilter", () => {
    const region = idRef("region", "attribute");
    const product = idRef("product", "attribute");

    it("matches the only measure-value filter with the same measure and dimensionality", () => {
        const sourceFilter = measureFilter("mvf-a", 1, [region, product]);
        const differentDimensionality = measureFilter("mvf-other", 3, [product]);
        const counterpart = measureFilter("mvf-b", 2, [product, region]);
        const source = tab("tab-a", [sourceFilter]);
        const target = tab("tab-b", [differentDimensionality, counterpart]);
        expect(findCounterpartFilter(source, sourceFilter, target)).toBe(counterpart);
    });

    it("does not match when two target filters share the measure and dimensionality", () => {
        const sourceFilter = measureFilter("mvf-a", 1, [region, product]);
        const first = measureFilter("mvf-b", 2, [region, product]);
        const second = measureFilter("mvf-c", 3, [product, region]);
        const source = tab("tab-a", [sourceFilter]);
        expect(findCounterpartFilter(source, sourceFilter, tab("tab-b", [first, second]))).toBeUndefined();
        expect(findCounterpartFilter(source, sourceFilter, tab("tab-c", [second, first]))).toBeUndefined();
    });

    it("does not match two measure-value filters that both omit dimensionality", () => {
        const sourceFilter = measureFilter("mvf-a", 1);
        const source = tab("tab-a", [sourceFilter]);
        const target = tab("tab-b", [measureFilter("mvf-b", 2), measureFilter("mvf-c", 3)]);
        expect(findCounterpartFilter(source, sourceFilter, target)).toBeUndefined();
    });
});
