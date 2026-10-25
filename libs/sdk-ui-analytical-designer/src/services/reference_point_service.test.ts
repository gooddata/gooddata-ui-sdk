// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { ATTRIBUTE, FILTERS, MEASURES, METRIC, VIEW } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { initialState } from "../reducers/initial_state.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import { type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IRefPointFiltersBucket } from "../store/reference_point/reference_point_state.js";
import {
    DATE_FILTER_DATASET_REF,
    buildAttributeFilterMock,
    buildDateFilterMock,
    filtersMock,
    rankingFilterWithAttributes,
    rankingFilterWithoutAttributes,
} from "../tests/filter.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IRawBucketItem } from "../typings/buckets.js";
import { type IBucket } from "../typings/state_objects.js";

import { stateWithMasterAndDerivedMeasuresInRefPoint } from "./decorated_buckets_service.test.helpers.js";
import {
    convertFiltersToRefPoint,
    getRefPointBuckets,
    getRefPointDerivedMeasures,
    getRefPointFilteredMeasures,
    getRefPointFilters,
    getRefPointNonDerivedMeasures,
} from "./reference_point_service.js";

const bucketsMeta = (partial: Partial<IBucketsMetaState>): IBucketsMetaState => ({
    autoCreated: {},
    modified: {},
    collapsed: {},
    ...partial,
});
const emptyBucketsMeta = bucketsMeta({});

