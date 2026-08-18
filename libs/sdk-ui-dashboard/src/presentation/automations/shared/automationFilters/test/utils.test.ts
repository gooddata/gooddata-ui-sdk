// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type IFilter,
    idRef,
    newAllTimeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import {
    applyFilterChange,
    areFiltersEqual,
    isAllTimeDateFilterFixed,
    removeFilterFrom,
    resolveFilterToAdd,
    resolveTabFilterToAdd,
} from "../utils.js";

function attributeFilter(localIdentifier: string, displayFormId: string): FilterContextItem {
    return {
        attributeFilter: {
            localIdentifier,
            displayForm: idRef(displayFormId, "displayForm"),
            negativeSelection: false,
            attributeElements: { uris: [] },
        },
    };
}

function dateFilter(localIdentifier: string, dataSetId: string): FilterContextItem {
    return {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.date",
            localIdentifier,
            dataSet: idRef(dataSetId, "dataSet"),
        },
    };
}

function mvFilter(localIdentifier: string, measureId: string): FilterContextItem {
    return {
        dashboardMeasureValueFilter: {
            localIdentifier,
            measure: idRef(measureId, "measure"),
        },
    };
}

function displayFormMd(id: string): IAttributeDisplayFormMetadataObject {
    // Only `ref` is read by the resolvers; the rest are filler metadata fields.
    return {
        type: "displayForm",
        id,
        uri: `/${id}`,
        ref: idRef(id, "displayForm"),
        title: id,
        description: "",
        attribute: idRef("attr-1", "attribute"),
        production: true,
        deprecated: false,
        unlisted: false,
    };
}

function catalogAttributeWith(displayFormIds: string[]): ICatalogAttribute {
    const displayForms = displayFormIds.map(displayFormMd);
    // Only `displayForms[].ref` is read by the resolvers; the rest are filler metadata fields.
    return {
        type: "attribute",
        attribute: {
            type: "attribute",
            id: "attr-1",
            uri: "/attr-1",
            ref: idRef("attr-1", "attribute"),
            title: "Attr 1",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            displayForms,
        },
        defaultDisplayForm: displayForms[0],
        displayForms,
        geoPinDisplayForms: [],
        groups: [],
    };
}

function catalogDateDatasetWith(dataSetId: string): ICatalogDateDataset {
    // Only `dataSet.ref` is read by the resolvers; the rest are filler metadata fields.
    return {
        type: "dateDataset",
        relevance: 0,
        dateAttributes: [],
        dataSet: {
            type: "dataSet",
            id: dataSetId,
            uri: `/${dataSetId}`,
            ref: idRef(dataSetId, "dataSet"),
            title: dataSetId,
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
        },
    };
}

