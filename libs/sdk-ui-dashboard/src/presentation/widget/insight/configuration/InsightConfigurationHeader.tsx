// (C) 2022 GoodData Corporation
import React from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { SelectedItemType } from "../../common/configuration/types";

interface IInsightConfigurationProps {
    selectedItemType: SelectedItemType;
    handleConfigurationHeaderClick: () => void;
    onCloseButtonClick: () => void;
}

export const InsightConfigurationHeader: React.FC<IInsightConfigurationProps> = ({
    selectedItemType,
    handleConfigurationHeaderClick,
    onCloseButtonClick,
}) => {
    return (
        <div className="configuration-panel-header">
            <Typography
                tagName="h3"
                className="configuration-panel-header-title clickable"
                onClick={handleConfigurationHeaderClick}
            >
                <i className="gd-icon-navigateleft" />
                {selectedItemType === "configuration" ? (
                    <FormattedMessage id="configurationPanel.title" />
                ) : (
                    <FormattedMessage id="configurationPanel.interactions" />
                )}
            </Typography>
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                onClick={onCloseButtonClick}
            />
        </div>
    );
};
