// (C) 2021-2025 GoodData Corporation
import React from "react";

import { FormattedMessage } from "react-intl";

interface IConfigurationButton {
    setIsConfigurationOpen: (isOpen: boolean) => void;
}

export const ConfigurationButton: React.FC<IConfigurationButton> = ({ setIsConfigurationOpen }) => {
    return (
        <div className="attribute-filter-dropdown-configuration-button">
            <div
                className="gd-list-item s-attribute-filter-dropdown-configuration-button"
                onClick={() => {
                    setIsConfigurationOpen(true);
                }}
            >
                <div className="gd-icon-settings button-wrapper">
                    <span className="button-text">
                        <FormattedMessage id="attributesDropdown.configuration" />
                    </span>
                </div>
            </div>
        </div>
    );
};
