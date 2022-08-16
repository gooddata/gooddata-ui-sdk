// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

/**
 * @internal
 */
export interface IAttributeFilterConfigurationButtonProps {
    onConfiguration: () => void;
}

/**
 * @internal
 */
export const AttributeFilterConfigurationButton: React.VFC<IAttributeFilterConfigurationButtonProps> = (
    props,
) => {
    const { onConfiguration } = props;
    return (
        <div className="gd-attribute-filter-dropdown-configuration-button">
            <div
                className="gd-list-item s-attribute-filter-dropdown-configuration-button"
                onClick={onConfiguration}
            >
                <div className="gd-icon-settings gd-attribute-filter-dropdown-configuration-button-wrapper">
                    <span className="gd-attribute-filter-dropdown-configuration-button-text">
                        <FormattedMessage id="attributesDropdown.configuration" />
                    </span>
                </div>
            </div>
        </div>
    );
};