describe("automationFilters/utils", () => {
    describe("isAllTimeDateFilterFixed", () => {
        it("should return true for standard all-time date filter", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df");

            expect(isAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should return true for standard all-time date filter with emptyValueHandling", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df", "exclude");

            expect(isAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should treat AD-style relative filter without from/to as all-time", () => {
            const adAllTimeShape = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                },
            };
            const adAllTimeShapeWithConfig = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                    emptyValueHandling: "include",
                },
            };

            expect(isAllTimeDateFilterFixed(adAllTimeShape as IFilter)).toBe(true);
            expect(isAllTimeDateFilterFixed(adAllTimeShapeWithConfig as IFilter)).toBe(true);
        });

        it("should return false for non-all-time relative date filter", () => {
            const filter = newRelativeDateFilter({ identifier: "ds" }, "GDC.time.date", -1, 0, "df");

            expect(isAllTimeDateFilterFixed(filter)).toBe(false);
        });
    });

    describe("areFiltersEqual", () => {
        it("should treat arbitrary attribute filters with same values (different array refs) as equal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newArbitraryAttributeFilter(ref, ["a", "b"], false);
            const filter2 = newArbitraryAttributeFilter(ref, ["a", "b"], false);

            expect(filter1.arbitraryAttributeFilter.values).not.toBe(filter2.arbitraryAttributeFilter.values);
            expect(areFiltersEqual(filter1, filter2)).toBe(true);
        });

        it("should treat arbitrary attribute filters with different values as unequal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newArbitraryAttributeFilter(ref, ["a", "b"], false);
            const filter2 = newArbitraryAttributeFilter(ref, ["a", "c"], false);

            expect(areFiltersEqual(filter1, filter2)).toBe(false);
        });

        it("should treat match attribute filters with same literal/operator/caseSensitive/negativeSelection as equal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: true,
                negativeSelection: false,
            });
            const filter2 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: true,
                negativeSelection: false,
            });

            expect(areFiltersEqual(filter1, filter2)).toBe(true);
        });

        it("should treat match attribute filters differing in caseSensitive as unequal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: true,
                negativeSelection: false,
            });
            const filter2 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: false,
                negativeSelection: false,
            });

            expect(areFiltersEqual(filter1, filter2)).toBe(false);
        });

        it("should treat match attribute filters differing in negativeSelection as unequal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: false,
                negativeSelection: false,
            });
            const filter2 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: false,
                negativeSelection: true,
            });

            expect(areFiltersEqual(filter1, filter2)).toBe(false);
        });
    });

    describe("applyFilterChange", () => {
        it("replaces the filter matched by local identifier and keeps the rest by reference", () => {
            const keep = attributeFilter("f1", "df1");
            const before = attributeFilter("f2", "df2");
            const after = attributeFilter("f2", "df2-changed");

            const result = applyFilterChange([keep, before], after);

            expect(result).toEqual([keep, after]);
            expect(result[0]).toBe(keep);
            expect(result[1]).toBe(after);
        });

        it("returns the original contents when nothing matches", () => {
            const only = attributeFilter("f1", "df1");

            const result = applyFilterChange([only], attributeFilter("other", "dfX"));

            expect(result).toEqual([only]);
            expect(result[0]).toBe(only);
        });
    });

    describe("removeFilterFrom", () => {
        it("removes only the filter matched by local identifier", () => {
            const keep = dateFilter("d1", "ds1");
            const remove = attributeFilter("f1", "df1");

            expect(removeFilterFrom([keep, remove], remove)).toEqual([keep]);
        });
    });

    describe("resolveFilterToAdd", () => {
        it("resolves an attribute filter through a secondary display form of the attribute", () => {
            // the candidate filter uses df-secondary; the dropdown emitted df-primary
            const candidate = attributeFilter("f1", "df-secondary");
            const attributes = [catalogAttributeWith(["df-primary", "df-secondary"])];

            const result = resolveFilterToAdd(
                idRef("df-primary", "displayForm"),
                [candidate],
                attributes,
                [],
            );

            expect(result).toBe(candidate);
        });

        it("resolves a date filter by its dataset ref", () => {
            const candidate = dateFilter("d1", "ds1");

            const result = resolveFilterToAdd(
                idRef("ds1", "dataSet"),
                [candidate],
                [],
                [catalogDateDatasetWith("ds1")],
            );

            expect(result).toBe(candidate);
        });

        it("resolves a measure value filter by the metric ref, and only an MVF", () => {
            const candidate = mvFilter("m1", "measure-1");

            expect(resolveFilterToAdd(idRef("measure-1", "measure"), [candidate], [], [])).toBe(candidate);
            // an unknown ref resolves nothing
            expect(resolveFilterToAdd(idRef("nothing"), [candidate], [], [])).toBeUndefined();
            // a non-MVF candidate that matches the ref must not be returned through the measure path
            // (attributes/dateDatasets empty, so only the measure lookup can hit)
            const attrCandidate = attributeFilter("f1", "df1");
            expect(resolveFilterToAdd(idRef("df1", "displayForm"), [attrCandidate], [], [])).toBeUndefined();
        });
    });

    describe("resolveTabFilterToAdd", () => {
        it("resolves an attribute filter through a secondary display form", () => {
            const candidate = attributeFilter("f1", "df-secondary");
            const attributes = [catalogAttributeWith(["df-primary", "df-secondary"])];

            expect(
                resolveTabFilterToAdd(idRef("df-primary", "displayForm"), [candidate], attributes, []),
            ).toBe(candidate);
        });

        it("resolves a date filter by its dataset ref", () => {
            const candidate = dateFilter("d1", "ds1");

            expect(
                resolveTabFilterToAdd(
                    idRef("ds1", "dataSet"),
                    [candidate],
                    [],
                    [catalogDateDatasetWith("ds1")],
                ),
            ).toBe(candidate);
        });

        it("resolves a measure value filter by the metric ref", () => {
            const candidate = mvFilter("m1", "measure-1");

            expect(resolveTabFilterToAdd(idRef("measure-1", "measure"), [candidate], [], [])).toBe(candidate);
            expect(resolveTabFilterToAdd(idRef("nothing"), [candidate], [], [])).toBeUndefined();
        });
    });
});
