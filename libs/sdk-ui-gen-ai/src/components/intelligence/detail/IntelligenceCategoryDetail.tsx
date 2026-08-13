// (C) 2026 GoodData Corporation

import type { IInteractionIntelligence } from "../data/types.js";
import { e } from "../intelligenceBem.js";
import { IntelligenceTimeline } from "../panel/IntelligenceTimeline.js";

import { IntelligenceDetailHeader } from "./IntelligenceDetailHeader.js";
import { IntelligenceDetailRows } from "./IntelligenceDetailRows.js";
import { IntelligenceStepCarousel } from "./IntelligenceStepCarousel.js";

export interface IIntelligenceCategoryDetailProps {
    data: IInteractionIntelligence;
    /** Index of the category to show, within `data.categories`. */
    categoryIndex: number;
    onBack: () => void;
    onClose: () => void;
    onSelectCategory: (index: number) => void;
}

/**
 * The detail view for a single category: header, the shared timeline with this category's own
 * steps highlighted, its detail rows concatenated across every occurrence, and a carousel to
 * move between categories. A pure function of `(data, categoryIndex)` — mountable directly at
 * any index, without going through the list first.
 */
export function IntelligenceCategoryDetail({
    data,
    categoryIndex,
    onBack,
    onClose,
    onSelectCategory,
}: IIntelligenceCategoryDetailProps) {
    const category = data.categories[categoryIndex];

    if (!category) {
        return null;
    }

    return (
        <div className={e("detail")}>
            <IntelligenceDetailHeader category={category} onBack={onBack} onClose={onClose} />
            <IntelligenceTimeline
                steps={data.steps}
                totalDurationMs={data.totals.durationMs}
                categories={data.categories}
                highlightedStepIndexes={category.stepIndexes}
            />
            <IntelligenceDetailRows rows={category.detailRows} />
            <div className={e("detail__divider")} />
            <IntelligenceStepCarousel
                currentIndex={categoryIndex}
                totalCount={data.categories.length}
                onSelectCategory={onSelectCategory}
            />
        </div>
    );
}
