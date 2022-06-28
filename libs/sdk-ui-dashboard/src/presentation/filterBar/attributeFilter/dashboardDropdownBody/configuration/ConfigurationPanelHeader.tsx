// (C) 2022 GoodData Corporation
import React from "react";

import { Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

export const ConfigurationPanelHeader: React.FC = () => {
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className="configuration-panel-header-title">
                <FormattedMessage id="attributesDropdown.configuration" />
            </Typography>
        </div>
    );
};
