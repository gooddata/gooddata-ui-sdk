// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiIconButton } from "@gooddata/sdk-ui-kit";

import { e } from "../intelligenceBem.js";

export interface IIntelligenceHeaderProps {
    onClose: () => void;
}

/**
 * The panel's list-mode header: the "Interaction Intelligence" title and a close button.
 */
export function IntelligenceHeader({ onClose }: IIntelligenceHeaderProps) {
    const intl = useIntl();
    const closeLabel = intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.close" });

    return (
        <div className={e("header")}>
            <span className={e("header__title")}>
                {intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.title" })}
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
