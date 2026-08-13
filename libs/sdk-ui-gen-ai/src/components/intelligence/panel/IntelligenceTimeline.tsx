// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { computeSegments } from "../data/timeline.js";
import type { IInteractionCategory, IInteractionStepTile } from "../data/types.js";
import { e } from "../intelligenceBem.js";

import { IntelligenceStepTooltip } from "./IntelligenceStepTooltip.js";
import { TimelineBar } from "./TimelineBar.js";

export interface IIntelligenceTimelineProps {
    steps: IInteractionStepTile[];
    totalDurationMs: number;
    categories: IInteractionCategory[];
    /** Step indexes to highlight — a category's occurrences, or none in the plain list view. */
    highlightedStepIndexes?: number[];
}

/**
 * The single timeline track shared by the list view and every category's detail view: one tile
 * per interaction step, with a hover tooltip listing that step's activities and its own
 * duration/tokens. Never navigable — highlighting is driven entirely by `highlightedStepIndexes`.
 */
export function IntelligenceTimeline({
    steps,
    totalDurationMs,
    categories,
    highlightedStepIndexes,
}: IIntelligenceTimelineProps) {
    const segments = useMemo(() => computeSegments(steps, totalDurationMs), [steps, totalDurationMs]);

    return (
        <div className={e("timeline-wrapper")}>
            <TimelineBar
                segments={segments}
                highlightedStepIndexes={highlightedStepIndexes}
                renderTooltip={(segment) => (
                    <IntelligenceStepTooltip step={steps[segment.stepIndex]} categories={categories} />
                )}
            />
        </div>
    );
}
