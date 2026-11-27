// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IDashboardMeasureValueFilter,
    type ObjRef,
    idRef,
    newAllTimeDashboardDateFilter,
    newDashboardParameterizedDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { type ITabState } from "../tabsState.js";

import { type FilterContextState, type WorkingFilterContextItem } from "./filterContextState.js";
import {
    applyMirroredFilterValue,
    findCounterpartFilter,
    withCommonDateFilterLocalIdentifier,
} from "./filterSync.js";

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

describe("withCommonDateFilterLocalIdentifier", () => {
    it("makes a period common and sets the local identifier", () => {
        const period = newDashboardParameterizedDateFilter(idRef("fiscal_year", "parameter"), {
            dataSet: idRef("closed", "dataSet"),
            localIdentifier: "source",
            emptyValueHandling: "include",
        });

        expect(withCommonDateFilterLocalIdentifier(period, "target")).toEqual(
            newDashboardParameterizedDateFilter(idRef("fiscal_year", "parameter"), {
                localIdentifier: "target",
                emptyValueHandling: "include",
            }),
        );
    });
});

describe("date filters with a dimension of any type", () => {
    const dataSet = idRef("closed", "dataSet");
    const otherDataSet = idRef("created", "dataSet");
    const monthFilter = (localIdentifier: string, filterDataSet: ObjRef = dataSet): FilterContextItem => ({
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.month",
            from: "2026-03",
            to: "2026-05",
            dataSet: filterDataSet,
            localIdentifier,
        },
    });

    it.each<[string, FilterContextItem, FilterContextItem]>([
        [
            "the new type with the old type",
            monthFilter("source"),
            newRelativeDashboardDateFilter("GDC.time.year", -1, -1, dataSet, "target"),
        ],
        [
            "the old type with the new type",
            newAllTimeDashboardDateFilter(dataSet, "source"),
            monthFilter("target"),
        ],
        ["the new type with the new type", monthFilter("source"), monthFilter("target")],
    ])("matches %s by the date dataset", (_desc, sourceFilter, counterpart) => {
        const source = tab("tab-a", [sourceFilter]);
        const target = tab("tab-b", [monthFilter("other", otherDataSet), counterpart]);

        expect(findCounterpartFilter(source, sourceFilter, target)).toBe(counterpart);
    });

    it("mirrors the value of the new type keeping the identity of the target", () => {
        expect(
            applyMirroredFilterValue(
                monthFilter("source"),
                newRelativeDashboardDateFilter("GDC.time.year", -1, -1, dataSet, "target"),
            ),
        ).toEqual(monthFilter("target"));
    });

    it("mirrors the value of the old type keeping the identity of the target of the new type", () => {
        expect(
            applyMirroredFilterValue(
                newRelativeDashboardDateFilter("GDC.time.year", -1, -1, dataSet, "source"),
                monthFilter("target"),
            ),
        ).toEqual(newRelativeDashboardDateFilter("GDC.time.year", -1, -1, dataSet, "target"));
    });
});
