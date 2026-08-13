// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiIconButton } from "@gooddata/sdk-ui-kit";

import type { IInteractionCategory } from "../data/types.js";
import { resolveMessage } from "../format/resolveMessage.js";
import { e } from "../intelligenceBem.js";
import { IconCircle } from "../panel/IconCircle.js";

export interface IIntelligenceDetailHeaderProps {
    category: IInteractionCategory;
    onBack: () => void;
    onClose: () => void;
}

/**
 * The detail view's header: a back button to the list, the category's icon/label, and a close
 * button. No duration/tokens — a category never carries its own honest figure for either.
 */
export function IntelligenceDetailHeader({ category, onBack, onClose }: IIntelligenceDetailHeaderProps) {
    const intl = useIntl();
    const backLabel = intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.back" });
    const closeLabel = intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.close" });

    return (
        <div className={e("detail-header")}>
            <UiIconButton
                icon="navigateLeft"
                variant="secondary"
                size="small"
                onClick={onBack}
                accessibilityConfig={{ ariaLabel: backLabel }}
            />
            <IconCircle category={category.category} />
            <span className={e("detail-header__label")}>
                {resolveMessage(intl, category.labelId, category.category)}
            </span>
            <UiIconButton
                icon="cross"
                variant="tertiary"
                size="medium"
                onClick={onClose}
                accessibilityConfig={{ ariaLabel: closeLabel }}
            />
        </div>
    );
}
