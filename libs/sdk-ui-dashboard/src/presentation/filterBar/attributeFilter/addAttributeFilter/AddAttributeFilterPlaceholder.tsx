// (C) 2007-2022 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

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
            <FormattedMessage id="addPanel.attributeFilter" />
        </div>
    );
}
