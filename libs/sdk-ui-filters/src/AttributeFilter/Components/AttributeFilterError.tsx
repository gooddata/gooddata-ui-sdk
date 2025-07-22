// (C) 2022-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

/**
 * Component that is rendered when the initialization of the attribute filter ends up in an error state.
 * @remarks
 * It will be rendered instead of the component that implements {@link IAttributeFilterDropdownButtonProps}.
 * @beta
 */
export interface IAttributeFilterErrorProps {
    /**
     * Error message
     */
    message?: string;
    /**
     * Error object
     */
    error?: any;
    /**
     * Is active state or not
     */
    isOpen?: boolean;
    /**
     * Allow draggable
     */
    isDraggable?: boolean;
}

/**
 * AttributeFilter error component that display error,
 * It does not distinguish different errors, instead it renders a generic error message.
 * @beta
 */
export function AttributeFilterError({ isOpen, isDraggable }: IAttributeFilterErrorProps) {
    return (
        <div
            className={cx(
                "gd-attribute-filter-dropdown-button__next",
                "s-attribute-filter",
                "gd-message error s-button-error",
                {
                    "gd-is-active": isOpen,
                    "gd-is-draggable": isDraggable,
                },
            )}
        >
            <FormattedMessage id="gs.filter.error" />
        </div>
    );
}
