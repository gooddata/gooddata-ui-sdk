// (C) 2023-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";

import { useResetFiltersButton } from "./hooks/useResetFiltersButton.js";
import { messages } from "../../../locales.js";

const alignPoints = [{ align: "bc tc" }];

/**
 * @internal
 */
export const ResetFiltersButton: React.FC = () => {
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
                <button
                    className="gd-button-link button-filter-bar-reset"
                    onClick={resetFilters}
                    aria-label={intl.formatMessage(messages.filterResetButtonAriaLabel)}
                >
                    <Icon.Reset className="gd-icon-reset" width={20} height={20} ariaHidden />
                </button>
                <Bubble alignPoints={alignPoints}>
                    <span>{bubbleText}</span>
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
