// (C) 2026 GoodData Corporation

import type { GenAIInteractionStepCategory } from "@gooddata/sdk-backend-spi";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { CATEGORY_ICONS, DEFAULT_STEP_ICON } from "../data/constants.js";
import { e } from "../intelligenceBem.js";

export interface IIconCircleProps {
    category: GenAIInteractionStepCategory;
}

/**
 * Circular chip showing the icon for a category, falling back to a default icon for a category
 * missing from {@link CATEGORY_ICONS} at runtime (an older client meeting a newer backend).
 */
export function IconCircle({ category }: IIconCircleProps) {
    const icon = CATEGORY_ICONS[category] ?? DEFAULT_STEP_ICON;

    return (
        <div className={e("icon-circle")}>
            <UiIcon
                type={icon}
                size={14}
                color="complementary-7"
                accessibilityConfig={{ ariaHidden: true }}
            />
        </div>
    );
}
