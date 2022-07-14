// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Button, Typography } from "@gooddata/sdk-ui-kit";

interface IKpiConfigurationPanelHeaderProps {
    onCloseButtonClick: () => void;
}

export const KpiConfigurationPanelHeader: React.FC<IKpiConfigurationPanelHeaderProps> = (props) => {
    const { onCloseButtonClick } = props;
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className="configuration-panel-header-title">
                <FormattedMessage id="configurationPanel.title" />
            </Typography>
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                onClick={onCloseButtonClick}
            />
        </div>
    );
};
