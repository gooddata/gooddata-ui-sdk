// (C) 2007-2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { selectEnableMultipleDateFilters, useDashboardSelector } from "../../../../model/index.js";

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
    const enableMultipleDateFilters = useDashboardSelector(selectEnableMultipleDateFilters);

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
                id={enableMultipleDateFilters ? "addPanel.filter" : "addPanel.attributeFilter"}
            />
        </div>
    );
}
