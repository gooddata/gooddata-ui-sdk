// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IInsightDefinition,
    insightBuckets,
    newBucket,
    newInsightDefinition,
    newTotal,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { applyTotalsOverride, getChangedTotals } from "./totalsHelpers.js";

function insightWithTotals(attributeTotals: ReturnType<typeof newTotal>[]): IInsightDefinition {
    return newInsightDefinition("local:table", (b) =>
        b.buckets([newBucket(BucketNames.ATTRIBUTE, ...attributeTotals), newBucket(BucketNames.COLUMNS)]),
    );
}

describe("applyTotalsOverride", () => {
    it("should return the insight unchanged when there is no override", () => {
        const insight = insightWithTotals([newTotal("sum", "m1", "a1")]);

        expect(applyTotalsOverride(insight, undefined)).toBe(insight);
    });

    it("should replace the totals of the bucket named by the override, leaving other buckets untouched", () => {
        const original = newTotal("sum", "m1", "a1");
        const renamed = newTotal("sum", "m1", "a1", "Custom label");
        const insight = insightWithTotals([original]);

        const result = applyTotalsOverride(insight, { attribute: [renamed] });

        expect(insightBuckets(result, BucketNames.ATTRIBUTE)[0].totals).toEqual([renamed]);
        expect(insightBuckets(result, BucketNames.COLUMNS)[0].totals).toBeUndefined();
    });

    it("should not mutate the original insight", () => {
        const original = newTotal("sum", "m1", "a1");
        const renamed = newTotal("sum", "m1", "a1", "Custom label");
        const insight = insightWithTotals([original]);

        applyTotalsOverride(insight, { attribute: [renamed] });

        expect(insightBuckets(insight, BucketNames.ATTRIBUTE)[0].totals).toEqual([original]);
    });

    it("should ignore an override key that does not match any bucket's localIdentifier", () => {
        const original = newTotal("sum", "m1", "a1");
        const insight = insightWithTotals([original]);

        const result = applyTotalsOverride(insight, { nonExistentBucket: [newTotal("avg", "m1", "a1")] });

        expect(insightBuckets(result, BucketNames.ATTRIBUTE)[0].totals).toEqual([original]);
    });

    it("should not reintroduce a total that was removed from the insight after the override was captured", () => {
        // The override was captured with this total present; the insight was later edited (e.g. in
        // AD) to drop it entirely - a wholesale replacement would resurrect it referencing a
        // measure/attribute pairing that may no longer even exist.
        const renamed = newTotal("sum", "m1", "a1", "Custom label");
        const insight = insightWithTotals([]);

        const result = applyTotalsOverride(insight, { attribute: [renamed] });

        expect(insightBuckets(result, BucketNames.ATTRIBUTE)[0].totals).toEqual([]);
    });

    it("should not drop a total the insight gained after the override was captured", () => {
        // The override only knows about "first" (captured at rename time); "second" was added to
        // the insight afterwards and must survive untouched, keeping its own alias.
        const first = newTotal("sum", "m1", "a1", "Renamed first");
        const second = newTotal("avg", "m2", "a1", "Own alias");
        const insight = insightWithTotals([first, second]);

        const result = applyTotalsOverride(insight, { attribute: [first] });

        expect(insightBuckets(result, BucketNames.ATTRIBUTE)[0].totals).toEqual([first, second]);
    });

    it("should clear the alias on a currently-matching total when the override total has none, without touching non-matching totals", () => {
        const resetTarget = newTotal("sum", "m1", "a1", "Stale alias");
        const untouched = newTotal("avg", "m2", "a1", "Keep me");
        const insight = insightWithTotals([resetTarget, untouched]);

        const result = applyTotalsOverride(insight, { attribute: [newTotal("sum", "m1", "a1")] });

        expect(insightBuckets(result, BucketNames.ATTRIBUTE)[0].totals).toEqual([
            newTotal("sum", "m1", "a1"),
            untouched,
        ]);
    });
});

describe("getChangedTotals", () => {
    it("keeps only the total whose alias differs from the current one, dropping untouched totals", () => {
        const current = [newTotal("sum", "m1", "a1"), newTotal("avg", "m2", "a1", "Own alias")];
        const renamed = newTotal("sum", "m1", "a1", "Renamed");
        const untouched = newTotal("avg", "m2", "a1", "Own alias");

        expect(getChangedTotals([renamed, untouched], current)).toEqual([renamed]);
    });

    it("keeps a total whose alias was reset relative to the current one", () => {
        const current = [newTotal("sum", "m1", "a1", "Was Custom")];
        const reset = newTotal("sum", "m1", "a1");

        expect(getChangedTotals([reset], current)).toEqual([reset]);
    });

    it("keeps a total that has no match in currentTotals (e.g. current was empty at persist time)", () => {
        const renamed = newTotal("sum", "m1", "a1", "Renamed");

        expect(getChangedTotals([renamed], [])).toEqual([renamed]);
    });

    it("returns an empty array when nothing changed", () => {
        const current = [newTotal("sum", "m1", "a1", "Same")];
        const unchanged = newTotal("sum", "m1", "a1", "Same");

        expect(getChangedTotals([unchanged], current)).toEqual([]);
    });
});
