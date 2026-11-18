// (C) 2026 GoodData Corporation

/**
 * Bar geometry of the execution progress panel. Adapted from the gen-ai interaction timeline
 * (sdk-ui-gen-ai components/intelligence/data/timeline.ts): a floor keeps very short items visible
 * next to the long ones.
 */

/** Floor of an item's share of the track, in percent. */
export const MIN_BAR_WIDTH_PCT = 1.5;

export interface ITimedItem {
    id: string;
    startedAt?: number;
    /** absent while running: the bar grows up to `now` */
    finishedAt?: number;
}

export interface ITimelineSegment {
    id: string;
    widthPct: number;
}

export interface IGanttBar {
    id: string;
    offsetPct: number;
    widthPct: number;
}

/**
 * One segment per item, tiling the whole track in order (the overall step timeline). Items that
 * have not started get no segment.
 */
export function computeSegments(items: ITimedItem[], now: number): ITimelineSegment[] {
    const timed = items.filter((item) => item.startedAt !== undefined);
    const durations = timed.map((item) => Math.max((item.finishedAt ?? now) - item.startedAt!, 0));
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    if (total <= 0) {
        return timed.map((item) => ({ id: item.id, widthPct: 100 / timed.length }));
    }
    const widths = normalizeToTotal(
        durations.map((duration) => Math.max((duration / total) * 100, MIN_BAR_WIDTH_PCT)),
        100,
    );
    return timed.map((item, index) => ({ id: item.id, widthPct: widths[index] }));
}

/**
 * One bar per item placed on the shared time span `[spanStart, spanEnd]` — the parallel data
 * source queries of a federated execution.
 */
export function computeGanttBars(items: ITimedItem[], spanStart: number, spanEnd: number): IGanttBar[] {
    const span = Math.max(spanEnd - spanStart, 1);
    return items
        .filter((item) => item.startedAt !== undefined)
        .map((item) => {
            const start = Math.min(Math.max(item.startedAt! - spanStart, 0), span);
            const end = Math.min(Math.max((item.finishedAt ?? spanEnd) - spanStart, start), span);
            const offsetPct = (start / span) * 100;
            const widthPct = Math.min(
                Math.max(((end - start) / span) * 100, MIN_BAR_WIDTH_PCT),
                100 - offsetPct,
            );
            return { id: item.id, offsetPct, widthPct };
        });
}

function normalizeToTotal(weights: number[], target: number): number[] {
    const sum = weights.reduce((total, weight) => total + weight, 0);
    if (sum <= 0) {
        return weights;
    }
    return weights.map((weight) => (weight / sum) * target);
}

export function formatDuration(ms: number): string {
    if (ms < 1000) {
        return `${Math.max(Math.round(ms), 0)} ms`;
    }
    return `${(ms / 1000).toFixed(1)} s`;
}