describe("referencePointService", () => {
    describe("getRefPointBuckets", () => {
        it("should return buckets from reference point in state", () => {
            const measures = [
                {
                    attribute: "m1",
                    localIdentifier: "m1",
                    aggregation: "sum",
                    type: METRIC,
                },
                {
                    attribute: "m2",
                    localIdentifier: "m2",
                    showInPercent: true,
                    type: METRIC,
                },
            ];

            const buckets = [
                {
                    localIdentifier: MEASURES,
                    items: measures,
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ];

            const state = withData(initialState, {
                referencePoint: { ...initialState.data.referencePoint, buckets: buckets },
            });

            expect(getRefPointBuckets(state)).toEqual(buckets);
        });
    });

    describe("getRefPointFilters", () => {
        it("should return reference point filters", () => {
            const bucket: IBucket = {
                localIdentifier: FILTERS,
                items: [],
                totals: [],
            };
            const state = withData(initialState, {
                referencePoint: {
                    ...initialState.data.referencePoint,
                    filters: bucket as unknown as IRefPointFiltersBucket,
                },
            });
            expect(getRefPointFilters(state)).toEqual(bucket);
            expect(getRefPointFilters(state)).toBe(bucket);
        });
    });

    describe("getRefPointFilteredMeasures", () => {
        it("should return measure when filter matches", () => {
            const localIdentifier = "m0";
            const master = getRefPointFilteredMeasures(
                stateWithMasterAndDerivedMeasuresInRefPoint,
                (bucketItem: IRawBucketItem) => bucketItem?.localIdentifier === localIdentifier,
            );

            expect(master).toHaveLength(1);
            expect(master[0]).toMatchObject(
                expect.objectContaining({
                    localIdentifier,
                }),
            );
        });

        it("should return no measure when filter does not match", () => {
            const master = getRefPointFilteredMeasures(
                stateWithMasterAndDerivedMeasuresInRefPoint,
                (bucketItem: IRawBucketItem) => bucketItem?.localIdentifier === "foo",
            );

            expect(master).toHaveLength(0);
        });

        it("should not return attribute even when filter matches", () => {
            const localIdentifier = "a0";
            const stateWithAttribute = withData(initialState, {
                referencePoint: {
                    ...initialState.data.referencePoint,
                    buckets: [
                        {
                            items: [
                                {
                                    id: "foo",
                                    localIdentifier,
                                    type: ATTRIBUTE,
                                },
                            ],
                        },
                    ],
                },
            });
            const master = getRefPointFilteredMeasures(
                stateWithAttribute,
                (bucketItem) => bucketItem?.localIdentifier === localIdentifier,
            );

            expect(master).toHaveLength(0);
        });
    });

    describe("getRefPointNonDerivedMeasures", () => {
        it("should return non-derived measures from all decorated buckets", () => {
            const nonDerivedMeasures = getRefPointNonDerivedMeasures(
                stateWithMasterAndDerivedMeasuresInRefPoint,
            );

            expect(nonDerivedMeasures).toHaveLength(8);
            expect(nonDerivedMeasures[0]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "m0",
                    type: "metric",
                }),
            );
            expect(nonDerivedMeasures[1]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "m1",
                    type: "metric",
                }),
            );
            expect(nonDerivedMeasures[2]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "am1",
                }),
            );
            expect(nonDerivedMeasures[3]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "m2",
                    type: "metric",
                }),
            );
            expect(nonDerivedMeasures[4]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "m3",
                    type: "metric",
                    aggregation: "COUNT",
                }),
            );
            expect(nonDerivedMeasures[5]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "am2",
                }),
            );
            expect(nonDerivedMeasures[6]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "am3",
                }),
            );
            expect(nonDerivedMeasures[7]).toMatchObject(
                expect.objectContaining({
                    localIdentifier: "am4",
                }),
            );
        });
    });

    describe("getRefPointDerivedMeasures", () => {
        it("should return derived measures from all decorated buckets", () => {
            const derived = getRefPointDerivedMeasures(stateWithMasterAndDerivedMeasuresInRefPoint);

            expect(derived).toHaveLength(4);
            expect(derived[0].localIdentifier).toEqual("m1_pop");
            expect(derived[1].localIdentifier).toEqual("m2_pop");
            expect(derived[2].localIdentifier).toEqual("m3_pop");
            expect(derived[3].localIdentifier).toEqual("am5");
        });
    });

    describe("convertFiltersToRefPoint", () => {
        it("should convert without filters", () => {
            const result = convertFiltersToRefPoint([], emptyBucketsMeta);

            expect(result).toEqual({
                items: [],
                localIdentifier: "filters",
            });
        });

        it("should convert date filter", () => {
            const DATE_FILTER: IFilter = buildDateFilterMock({
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                localIdentifier: "date.localId",
            });

            const BUCKET_META: IBucketsMetaState = bucketsMeta({
                autoCreated: {
                    DATE_DATASET_ATTRIBUTE: false,
                },
                modified: {
                    DATE_DATASET_ATTRIBUTE: false,
                },
            });

            const result = convertFiltersToRefPoint([DATE_FILTER], BUCKET_META);

            expect(result.items).toEqual([
                {
                    autoCreated: false,
                    attribute: DATE_DATASET_ATTRIBUTE,
                    localIdentifier: "date.localId",
                    filters: [
                        {
                            overTimeComparisonType: "nothing",
                            interval: {
                                name: "all_time",
                            },
                            attribute: DATE_DATASET_ATTRIBUTE,
                        },
                    ],
                    dateDatasetRef: DATE_FILTER_DATASET_REF,
                },
            ]);
        });

        it("should convert attribute filters", () => {
            const COUNTRY_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
                cacheItemIdentifier: "attr.country.id",
                localIdentifier: "country.localId",
                displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                filterConfig: {
                    selectedElements: [
                        {
                            title: "title1",
                            uri: "uri1",
                        },
                        {
                            title: "title2",
                            uri: "uri2",
                        },
                    ],
                    isInverted: false,
                    totalElementsCount: 5,
                },
            });

            const PRODUCT_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
                cacheItemIdentifier: "attr.product.id",
                localIdentifier: "product.localId",
            });

            const BUCKET_META: IBucketsMetaState = bucketsMeta({
                autoCreated: {
                    "attr.country.id": true,
                    "attr.product.id": false,
                },
                modified: {
                    "attr.country.id": false,
                    "attr.product.id": true,
                },
            });

            const result = convertFiltersToRefPoint(
                [COUNTRY_ATTRIBUTE_FILTER, PRODUCT_ATTRIBUTE_FILTER],
                BUCKET_META,
            );

            expect(result.items).toEqual([
                {
                    autoCreated: true,
                    attribute: "attr.country.id",
                    localIdentifier: "country.localId",
                    filters: [
                        {
                            attribute: "attr.country.id",
                            displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
                            allElements: [],
                            selectedElements: [
                                {
                                    title: "title1",
                                    uri: "uri1",
                                },
                                {
                                    title: "title2",
                                    uri: "uri2",
                                },
                            ],
                            isInverted: false,
                            totalElementsCount: 5,
                            noData: undefined,
                        },
                    ],
                },
                {
                    autoCreated: false,
                    attribute: "attr.product.id",
                    localIdentifier: "product.localId",
                    filters: [],
                },
            ]);
        });

        it("should convert measure value filters", () => {
            const COMPARISON_MEASURE_VALUE_FILTER: IFilter = filtersMock[2];
            const RANGE_MEASURE_VALUE_FILTER: IFilter = filtersMock[3];
            const EMPTY_MEASURE_VALUE_FILTER: IFilter = filtersMock[4];

            const result = convertFiltersToRefPoint(
                [COMPARISON_MEASURE_VALUE_FILTER, RANGE_MEASURE_VALUE_FILTER, EMPTY_MEASURE_VALUE_FILTER],
                emptyBucketsMeta,
            );

            expect(result.items).toEqual([
                {
                    autoCreated: false,
                    localIdentifier: "f1",
                    filters: [
                        {
                            measureLocalIdentifier: "m1",
                            conditions: [
                                {
                                    comparison: {
                                        operator: "GREATER_THAN",
                                        value: 12,
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    autoCreated: false,
                    localIdentifier: "f2",
                    filters: [
                        {
                            measureLocalIdentifier: "m2",
                            conditions: [
                                {
                                    range: {
                                        operator: "BETWEEN",
                                        from: 12,
                                        to: 14,
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    autoCreated: false,
                    localIdentifier: "f3",
                    filters: [
                        {
                            measureLocalIdentifier: "m3",
                        },
                    ],
                },
            ]);
        });
    });

    it("should convert ranking filters", () => {
        const result = convertFiltersToRefPoint(
            [rankingFilterWithoutAttributes, rankingFilterWithAttributes],
            emptyBucketsMeta,
        );
        expect(result.items).toMatchSnapshot();
    });
});
