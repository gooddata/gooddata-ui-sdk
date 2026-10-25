// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ATTRIBUTE, COLUMNS, DATE, FACT, GEO_ATTRIBUTE, MEASURES, METRIC } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { initialState } from "../reducers/initial_state.js";
import { buildBucketItemMock } from "../tests/bucket_item.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IRawBucketItem } from "../typings/buckets.js";

import { BucketItemService } from "./bucket_item_service.js";

describe("BucketItemService", () => {
    const bucket1: IRawBucketItem = {
        localIdentifier: "bucket1",
        type: METRIC,
    };
    const bucket2: IRawBucketItem = {
        localIdentifier: "bucket2",
        type: FACT,
    };
    const attribute1: IRawBucketItem = {
        localIdentifier: "a1",
        filters: [],
        type: ATTRIBUTE,
    };
    const attribute2: IRawBucketItem = {
        localIdentifier: "a2",
        filters: [],
        type: ATTRIBUTE,
    };
    const attribute3: IRawBucketItem = {
        localIdentifier: "a3",
        filters: [],
        type: ATTRIBUTE,
    };
    const completeArithmeticMeasure: IRawBucketItem = buildBucketItemMock({
        localIdentifier: "CompleteArithmeticMeasure",
        type: METRIC,
        operandLocalIdentifiers: ["a", "b"],
    });
    const incompleteArithmeticMeasure: IRawBucketItem = buildBucketItemMock({
        localIdentifier: "IncompleteArithmeticMeasure",
        type: METRIC,
        operandLocalIdentifiers: [null, null],
    });
    const arithmeticMeasureWithOneOperand: IRawBucketItem = buildBucketItemMock({
        localIdentifier: "ArithmeticMeasureWithOneOperand",
        type: METRIC,
        operandLocalIdentifiers: ["a", null],
    });
    const measureWithAttributeFilter: IRawBucketItem = buildBucketItemMock({
        localIdentifier: "m1",
        type: METRIC,
        filters: [
            {
                selectedElements: [],
            },
        ],
    });
    const measureWithAppliedAttributeFilter: IRawBucketItem = buildBucketItemMock({
        localIdentifier: "m1",
        type: METRIC,
        filters: [
            {
                selectedElements: [
                    {
                        uri: "/m1/",
                        title: "Direct Sales",
                    },
                ],
            },
        ],
    });
    const measureWithDateFilter: IRawBucketItem = buildBucketItemMock({
        localIdentifier: "m1",
        type: METRIC,
        filters: [{ attribute: "attr.datedataset" }],
    });

    function getInitialState() {
        return withData(initialState, {
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [bucket1, bucket2],
                },
                {
                    localIdentifier: ATTRIBUTE,
                    items: [attribute1, attribute2, attribute3],
                },
                {
                    localIdentifier: MEASURES,
                    items: [bucket1, bucket2],
                },
            ],
        });
    }

    describe("getItemType", () => {
        it("should get item type from state", () => {
            const bucketId = "bucket1";
            const state = getInitialState();
            const result = BucketItemService.getItemType(state, bucketId);
            expect(result).toEqual(METRIC);
        });
    });

    describe("getBucketLocalIdentifier", () => {
        it("should get bucket local identifier from state", () => {
            const attributeId = "a2";
            const state = getInitialState();
            const result = BucketItemService.getBucketLocalIdentifier(state, attributeId);
            expect(result).toEqual(ATTRIBUTE);
        });
    });

    describe("isDateItem", () => {
        it("should return true when data data set is in attribute prop", () => {
            const result = BucketItemService.isDateItem(
                buildBucketItemMock({
                    attribute: DATE_DATASET_ATTRIBUTE,
                }),
            );
            expect(result).toBe(true);
        });

        it("should return true when data data set is in identifier prop", () => {
            const result = BucketItemService.isDateItem(
                buildBucketItemMock({
                    identifier: DATE_DATASET_ATTRIBUTE,
                }),
            );
            expect(result).toBe(true);
        });

        it("should return false when attribute and identifier props contains different values", () => {
            const result = BucketItemService.isDateItem(buildBucketItemMock({}));
            expect(result).toBe(false);
        });
    });

    describe("isMeasureItem", () => {
        it.each([
            [false, ATTRIBUTE],
            [true, METRIC],
            [true, FACT],
            [false, GEO_ATTRIBUTE],
            [false, DATE],
            [false, COLUMNS],
        ])("should return %s when bucket item type is %s", (result: boolean, type: string) => {
            expect(result).toBe(
                BucketItemService.isMeasureItem(
                    buildBucketItemMock({
                        type,
                    }),
                ),
            );
        });
    });

    describe("isAttributeItem", () => {
        it.each([
            [true, ATTRIBUTE],
            [false, METRIC],
            [false, FACT],
            [false, GEO_ATTRIBUTE],
            [false, DATE],
            [false, COLUMNS],
        ])("should return %s when bucket item type is %s", (result: boolean, type: string) => {
            expect(result).toBe(
                BucketItemService.isAttributeItem(
                    buildBucketItemMock({
                        type,
                    }),
                ),
            );
        });
    });

    describe("isCompleteBucketItem", () => {
        it.each([
            [true, "complete arithmetic measure", completeArithmeticMeasure],
            [false, "incomplete arithmetic measure", incompleteArithmeticMeasure],
            [false, "arithmetic measure with one operand", arithmeticMeasureWithOneOperand],
            [true, "not arithmetic measure", bucket2],
        ])(
            "should return %s when bucket item is %s",
            (result: boolean, _desc, bucketItem: IRawBucketItem) => {
                expect(BucketItemService.isCompleteBucketItem(bucketItem)).toEqual(result);
            },
        );
    });

    describe("hasFiltersSetUp", () => {
        it.each([
            [false, "bucket item is not an attribute", attribute1],
            [false, "bucket item is a measure without any filters", bucket1],
            [false, "bucket item is a measure with not applied filter (ALL)", measureWithAttributeFilter],
            [true, "bucket item is a measure with applied filter", measureWithAppliedAttributeFilter],
            [true, "bucket item is a measure with date filter", measureWithDateFilter],
        ])("should return %s when %s", (result: boolean, _desc, bucketItem: IRawBucketItem) => {
            expect(BucketItemService.hasFiltersSetUp(bucketItem)).toEqual(result);
        });
    });
});
