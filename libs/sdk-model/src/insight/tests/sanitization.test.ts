// (C) 2020 GoodData Corporation
import { describe, expect, it } from "vitest";
import { insightSanitize } from "../sanitization.js";
import { newTotal, ITotal } from "../../execution/base/totals.js";
import { newMeasureSort, newAttributeSort, ISortItem } from "../../execution/base/sort.js";
import { newInsightDefinition } from "../factory.js";
import { bucketTotals, newBucket } from "../../execution/buckets/index.js";
import { insightBucket } from "../index.js";
import { Account, ActivityType, Department, Velocity, Won } from "../../../__mocks__/model.js";

describe("insightSanitize", () => {
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
    `("should $name", ({ sorts, totals, expected }) => {
        const insight = getInsight(totals, sorts);
        const sanitized = insightSanitize(insight);
        const resultTotals = bucketTotals(insightBucket(sanitized, "attributes")!);
        expect(resultTotals).toEqual(expected);
    });

    it("should handle all buckets except columns bucket", () => {
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

        const sanitized = insightSanitize(insight);
        const attributesTotals = bucketTotals(insightBucket(sanitized, "attributes")!);
        const attributes2Totals = bucketTotals(insightBucket(sanitized, "attributes2")!);
        const columnsTotals = bucketTotals(insightBucket(sanitized, "columns")!);

        expect(attributesTotals).toEqual([grandTotal]);
        expect(attributes2Totals).toEqual([grandTotal]);
        expect(columnsTotals).toEqual([grandTotal, a2m1SubtotalSum, a3SubtotalSum]);
    });
});
