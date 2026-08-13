// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

import type { ITimelineSegment } from "../data/types.js";
import { e } from "../intelligenceBem.js";

/** Gap between two tiles, matching `$timeline-gap` in intelligence.scss. */
const TIMELINE_GAP_PX = 1;

export interface ITimelineBarProps {
    /** The shared, ordered segment sequence for the whole turn — one tile per step. */
    segments: ITimelineSegment[];
    /** Step indexes to highlight. Every other tile dims once at least one is highlighted. */
    highlightedStepIndexes?: number[];
    /** Hover content for one tile. Absent renders plain, non-interactive tiles. */
    renderTooltip?: (segment: ITimelineSegment) => ReactNode;
}

/**
 * The single shared timeline track: one tile per interaction step, tiling the full turn in
 * order. Purely informational — a tile is never clickable, only hoverable when `renderTooltip`
 * is given. Tiles in `highlightedStepIndexes` render highlighted; every other tile dims once
 * that list is non-empty, and all tiles render at the same neutral shade when it's absent (the
 * list view's resting state).
 */
export function TimelineBar({ segments, highlightedStepIndexes, renderTooltip }: ITimelineBarProps) {
    const highlighted = new Set(highlightedStepIndexes);
    // Widths sum to exactly 100%, so each tile has to give back its share of the 1px gaps
    // between them — otherwise the track overflows and clips its last tile.
    const totalGapPx = TIMELINE_GAP_PX * Math.max(segments.length - 1, 0);

    return (
        <div className={e("timeline")} role="presentation">
            {segments.map((segment) => {
                const isHighlighted = highlighted.has(segment.stepIndex);
                const isDimmed = !isHighlighted && highlighted.size > 0;
                const className = e("timeline-segment", { highlighted: isHighlighted, dimmed: isDimmed });
                // The pixel term is resolved here, so `calc()` only ever subtracts a plain length.
                const gapShare = (totalGapPx * segment.widthPct) / 100;
                const style = {
                    width:
                        gapShare === 0
                            ? `${segment.widthPct}%`
                            : `calc(${segment.widthPct}% - ${gapShare}px)`,
                };

                if (!renderTooltip) {
                    return <div key={segment.stepId} className={className} style={style} />;
                }

                return (
                    <UiTooltip
                        key={segment.stepId}
                        triggerBy={["hover", "focus"]}
                        arrowPlacement="bottom"
                        variant="none"
                        anchorWrapperStyles={{ flex: "0 0 auto", width: style.width }}
                        anchor={<div className={className} />}
                        content={() => renderTooltip(segment)}
                    />
                );
            })}
        </div>
    );
}
