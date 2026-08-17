// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import type { IInteractionCategory } from "../data/types.js";
import { resolveMessage } from "../format/resolveMessage.js";
import { e } from "../intelligenceBem.js";

import { IconCircle } from "./IconCircle.js";

export interface IIntelligenceCategoryRowProps {
    category: IInteractionCategory;
    onSelect: () => void;
    onHoverChange: (isHovered: boolean) => void;
}

/**
 * One list row: the category's icon, its label, a content excerpt on the right (never a
 * duration — that figure was always a fabricated per-category aggregate), and a chevron to open
 * its detail view. Reports its own hover state up so the shared timeline can highlight the steps
 * this category occurred in.
 */
export function IntelligenceCategoryRow({
    category,
    onSelect,
    onHoverChange,
}: IIntelligenceCategoryRowProps) {
    const intl = useIntl();

    return (
        <button
            type="button"
            className={e("category-row")}
            onClick={onSelect}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            onFocus={() => onHoverChange(true)}
            onBlur={() => onHoverChange(false)}
        >
            <IconCircle category={category.category} />
            <span className={e("category-row__label")}>
                {resolveMessage(intl, category.labelId, category.category)}
            </span>
            {/* Always rendered — it is what pushes the chevron to the end of the row. */}
            <span className={e("category-row__excerpt")}>
                {category.excerpt?.fragments.map((fragment, index) => (
                    <span key={index}>{intl.formatMessage({ id: fragment.id }, fragment.values)}</span>
                ))}
            </span>
            <UiIcon
                type="navigateRight"
                size={16}
                color="complementary-6"
                accessibilityConfig={{ ariaHidden: true }}
            />
        </button>
    );
}
