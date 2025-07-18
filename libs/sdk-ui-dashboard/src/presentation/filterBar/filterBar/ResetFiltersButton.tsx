// (C) 2023-2025 GoodData Corporation

import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";

import { useIntl } from "react-intl";
import { messages } from "../../../locales.js";
import { useResetFiltersButton } from "./hooks/useResetFiltersButton.js";

const alignPoints = [{ align: "bc tc" }];

/**
 * @internal
 */
export function ResetFiltersButton() {
    const intl = useIntl();

    const { canReset, resetFilters, resetType } = useResetFiltersButton();

    if (!canReset) {
        return null;
    }

    const bubbleText =
        resetType === "all"
            ? intl.formatMessage(messages.filterResetButtonTooltip)
            : intl.formatMessage(messages.crossFilterResetButtonTooltip);

    return (
        <div className="dash-filters-reset">
            <BubbleHoverTrigger>
                <button className="gd-button-link button-filter-bar-reset" onClick={resetFilters}>
                    <Icon.Reset className="gd-icon-reset" width={20} height={20} />
                </button>
                <Bubble alignPoints={alignPoints}>
                    <span>{bubbleText}</span>
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}
