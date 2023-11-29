// (C) 2007-2022 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { useDashboardSelector } from "../../../../model/index.js";
import { selectEnableMultipleDateFilters } from "../../../../model/store/config/configSelectors.js";

/**
 * @internal
 */
export interface AddAttributeFilterPlaceholderProps {
    disabled?: boolean;
}

/**
 * @internal
 */
export function AddAttributeFilterPlaceholder({ disabled }: AddAttributeFilterPlaceholderProps) {
    const enableKDMultipleDateFilters = useDashboardSelector(selectEnableMultipleDateFilters);

    const className = cx(
        "add-item-placeholder",
        "add-attribute-filter-placeholder",
        "s-add-attribute-filter",
        {
            disabled,
        },
    );

    return (
        <div className={className}>
            <FormattedMessage
                id={enableKDMultipleDateFilters ? "addPanel.filter" : "addPanel.attributeFilter"}
            />
        </div>
    );
}
