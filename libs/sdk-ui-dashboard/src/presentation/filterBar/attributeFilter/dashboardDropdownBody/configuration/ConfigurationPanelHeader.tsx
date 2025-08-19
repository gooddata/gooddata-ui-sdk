// (C) 2022-2025 GoodData Corporation
import React from "react";

import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

export const ConfigurationPanelHeader: React.FC = () => {
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className="configuration-panel-header-title">
                <FormattedMessage id="attributesDropdown.configuration" />
            </Typography>
        </div>
    );
};
