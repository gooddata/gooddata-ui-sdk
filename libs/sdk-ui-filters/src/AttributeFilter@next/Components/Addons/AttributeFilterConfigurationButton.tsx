// (C) 2022 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export interface IAttributeFilterConfigurationButtonProps {
    onConfiguration: () => void;
}

//TODO this component is prepared for Dashboard edit mode customization and maybe should be moved to Dashboard
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
                        Configuration
                        {/* 
                         I do not want to add this localization, not sure where this comp will exist  
                        <FormattedMessage id="attributesDropdown.configuration" /> 
                        */}
                    </span>
                </div>
            </div>
        </div>
    );
};
