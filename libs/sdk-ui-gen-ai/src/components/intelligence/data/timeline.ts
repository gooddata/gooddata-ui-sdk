// (C) 2026 GoodData Corporation

import type { IInteractionStepTile, ITimelineSegment } from "./types.js";

/**
 * Floor applied to a segment's share of the track, in percent, before the widths are normalized
 * back to 100% — so a very short step (e.g. 0.1s within a 13.6s turn) keeps a visible sliver
 * instead of collapsing next to the long ones. It is a floor on the raw share, not a guarantee
 * about the final width: past 100 segments the normalization has to scale everything below it,
 * since 100 x 1% already fills the track.
 * @internal
 */
export const MIN_SEGMENT_WIDTH_PCT = 1;

/**
 * Computes one segment per step, tiling the entire turn `[0, totalMs]` in step order. Both the
 * list view and every category's detail view render this same sequence, highlighting only the
 * tile(s) at the step indexes relevant to what's currently shown.
 * @internal
 */
export function computeSegments(steps: IInteractionStepTile[], totalMs: number): ITimelineSegment[] {
    if (totalMs <= 0) {
        return [];
    }

    const rawWidths = steps.map((step) => Math.max((step.durationMs / totalMs) * 100, MIN_SEGMENT_WIDTH_PCT));
    const widths = normalizeToTotal(rawWidths, 100);

    return steps.map((step, index) => ({
        stepId: step.stepId,
        stepIndex: step.index,
        widthPct: widths[index],
    }));
}

/**
 * Rescales a list of positive weights so they sum exactly to `target`, preserving their
 * relative proportions. Used so segment widths tile the track exactly to 100% even after the
 * per-segment minimum-width floor would otherwise make them overshoot or undershoot it.
 */
function normalizeToTotal(weights: number[], target: number): number[] {
    const sum = weights.reduce((total, weight) => total + weight, 0);
    if (sum <= 0) {
        return weights;
    }
    return weights.map((weight) => (weight / sum) * target);
}
