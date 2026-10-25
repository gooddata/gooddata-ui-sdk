// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ObjRef, uriRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { MEASURES } from "../constants/bucket.js";
import { type IDateFilter } from "../store/filter_bar/filter_bar_types.js";
import {
    activityDateDataset,
    dateDatasetRef,
    measureBucketItems,
    setupAppStateWithDateDatasets,
} from "../tests/constants.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { type IDateDatasets } from "../typings/datasets.js";

import { selectedDateDataSetRef } from "./date_dataset.test.helpers.js";
import {
    getDecoratedDateDatasets,
    isActiveDateDatasetAvailable as isActiveDateDatasetAvailableSelector,
    isPoPAvailable,
    isPoPSetup,
    isUsedByInsight,
    selectedOverTimeComparisonMeasures,
} from "./date_filter_selector.js";

describe("Date filter selector test", () => {
    describe("selectedOverTimeComparisonMeasures", () => {
        it("should return the all measure identifiers", () => {
            const measuresWithoutDerivedItem = [measureBucketItems[0], measureBucketItems[1]];
            const bucketsWithoutDerivedItem = [
                {
                    localIdentifier: MEASURES,
                    items: measuresWithoutDerivedItem,
                },
            ];
            const refPointBucketsWithoutDerivedItem = bucketsWithoutDerivedItem;

            const compatibleMeasures = [
                {
                    localIdentifier: "m1",
                },
                {
                    localIdentifier: "m2",
                },
            ];

            expect(
                selectedOverTimeComparisonMeasures.resultFunc(
                    refPointBucketsWithoutDerivedItem,
                    compatibleMeasures,
                ),
            ).toEqual(["m1", "m2"]);
        });

        it("should return the available measure identifiers without derived measures", () => {
            const measuresWithDerivedItem = [measureBucketItems[2], measureBucketItems[3]];
            const bucketsWithDerivedItem = [
                {
                    localIdentifier: MEASURES,
                    items: measuresWithDerivedItem,
                },
            ];
            const refPointBucketsWithDerivedItem = bucketsWithDerivedItem;

            const compatibleMeasures = [
                {
                    localIdentifier: "m3",
                },
                {
                    localIdentifier: "m3_renamed_pop",
                },
            ];

            expect(
                selectedOverTimeComparisonMeasures.resultFunc(
                    refPointBucketsWithDerivedItem,
                    compatibleMeasures,
                ),
            ).toEqual(["m3"]);
        });
    });

    describe("getDecoratedDateDatasets", () => {
        it("should return the decorated date datasets", () => {
            const dateDatasets: IDateDatasets = {
                available: [dateDatasetRef],
                unavailable: 0,
            };
            expect(getDecoratedDateDatasets.resultFunc(dateDatasets, false)).toEqual({
                items: [
                    {
                        isAvailable: true,
                        identifier: "date.dim_date",
                        relevance: 0,
                        title: "Date dimension (Date)",
                        ref: {
                            uri: "date.dim_date",
                        },
                    },
                ],
                unavailable: 0,
            });
        });
    });

    describe("isActiveDateDatasetAvailable", () => {
        it("should return true if the active date dataset is available", () => {
            const stateWithDateDatatsets = setupAppStateWithDateDatasets(getInitializedState());

            expect(
                isActiveDateDatasetAvailableSelector(stateWithDateDatatsets, activityDateDataset.ref),
            ).toEqual(true);
        });
        it("should return false if the active date dataset is not available", () => {
            const stateWithDateDatatsets = setupAppStateWithDateDatasets(getInitializedState());

            expect(
                isActiveDateDatasetAvailableSelector(stateWithDateDatatsets, selectedDateDataSetRef),
            ).toEqual(false);
        });
    });

    describe("isUsedByInsight", () => {
        it.each`
            isActiveDateDatasetAvailable | dataSet         | isLoadingAvailability | expected
            ${false}                     | ${null}         | ${false}              | ${false}
            ${false}                     | ${null}         | ${true}               | ${true}
            ${false}                     | ${"CSVDataSet"} | ${false}              | ${true}
            ${false}                     | ${"CSVDataSet"} | ${true}               | ${true}
            ${true}                      | ${null}         | ${false}              | ${true}
            ${true}                      | ${null}         | ${true}               | ${true}
            ${true}                      | ${"CSVDataSet"} | ${false}              | ${true}
            ${true}                      | ${"CSVDataSet"} | ${true}               | ${true}
        `(
            "should return $expected when isActiveDateDatasetAvailable is $isActiveDateDatasetAvailable, dataSet is $dataSet and isLoadingAvailability is $isLoadingAvailability",
            ({ isActiveDateDatasetAvailable, dataSet, isLoadingAvailability, expected }) => {
                expect(
                    isUsedByInsight.resultFunc(isActiveDateDatasetAvailable, dataSet, isLoadingAvailability),
                ).toBe(expected);
            },
        );
    });

    describe("isPoPAvailable", () => {
        it("should return false if dateBucketItemDateDatasetRefs and filterDateDataset are empty", () => {
            const dateBucketItemDateDatasetRefs: ObjRef[] = [];
            const dateFilter = {} as IDateFilter;

            expect(isPoPAvailable.resultFunc(dateBucketItemDateDatasetRefs, dateFilter)).toEqual(false);
        });

        it("should return false if dateBucketItemDateDatasetRefs is empty", () => {
            const dateBucketItemDateDatasetRefs: ObjRef[] = [];
            const dateFilter = {
                dateDatasetRef: {
                    uri: "date.bucket.ref.2",
                },
            } as IDateFilter;

            expect(isPoPAvailable.resultFunc(dateBucketItemDateDatasetRefs, dateFilter)).toEqual(false);
        });

        it("should return false if dateBucketItemDateDatasetRefs refs and filterDateDataset ref are not same", () => {
            const dateBucketItemDateDatasetRefs: ObjRef[] = [
                {
                    uri: "date.bucket.ref.1",
                },
            ];
            const dateFilter = {
                dateDatasetRef: {
                    uri: "date.bucket.ref.2",
                },
            } as IDateFilter;

            expect(isPoPAvailable.resultFunc(dateBucketItemDateDatasetRefs, dateFilter)).toEqual(false);
        });

        it("should return true if dateBucketItemDateDatasetRefs refs and filterDateDataset ref are same", () => {
            const dateBucketItemDateDatasetRefs: ObjRef[] = [
                {
                    uri: "date.bucket.ref.1",
                },
                {
                    uri: "date.bucket.ref.2",
                },
            ];
            const dateFilter = {
                dateDatasetRef: {
                    uri: "date.bucket.ref.2",
                },
            } as IDateFilter;

            expect(isPoPAvailable.resultFunc(dateBucketItemDateDatasetRefs, dateFilter)).toEqual(true);
        });
    });

    describe("isPoPSetup", () => {
        const dateFilterWithTimeComparison: IDateFilter = {
            type: "date",
            localIdentifier: "f1",
            dateDatasetRef: {
                uri: "date.bucket.ref.2",
            },
            filterConfig: {
                granularity: "GDC.time.year",
                interval: [-1, 0],
                type: "relative",
            },
            cacheItemIdentifier: "date.bucket.ref.2",
            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        };

        it("should return false if dateBucketItemDateDatasetRefs and filterDateDataset are empty", () => {
            expect(isPoPSetup.resultFunc([], undefined)).toEqual(false);
        });

        it("should return false if dateBucketItemDateDatasetRefs is empty", () => {
            expect(isPoPSetup.resultFunc([], dateFilterWithTimeComparison)).toEqual(false);
        });

        it("should return false if dateBucketItemDateDatasetRefs refs and filterDateDataset ref are not same", () => {
            const dateBucketItemDateDatasetRefs: ObjRef[] = [uriRef("date.bucket.ref.1")];
            expect(
                isPoPSetup.resultFunc(dateBucketItemDateDatasetRefs, dateFilterWithTimeComparison),
            ).toEqual(false);
        });

        it("should return true if dateBucketItemDateDatasetRefs refs and filterDateDataset ref are same", () => {
            const dateBucketItemDateDatasetRefs: ObjRef[] = [
                uriRef("date.bucket.ref.1"),
                uriRef("date.bucket.ref.2"),
            ];
            expect(
                isPoPSetup.resultFunc(dateBucketItemDateDatasetRefs, dateFilterWithTimeComparison),
            ).toEqual(true);
        });

        it("should return false if dateBucketItemDateDatasetRefs refs and filterDateDataset ref are same but time comparison is disabled", () => {
            const dateBucketItemDateDatasetRefs: ObjRef[] = [
                uriRef("date.bucket.ref.1"),
                uriRef("date.bucket.ref.2"),
            ];
            const filter: IDateFilter = {
                ...dateFilterWithTimeComparison,
                overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
            };
            expect(isPoPSetup.resultFunc(dateBucketItemDateDatasetRefs, filter)).toEqual(false);
        });
    });
});
