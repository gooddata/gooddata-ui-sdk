// (C) 2023-2025 GoodData Corporation
import React from "react";

import { Typography } from "@gooddata/sdk-ui-kit";

interface IConfigurationPanelHeaderProps {
    headerText: string;
}
export const ConfigurationPanelHeader: React.FC<IConfigurationPanelHeaderProps> = (props) => {
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className="configuration-panel-header-title">
                {props.headerText}
            </Typography>
        </div>
    );
};
