// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

/**
 * It represents component that is rendered rendered when initializations of the attribute filter end up in error state.
 * @remarks
 * It will be rendered instead of the component that implement {@link IAttributeFilterDropdownButtonProps}
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
}

/**
 * AttributeFilter error component that display error,
 * It does not distinguish different errors, instead it renders a generic error message.
 * @beta
 */
export const AttributeFilterError: React.VFC<IAttributeFilterErrorProps> = (
    _props: IAttributeFilterErrorProps,
) => {
    return (
        <div className="gd-message error s-button-error">
            <FormattedMessage id="gs.filter.error" />
        </div>
    );
};
