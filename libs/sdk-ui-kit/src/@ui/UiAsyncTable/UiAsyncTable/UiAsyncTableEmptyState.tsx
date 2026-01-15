// (C) 2025-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiIcon } from "../../UiIcon/UiIcon.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { type IUiAsyncTableEmptyStateProps } from "../types.js";

/**
 * @internal
 */
export function UiAsyncTableEmptyState({
    title,
    description,
    icon = "search",
}: IUiAsyncTableEmptyStateProps) {
    const intl = useIntl();

    return (
        <div className={e("empty-state")}>
            <UiIcon type={icon} color="currentColor" size={40} />
            <div className={e("empty-state-title")}>
                {title ?? intl.formatMessage(messages["noMatchFound"])}
            </div>
            <div className={e("empty-state-description")}>
                {description ?? intl.formatMessage(messages["tryAdjustingFilters"])}
            </div>
        </div>
    );
}
