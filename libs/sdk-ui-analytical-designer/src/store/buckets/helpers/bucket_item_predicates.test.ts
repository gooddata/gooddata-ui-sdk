// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    ATTRIBUTE,
    COLUMNS,
    DATE,
    MEASURES,
    METRIC,
    SEGMENT,
    STACK,
    TREND,
    VIEW,
} from "../../../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../../../models/date_item.js";
import { type IRawBucketItem, type IRawBuckets } from "../../../typings/buckets.js";

import {
    areBucketsEmpty,
    containsDateBucketItem,
    containsMetricWithDateFilter,
    isCategoriesOrStacks,
    isDateBucketItem,
    isDateItem,
    isOperandInArithmeticMeasure,
} from "./bucket_item_predicates.js";

/**
 * Each predicate is exercised in BOTH container modes, because that is the whole point of the
 * extraction: 4.10 flips the buckets subtree to plain values and every one of these has to answer
 * identically before and after. `raw` wraps a fixture the way the state holds it today, `plain`
 * leaves it as the state will hold it after the flip.
 */
const raw = <T>(value: T): T => value;
const plain = <T>(value: T): T => value;
const bothModes: Array<[string, <T>(value: T) => T]> = [
    ["raw", raw],
    ["plain", plain],
];

describe("isCategoriesOrStacks", () => {
    it.each([
        [VIEW, true],
        [ATTRIBUTE, true],
        [STACK, true],
        [TREND, true],
        [SEGMENT, true],
        [COLUMNS, true],
        [MEASURES, false],
        ["secondary_measures", false],
        ["", false],
    ])("answers %s with %s", (localIdentifier: string, expected: boolean) => {
        expect(isCategoriesOrStacks(localIdentifier)).toBe(expected);
    });
});

describe.each(bothModes)("isDateItem (%s items)", (_mode: string, wrap) => {
    it("recognizes the date dataset attribute under `attribute`", () => {
        expect(isDateItem(wrap({ attribute: DATE_DATASET_ATTRIBUTE }))).toBe(true);
    });

    it("recognizes the date dataset attribute under `identifier`", () => {
        expect(isDateItem(wrap({ identifier: DATE_DATASET_ATTRIBUTE }))).toBe(true);
    });

    it("rejects an ordinary attribute item", () => {
        expect(isDateItem(wrap({ attribute: "attr.region", identifier: "attr.region" }))).toBe(false);
    });

    it("rejects an item carrying neither key", () => {
        expect(isDateItem(wrap({ localIdentifier: "m1" }))).toBe(false);
    });

    it("does NOT look at the item type - that is isDateBucketItem's job", () => {
        expect(isDateItem(wrap({ type: DATE }))).toBe(false);
    });
});

describe.each(bothModes)("isDateBucketItem (%s items)", (_mode: string, wrap) => {
    it.each([
        ["the date type", { type: DATE }, true],
        ["the date dataset attribute", { attribute: DATE_DATASET_ATTRIBUTE }, true],
        ["a metric", { type: METRIC }, false],
        ["an ordinary attribute", { type: ATTRIBUTE, attribute: "attr.region" }, false],
        ["nothing identifying at all", { localIdentifier: "x" }, false],
    ])("answers %s with %s", (_name: string, item: IRawBucketItem, expected: boolean) => {
        expect(isDateBucketItem(wrap(item))).toBe(expected);
    });
});

describe.each(bothModes)("containsDateBucketItem (%s item lists)", (_mode: string, wrap) => {
    it("finds a date item anywhere in the list", () => {
        expect(
            containsDateBucketItem(
                wrap([{ attribute: "attr.region" }, { attribute: DATE_DATASET_ATTRIBUTE }]),
            ),
        ).toBe(true);
    });

    it("answers false for a list without one", () => {
        expect(containsDateBucketItem(wrap([{ attribute: "attr.region" }]))).toBe(false);
    });

    it("answers false for an empty list", () => {
        expect(containsDateBucketItem(wrap([]))).toBe(false);
    });

    it("answers false when called with nothing at all", () => {
        expect(containsDateBucketItem()).toBe(false);
    });
});

