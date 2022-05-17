// (C) 2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { ConfigurationCategory } from "./ConfigurationCategory";
import { ConfigurationPanelHeader } from "./ConfigurationPanelHeader";

export const ConfigurationPanel: React.FC = () => {
    const intl = useIntl();

    return (
        <div className="s-attribute-filter-dropdown-configuration attribute-filter-dropdown-configuration">
            <ConfigurationPanelHeader />
            <ConfigurationCategory
                categoryTitle={intl.formatMessage({ id: "attributesDropdown.filterBy" })}
            />
        </div>
    );
};
