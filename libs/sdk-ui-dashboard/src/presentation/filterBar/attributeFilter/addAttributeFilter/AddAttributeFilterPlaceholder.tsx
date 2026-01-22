// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectEnableMultipleDateFilters } from "../../../../model/store/config/configSelectors.js";

/**
 * @internal
 */
export interface IAddAttributeFilterPlaceholderProps {
    disabled?: boolean;
}

/**
 * @internal
 */
export function AddAttributeFilterPlaceholder({ disabled }: IAddAttributeFilterPlaceholderProps) {
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
