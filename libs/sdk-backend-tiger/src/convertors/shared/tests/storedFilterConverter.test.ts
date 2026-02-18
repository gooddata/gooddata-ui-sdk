// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type ITigerFilterContextItem,
    type ITigerMeasureValueFilter,
    type ITigerMeasureValueFilterCondition,
} from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    type IFilter,
    type IMeasureValueFilter,
    idRef,
    isMeasureValueFilter,
    newAbsoluteDateFilter,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import {
    convertSdkFilterContextItemToTiger,
    convertSdkFilterToTigerStored,
    convertSdkFiltersToTiger,
    convertTigerStoredToSdkFilter,
    convertTigerToSdkFilters,
} from "../storedFilterConverter.js";

function expectTigerMeasureValueFilter(filter: unknown): asserts filter is ITigerMeasureValueFilter {
    expect(filter).toBeDefined();
    expect(typeof filter).toBe("object");
    expect(filter).not.toBeNull();
    expect(filter).toHaveProperty("measureValueFilter");
}

function expectSdkMeasureValueFilter(filter: IFilter): asserts filter is IMeasureValueFilter {
    expect(isMeasureValueFilter(filter)).toBe(true);
}

describe("storedFilterConverter", () => {
    describe("convertSdkFilterToTigerStored - IFilter conversions", () => {
        it("converts compound MVF with ID sanitization", () => {
            const sdkFilter = newMeasureValueFilterWithOptions(idRef("m1", "measure"), {
                conditions: [
                    { operator: "GREATER_THAN", value: 10 },
                    { operator: "BETWEEN", from: 1, to: 5 },
                ],
                treatNullValuesAs: 7,
            });

            const tigerFilter = convertSdkFilterToTigerStored(sdkFilter);
            expectTigerMeasureValueFilter(tigerFilter);

            const condition = tigerFilter.measureValueFilter.condition;
            expect(condition).toBeDefined();
            expect(condition).toHaveProperty("compound");

            const compound = (condition as Extract<ITigerMeasureValueFilterCondition, { compound: unknown }>)
                .compound;

            expect(compound.treatNullValuesAs).toBe(7);
            expect(compound.conditions).toEqual([
                { comparison: { operator: "GREATER_THAN", value: 10 } },
                { range: { operator: "BETWEEN", from: 1, to: 5 } },
            ]);

            // Verify measure reference (type becomes "metric" after conversion)
            expect(tigerFilter.measureValueFilter.measure).toEqual({
                identifier: { id: "m1", type: "metric" },
            });
        });

        it("converts single condition MVF with ID sanitization", () => {
            const sdkFilter = newMeasureValueFilter(idRef("m1", "measure"), "GREATER_THAN", 10, 0);

            const tigerFilter = convertSdkFilterToTigerStored(sdkFilter);
            expectTigerMeasureValueFilter(tigerFilter);

            expect(tigerFilter.measureValueFilter.condition).toEqual({
                comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 },
            });

            // Verify measure reference (type becomes "metric" after conversion)
            expect(tigerFilter.measureValueFilter.measure).toEqual({
                identifier: { id: "m1", type: "metric" },
            });
        });

        it("converts attribute filter with ID sanitization", () => {
            const sdkFilter = newPositiveAttributeFilter(idRef("attr1", "displayForm"), {
                values: ["value1", "value2"],
            });

            const tigerFilter = convertSdkFilterToTigerStored(sdkFilter);

            expect(tigerFilter).toHaveProperty("positiveAttributeFilter");
            if ("positiveAttributeFilter" in tigerFilter) {
                const attrFilter = tigerFilter.positiveAttributeFilter;

                // Verify ID conversion (displayForm type becomes "label")
                expect(attrFilter.displayForm).toEqual({
                    identifier: { id: "attr1", type: "label" },
                });
                if ("values" in attrFilter.in) {
                    expect(attrFilter.in.values).toEqual(["value1", "value2"]);
                }
            }
        });

        it("converts date filter with ID sanitization", () => {
            const sdkFilter = newAbsoluteDateFilter(idRef("date1", "dataSet"), "2020-01-01", "2020-12-31");

            const tigerFilter = convertSdkFilterToTigerStored(sdkFilter);

            expect(tigerFilter).toHaveProperty("absoluteDateFilter");
            if ("absoluteDateFilter" in tigerFilter) {
                const dateFilter = tigerFilter.absoluteDateFilter;

                // Verify ID conversion (dataSet type becomes "dataset")
                expect(dateFilter.dataSet).toEqual({
                    identifier: { id: "date1", type: "dataset" },
                });
                expect(dateFilter.from).toBe("2020-01-01");
                expect(dateFilter.to).toBe("2020-12-31");
            }
        });
    });

    describe("convertTigerStoredToSdkFilter - IFilter conversions", () => {
        it("converts compound MVF from Tiger to SDK", () => {
            const tigerFilter = {
                measureValueFilter: {
                    measure: { identifier: { id: "m1", type: "metric" } },
                    localIdentifier: "f1",
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
            } as unknown as ITigerMeasureValueFilter;

            const sdkFilter = convertTigerStoredToSdkFilter(tigerFilter);
            expectSdkMeasureValueFilter(sdkFilter);

            expect(sdkFilter.measureValueFilter.condition).toBeUndefined();
            expect(sdkFilter.measureValueFilter.conditions).toEqual([
                { comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 } },
                { range: { operator: "BETWEEN", from: 1, to: 5, treatNullValuesAs: 0 } },
            ]);
        });

        it("converts simple MVF condition from Tiger to SDK", () => {
            const tigerFilter = {
                measureValueFilter: {
                    measure: { identifier: { id: "m1", type: "metric" } },
                    condition: {
                        comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 },
                    },
                },
            } as unknown as ITigerMeasureValueFilter;

            const sdkFilter = convertTigerStoredToSdkFilter(tigerFilter);
            expectSdkMeasureValueFilter(sdkFilter);

            expect(sdkFilter.measureValueFilter.conditions).toBeUndefined();
            expect(sdkFilter.measureValueFilter.condition).toEqual({
                comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 },
            });
        });
    });

    describe("convertSdkFiltersToTiger - batch conversions", () => {
        it("converts array of filters", () => {
            const sdkFilters: IFilter[] = [
                newMeasureValueFilter(idRef("m1", "measure"), "GREATER_THAN", 10),
                newPositiveAttributeFilter(idRef("attr1", "displayForm"), { values: ["value1"] }),
            ];

            const tigerFilters = convertSdkFiltersToTiger(sdkFilters) ?? [];

            expect(tigerFilters).toHaveLength(2);
            expectTigerMeasureValueFilter(tigerFilters[0]);
            expect(tigerFilters[1]).toHaveProperty("positiveAttributeFilter");
        });

        it("handles undefined input by returning undefined", () => {
            const tigerFilters = convertSdkFiltersToTiger(undefined);
            expect(tigerFilters).toBeUndefined();
        });

        it("handles empty array", () => {
            const tigerFilters = convertSdkFiltersToTiger([]);
            expect(tigerFilters).toEqual([]);
        });
    });

    describe("convertTigerToSdkFilters - batch conversions", () => {
        it("converts array of Tiger filters", () => {
            const tigerFilters = [
                {
                    measureValueFilter: {
                        measure: { identifier: { id: "m1", type: "metric" } },
                        condition: {
                            comparison: { operator: "GREATER_THAN", value: 10 },
                        },
                    },
                } as unknown as ITigerMeasureValueFilter,
            ];

            const sdkFilters = convertTigerToSdkFilters(tigerFilters) ?? [];

            expect(sdkFilters).toHaveLength(1);
            expectSdkMeasureValueFilter(sdkFilters[0]);
        });

        it("handles undefined input by returning undefined", () => {
            const sdkFilters = convertTigerToSdkFilters(undefined);
            expect(sdkFilters).toBeUndefined();
        });

        it("handles empty array", () => {
            const sdkFilters = convertTigerToSdkFilters([]);
            expect(sdkFilters).toEqual([]);
        });
    });

    describe("FilterContextItem conversions", () => {
        it("converts SDK FilterContextItem to Tiger (attribute filter)", () => {
            const sdkItem: FilterContextItem = {
                attributeFilter: {
                    displayForm: idRef("attr1", "displayForm"),
                    negativeSelection: false,
                    attributeElements: { values: ["value1", "value2"] },
                    localIdentifier: "filter1",
                },
            };

            const tigerItem = convertSdkFiltersToTiger([sdkItem]) ?? [];

            expect(tigerItem).toHaveLength(1);
            const item = tigerItem[0] as ITigerFilterContextItem;
            expect(item).toHaveProperty("attributeFilter");
            // Verify ID conversion occurred (displayForm type becomes "label")
            if ("attributeFilter" in item) {
                expect(item.attributeFilter.displayForm).toEqual({
                    identifier: { id: "attr1", type: "label" },
                });
            }
        });

        it("converts SDK FilterContextItem to Tiger (date filter)", () => {
            const sdkItem: FilterContextItem = {
                dateFilter: {
                    type: "absolute",
                    granularity: "GDC.time.date",
                    from: "2020-01-01",
                    to: "2020-12-31",
                    dataSet: idRef("date1", "dataSet"),
                    localIdentifier: "dateFilter1",
                },
            };

            const tigerItem = convertSdkFiltersToTiger([sdkItem]) ?? [];

            expect(tigerItem).toHaveLength(1);
            const item = tigerItem[0] as ITigerFilterContextItem;
            expect(item).toHaveProperty("dateFilter");
            // Verify ID conversion occurred (dataSet type becomes "dataset")
            if ("dateFilter" in item) {
                expect(item.dateFilter.dataSet).toEqual({
                    identifier: { id: "date1", type: "dataset" },
                });
            }
        });

        it("converts ITigerFilterContextItem to SDK", () => {
            const tigerItem: ITigerFilterContextItem = {
                attributeFilter: {
                    displayForm: {
                        identifier: { id: "attr1", type: "label" },
                    },
                    negativeSelection: false,
                    attributeElements: { values: ["value1"] },
                },
            };

            const sdkItem = convertTigerToSdkFilters([tigerItem]) ?? [];

            expect(sdkItem).toHaveLength(1);
            expect(sdkItem[0]).toHaveProperty("attributeFilter");
        });

        it("handles undefined FilterContextItem arrays", () => {
            expect(convertSdkFiltersToTiger(undefined)).toBeUndefined();
            expect(convertTigerToSdkFilters(undefined)).toBeUndefined();
        });

        it("handles empty FilterContextItem arrays", () => {
            expect(convertSdkFiltersToTiger([])).toEqual([]);
            expect(convertTigerToSdkFilters([])).toEqual([]);
        });

        it("converts single SDK FilterContextItem with singular API", () => {
            const sdkItem: FilterContextItem = {
                attributeFilter: {
                    displayForm: idRef("attr1", "displayForm"),
                    negativeSelection: false,
                    attributeElements: { values: ["value1"] },
                    localIdentifier: "filter1",
                },
            };

            const tigerItem = convertSdkFilterContextItemToTiger(sdkItem);
            expect(tigerItem).toHaveProperty("attributeFilter");
        });
    });

    describe("compound condition preservation", () => {
        it("correctly converts compound conditions from Tiger to SDK format", () => {
            // Start with a Tiger filter (as would come from backend)
            const tigerFilter = {
                measureValueFilter: {
                    measure: { identifier: { id: "m1", type: "metric" } },
                    localIdentifier: "f1",
                    condition: {
                        compound: {
                            treatNullValuesAs: 0,
                            conditions: [
                                { comparison: { operator: "GREATER_THAN", value: 10 } },
                                { comparison: { operator: "LESS_THAN", value: 100 } },
                            ],
                        },
                    },
                },
            } as unknown as ITigerMeasureValueFilter;

            // Convert to SDK and verify compound conditions are preserved
            const sdkFilter = convertTigerStoredToSdkFilter(tigerFilter);
            expectSdkMeasureValueFilter(sdkFilter);

            expect(sdkFilter.measureValueFilter.conditions).toHaveLength(2);
            expect(sdkFilter.measureValueFilter.conditions?.[0]).toEqual({
                comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 },
            });
            expect(sdkFilter.measureValueFilter.conditions?.[1]).toEqual({
                comparison: { operator: "LESS_THAN", value: 100, treatNullValuesAs: 0 },
            });
        });
    });
});
