// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { Account, ActivityType, Department, Velocity, Won } from "../../__mocks__/model.js";
import { type ISortItem, newAttributeSort, newMeasureSort } from "../execution/base/sort.js";
import { type ITotal, newTotal } from "../execution/base/totals.js";
import { bucketTotals, newBucket } from "../execution/buckets/index.js";

import { newInsightDefinition } from "./factory.js";
import { insightBucket, insightSorts } from "./index.js";
import { insightSanitize, sanitizeBucketTotals } from "./sanitization.js";

describe("total sanitization", () => {
    const m1 = Won;
    const m2 = Velocity.Sum;

    const a1 = Account.Default;
    const a2 = ActivityType;
    const a3 = Department;

    const grandTotal = newTotal("sum", m1, a1);
    const a2m1SubtotalSum = newTotal("sum", m1, a2);
    const a2m1SubtotalMax = newTotal("max", m1, a2);
    const a2m2SubtotalSum = newTotal("sum", m2, a2);
    const a3SubtotalSum = newTotal("sum", m1, a3);

    const m1SortItem = newMeasureSort(m1, "asc");

    const a1SortItem = newAttributeSort(a1, "asc");
    const a2SortItem = newAttributeSort(a2, "asc");

    const getInsight = (totals: ITotal[], sorts: ISortItem[]) => {
        return newInsightDefinition("foo", (m) =>
            m
                .buckets([newBucket("measures", m1, m2), newBucket("attributes", a1, a2, a3, ...totals)])
                .sorts(sorts),
        );
    };

    it.each`
        name                                                                     | totals                                | sorts           | expected
        ${"not remove grandtotal when sorted on different than first attribute"} | ${[grandTotal]}                       | ${[a2SortItem]} | ${[grandTotal]}
        ${"not remove grandtotal while removing subtotals"}                      | ${[grandTotal, a2m1SubtotalSum]}      | ${[a2SortItem]} | ${[grandTotal]}
        ${"not remove subtotals when sort is not in properties"}                 | ${[a2m1SubtotalSum]}                  | ${[]}           | ${[a2m1SubtotalSum]}
        ${"not remove subtotals if sorted on first attribute"}                   | ${[a2m1SubtotalSum]}                  | ${[a1SortItem]} | ${[a2m1SubtotalSum]}
        ${"remove subtotals if sorted on different than first attribute"}        | ${[a2m1SubtotalSum]}                  | ${[a2SortItem]} | ${[]}
        ${"remove multiple subtotals"}                                           | ${[a2m1SubtotalSum, a3SubtotalSum]}   | ${[a2SortItem]} | ${[]}
        ${"remove subtotals if sorted on any measure"}                           | ${[a2m1SubtotalSum]}                  | ${[m1SortItem]} | ${[]}
        ${"remove all subtotal of same type"}                                    | ${[a2m1SubtotalSum, a2m2SubtotalSum]} | ${[a2SortItem]} | ${[]}
        ${"remove all subtotal of different type"}                               | ${[a2m1SubtotalSum, a2m1SubtotalMax]} | ${[a2SortItem]} | ${[]}
    `("sanitizeBucketTotals should $name", ({ sorts, totals, expected }) => {
        const insight = getInsight(totals, sorts);
        const resultTotals = sanitizeBucketTotals(insightBucket(insight, "attributes")!, sorts);
        expect(resultTotals).toEqual(expected);
    });

    it("sanitizeBucketTotals should handle all buckets except columns bucket", () => {
        const insight = newInsightDefinition("foo", (m) =>
            m
                .buckets([
                    newBucket("measures", m1, m2),
                    newBucket("attributes", a1, a2, a3, grandTotal, a2m1SubtotalSum, a3SubtotalSum),
                    newBucket("attributes2", a1, a2, a3, grandTotal, a2m1SubtotalSum, a3SubtotalSum),
                    newBucket("columns", a1, a2, a3, grandTotal, a2m1SubtotalSum, a3SubtotalSum),
                ])
                .sorts([a2SortItem]),
        );

        const attributesTotals = sanitizeBucketTotals(insightBucket(insight, "attributes")!, [a2SortItem]);
        const attributes2Totals = sanitizeBucketTotals(insightBucket(insight, "attributes2")!, [a2SortItem]);
        const columnsTotals = sanitizeBucketTotals(insightBucket(insight, "columns")!, [a2SortItem]);

        expect(attributesTotals).toEqual([grandTotal]);
        expect(attributes2Totals).toEqual([grandTotal]);
        expect(columnsTotals).toEqual([grandTotal, a2m1SubtotalSum, a3SubtotalSum]);
    });

    it.each([
        ["first attribute", [a1SortItem]],
        ["later attribute", [a2SortItem]],
        ["measure", [m1SortItem]],
        ["multiple columns", [a1SortItem, a2SortItem]],
        ["no sort", []],
    ] as const)("insightSanitize preserves totals and %s sorting for saving", (_name, sorts) => {
        const totals = [grandTotal, a2m1SubtotalSum, a2m1SubtotalMax, a2m2SubtotalSum, a3SubtotalSum];
        const insight = getInsight(totals, [...sorts]);

        const sanitized = insightSanitize(insight);

        expect(bucketTotals(insightBucket(sanitized, "attributes")!)).toEqual(totals);
        expect(insightSorts(sanitized)).toEqual(sorts);
        expect(insight).toEqual(getInsight(totals, [...sorts]));
    });

    it("insightSanitize still removes totals referencing a missing attribute", () => {
        const insight = getInsight(
            [grandTotal, a2m1SubtotalSum, newTotal("sum", m1, "missing")],
            [a2SortItem],
        );

        const sanitized = insightSanitize(insight);

        expect(bucketTotals(insightBucket(sanitized, "attributes")!)).toEqual([grandTotal, a2m1SubtotalSum]);
        expect(bucketTotals(insightBucket(insight, "attributes")!)).toHaveLength(3);
    });

    it.each([{ sorts: [] }, { sorts: [a2SortItem] }, { sorts: [m1SortItem] }])(
        "insightSanitize removes totals referencing attributes in another bucket with sorts $sorts",
        ({ sorts }) => {
            const insight = newInsightDefinition("foo", (m) =>
                m
                    .buckets([
                        newBucket("measures", m1, m2),
                        newBucket("attributes", a1, grandTotal, a2m1SubtotalSum),
                        newBucket("columns", a2, a3, grandTotal, a2m1SubtotalSum, a3SubtotalSum),
                    ])
                    .sorts(sorts),
            );

            const sanitized = insightSanitize(insight);

            expect(bucketTotals(insightBucket(sanitized, "attributes")!)).toEqual([grandTotal]);
            expect(bucketTotals(insightBucket(sanitized, "columns")!)).toEqual([
                a2m1SubtotalSum,
                a3SubtotalSum,
            ]);
            expect(bucketTotals(insightBucket(insight, "attributes")!)).toHaveLength(2);
            expect(bucketTotals(insightBucket(insight, "columns")!)).toHaveLength(3);
        },
    );
});