describe.each(bothModes)("containsMetricWithDateFilter (%s metrics)", (_mode: string, wrap) => {
    it("finds a metric whose filters include a date filter", () => {
        expect(
            containsMetricWithDateFilter(
                wrap([
                    { localIdentifier: "m1", filters: [] },
                    { localIdentifier: "m2", filters: [{ attribute: DATE_DATASET_ATTRIBUTE }] },
                ]),
            ),
        ).toBe(true);
    });

    it("answers false when no metric carries a date filter", () => {
        expect(
            containsMetricWithDateFilter(
                wrap([{ localIdentifier: "m1", filters: [{ attribute: "attr.region" }] }]),
            ),
        ).toBe(false);
    });

    it("answers false for an empty metric list and for no argument", () => {
        expect(containsMetricWithDateFilter(wrap([]))).toBe(false);
        expect(containsMetricWithDateFilter()).toBe(false);
    });

    it("throws for a metric with no filters key, exactly as before the extraction", () => {
        expect(() => containsMetricWithDateFilter(wrap([{ localIdentifier: "m1" }]))).toThrow();
    });
});

describe("areBucketsEmpty", () => {
    it.each([
        ["raw buckets, all empty", [{ items: [] }, { items: [] }], true],
        ["raw buckets, one filled", [{ items: [] }, { items: [{ localIdentifier: "m1" }] }], false],
        ["raw, no buckets at all", [], true],
        ["plain buckets, all empty", [{ items: [] }, { items: [] }], true],
        ["plain buckets, one filled", [{ items: [] }, { items: [{ localIdentifier: "m1" }] }], false],
        ["plain, no buckets at all", [], true],
        ["plain bucket with an empty items list", [{ items: [] }], true],
        ["plain bucket with a filled items list", [{ items: [{}] }], false],
        ["plain bucket with no items key", [{ localIdentifier: MEASURES }], true],
    ])("answers %s with %s", (_name: string, buckets: IRawBuckets, expected: boolean) => {
        expect(areBucketsEmpty(buckets)).toBe(expected);
    });

    it("treats a hole in the bucket list as empty instead of throwing", () => {
        // deliberate widening: a hole in the buckets array contributes no items rather than
        // throwing.
        expect(areBucketsEmpty([undefined, { items: [] }])).toBe(true);
        expect(areBucketsEmpty([null, { items: [{ localIdentifier: "m1" }] }])).toBe(false);
    });
});

describe.each(bothModes)("isOperandInArithmeticMeasure (%s items)", (_mode: string, wrap) => {
    const operand = (localIdentifier: string) => wrap({ localIdentifier, type: METRIC });

    it("recognizes an operand of the arithmetic measure", () => {
        const arithmetic = wrap({
            localIdentifier: "am1",
            type: METRIC,
            operandLocalIdentifiers: ["m1", "m2"],
        });

        expect(isOperandInArithmeticMeasure(operand("m1"), arithmetic)).toBe(true);
        expect(isOperandInArithmeticMeasure(operand("m2"), arithmetic)).toBe(true);
    });

    it("rejects a measure that is not an operand of it", () => {
        const arithmetic = wrap({
            localIdentifier: "am1",
            type: METRIC,
            operandLocalIdentifiers: ["m1", "m2"],
        });

        expect(isOperandInArithmeticMeasure(operand("m3"), arithmetic)).toBe(false);
    });

    it("rejects when the second item is not an arithmetic measure at all", () => {
        expect(
            isOperandInArithmeticMeasure(operand("m1"), wrap({ localIdentifier: "m2", type: METRIC })),
        ).toBe(false);
    });

    it("recognizes an operand of a half-filled arithmetic measure", () => {
        const arithmetic = wrap({
            localIdentifier: "am1",
            type: METRIC,
            operandLocalIdentifiers: ["m1", null],
        });

        expect(isOperandInArithmeticMeasure(operand("m1"), arithmetic)).toBe(true);
        expect(isOperandInArithmeticMeasure(operand("m2"), arithmetic)).toBe(false);
    });
});
