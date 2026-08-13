// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { MIN_SEGMENT_WIDTH_PCT, computeSegments } from "../timeline.js";
import type { IInteractionStepTile } from "../types.js";

function step(id: string, index: number, durationMs: number): IInteractionStepTile {
    return { stepId: id, index, durationMs, categories: [] };
}

describe("computeSegments", () => {
    it.each([0, -10])("should return no segments when totalMs is %i", (totalMs) => {
        expect(computeSegments([step("1", 0, 100)], totalMs)).toEqual([]);
    });

    it("should produce one segment per step, tagged with its stepId and index", () => {
        const steps = [step("a", 0, 500), step("b", 1, 500)];

        const segments = computeSegments(steps, 1000);

        expect(segments.map((s) => [s.stepId, s.stepIndex])).toEqual([
            ["a", 0],
            ["b", 1],
        ]);
    });

    it("should tile the segments so their widths sum to exactly 100%", () => {
        const steps = [step("1", 0, 200), step("2", 1, 300), step("3", 2, 500)];

        const segments = computeSegments(steps, 1000);
        const total = segments.reduce((sum, s) => sum + s.widthPct, 0);

        expect(total).toBeCloseTo(100);
    });

    it("should size segments proportionally to their duration", () => {
        const steps = [step("1", 0, 200), step("2", 1, 800)];

        const segments = computeSegments(steps, 1000);

        expect(segments[1].widthPct).toBeGreaterThan(segments[0].widthPct);
    });

    it("should floor a very short segment to at least the minimum visible width before rescaling", () => {
        const steps = [step("1", 0, 1), step("2", 1, 99999)];

        const rawFloor = MIN_SEGMENT_WIDTH_PCT;
        const segments = computeSegments(steps, 100000);
        const total = segments.reduce((sum, s) => sum + s.widthPct, 0);

        // After rescaling to sum to 100%, the short segment should still be close to visible —
        // not silently squeezed back to near zero by the rescale.
        expect(segments[0].widthPct).toBeGreaterThan(rawFloor * 0.5);
        expect(total).toBeCloseTo(100);
    });
});
