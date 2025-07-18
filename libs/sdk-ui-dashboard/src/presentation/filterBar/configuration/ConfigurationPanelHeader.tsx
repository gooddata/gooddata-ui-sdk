// (C) 2023-2025 GoodData Corporation
import { Typography } from "@gooddata/sdk-ui-kit";

interface IConfigurationPanelHeaderProps {
    headerText: string;
}
export function ConfigurationPanelHeader({ headerText }: IConfigurationPanelHeaderProps) {
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className="configuration-panel-header-title">
                {headerText}
            </Typography>
        </div>
    );
}
