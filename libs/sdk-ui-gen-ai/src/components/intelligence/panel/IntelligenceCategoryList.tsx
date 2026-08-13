// (C) 2026 GoodData Corporation

import type { IInteractionCategory } from "../data/types.js";
import { e } from "../intelligenceBem.js";

import { IntelligenceCategoryRow } from "./IntelligenceCategoryRow.js";

export interface IIntelligenceCategoryListProps {
    categories: IInteractionCategory[];
    onSelectCategory: (index: number) => void;
    /** Lifts the hovered category's step indexes so the sibling timeline can highlight them. */
    onHoveredStepIndexesChange: (stepIndexes: number[] | undefined) => void;
}

/**
 * The list of category rows. Hovering a row reports its step indexes up so the timeline above
 * can highlight the tiles where that category occurred — the list itself renders no timeline.
 */
export function IntelligenceCategoryList({
    categories,
    onSelectCategory,
    onHoveredStepIndexesChange,
}: IIntelligenceCategoryListProps) {
    return (
        <div className={e("category-list")}>
            {categories.map((category, index) => (
                <IntelligenceCategoryRow
                    key={category.category}
                    category={category}
                    onSelect={() => onSelectCategory(index)}
                    onHoverChange={(isHovered) =>
                        onHoveredStepIndexesChange(isHovered ? category.stepIndexes : undefined)
                    }
                />
            ))}
        </div>
    );
}
