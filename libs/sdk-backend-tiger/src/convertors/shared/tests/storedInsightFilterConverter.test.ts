// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type ITigerMeasureValueFilter,
    type ITigerMeasureValueFilterCondition,
} from "@gooddata/api-client-tiger";
import {
    type IFilter,
    type IMeasureValueFilter,
    idRef,
    isMeasureValueFilter,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
} from "@gooddata/sdk-model";

import {
    convertMeasureValueFilterSdkToTiger,
    convertMeasureValueFilterTigerToSdk,
} from "../measureValueFilterConverter.js";

function expectTigerMeasureValueFilter(filter: unknown): asserts filter is ITigerMeasureValueFilter {
    expect(filter).toBeDefined();
    expect(typeof filter).toBe("object");
    expect(filter).not.toBeNull();
    expect(filter).toHaveProperty("measureValueFilter");
}

function expectSdkMeasureValueFilter(filter: IFilter): asserts filter is IMeasureValueFilter {
    expect(isMeasureValueFilter(filter)).toBe(true);
}

describe("storedInsightFilterConverter", () => {
    describe("sdk-model -> Tiger stored insight", () => {
        it("converts mixed conditions[] to compound condition and uses firstDefined treatNullValuesAs", () => {
            const sdkFilter = newMeasureValueFilterWithOptions(idRef("m1", "measure"), {
                conditions: [
                    { operator: "GREATER_THAN", value: 10 },
                    { operator: "BETWEEN", from: 1, to: 5 },
                ],
                treatNullValuesAs: 7,
            });

            const tigerFilter = convertMeasureValueFilterSdkToTiger(sdkFilter);
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
        });

        it("keeps a single sdk-model condition as a simple Tiger condition (not compound)", () => {
            const sdkFilter = newMeasureValueFilter(idRef("m1", "measure"), "GREATER_THAN", 10, 0);

            const tigerFilter = convertMeasureValueFilterSdkToTiger(sdkFilter);
            expectTigerMeasureValueFilter(tigerFilter);

            expect(tigerFilter.measureValueFilter.condition).toEqual({
                comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 },
            });
        });
    });

    describe("Tiger stored insight -> sdk-model", () => {
        it("converts compound condition to sdk-model conditions[] and applies treatNullValuesAs to each condition", () => {
            const tigerFilter: ITigerMeasureValueFilter = {
                measureValueFilter: {
                    measure: idRef("m1", "measure"),
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
            };

            const sdkFilter = convertMeasureValueFilterTigerToSdk(tigerFilter);
            expectSdkMeasureValueFilter(sdkFilter);

            expect(sdkFilter.measureValueFilter.condition).toBeUndefined();
            expect(sdkFilter.measureValueFilter.conditions).toEqual([
                { comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 } },
                { range: { operator: "BETWEEN", from: 1, to: 5, treatNullValuesAs: 0 } },
            ]);
        });

        it("keeps a simple Tiger condition as sdk-model condition", () => {
            const tigerFilter: ITigerMeasureValueFilter = {
                measureValueFilter: {
                    measure: idRef("m1", "measure"),
                    condition: {
                        comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 },
                    },
                },
            };

            const sdkFilter = convertMeasureValueFilterTigerToSdk(tigerFilter);
            expectSdkMeasureValueFilter(sdkFilter);

            expect(sdkFilter.measureValueFilter.conditions).toBeUndefined();
            expect(sdkFilter.measureValueFilter.condition).toEqual({
                comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 },
            });
        });
    });
});
