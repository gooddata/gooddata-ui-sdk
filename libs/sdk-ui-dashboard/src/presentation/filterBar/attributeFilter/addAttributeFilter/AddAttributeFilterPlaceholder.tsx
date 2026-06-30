// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

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
            <FormattedMessage id="addPanel.filter" />
        </div>
    );
}
