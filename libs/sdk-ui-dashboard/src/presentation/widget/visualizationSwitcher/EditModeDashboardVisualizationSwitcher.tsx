// (C) 2024 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import { Icon, Typography } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { IDashboardVisualizationSwitcherProps } from "./types.js";

/**
 * @internal
 */
export const EditModeDashboardVisualizationSwitcher: React.FC<IDashboardVisualizationSwitcherProps> = (
    _props,
) => {
    const theme = useTheme();
    const intl = useIntl();
    const emptyContentIconColor = theme?.palette?.complementary?.c7 ?? "#6D7680";
    return (
        <div className="gd-visualization-switcher-widget-empty-content">
            <Icon.VisualizationSwitcher width={32} height={38} color={emptyContentIconColor} />
            <Typography tagName="p">
                {intl.formatMessage({ id: "visualizationSwitcher.emptyContent" })}
            </Typography>
        </div>
    );
};
