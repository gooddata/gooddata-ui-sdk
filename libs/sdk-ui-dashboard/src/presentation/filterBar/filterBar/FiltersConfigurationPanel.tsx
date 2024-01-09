// (C) 2021-2024 GoodData Corporation
import React, { useState } from "react";
import {
    selectDisableDashboardCrossFiltering,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

import { IAlignPoint, Icon, Typography } from "@gooddata/sdk-ui-kit";
import { ConfigurationBubble } from "../../widget/common/configuration/ConfigurationBubble.js";
import { metaActions } from "../../../model/store/meta/index.js";
import { FormattedMessage } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const alignPoints: IAlignPoint[] = [
    {
        align: "br tr",
    },
];

export function FiltersConfigurationPanel() {
    const [showConfigurationPanel, setShowConfigurationPanel] = useState(false);
    const theme = useTheme();

    return (
        <div className="gd-filters-configuration">
            <div
                className="gd-filters-configuration-button"
                onClick={() => setShowConfigurationPanel((isVisible) => !isVisible)}
            >
                <Icon.SettingsGear
                    width={18}
                    height={18}
                    color={
                        showConfigurationPanel
                            ? theme?.palette?.primary?.base ?? "#14b2e2"
                            : theme?.palette?.complementary?.c6 ?? "#94a1ad"
                    }
                />
            </div>
            {showConfigurationPanel ? (
                <ConfigurationBubble
                    classNames="gd-filters-configuration-panel"
                    onClose={() => setShowConfigurationPanel(false)}
                    alignTo=".gd-filters-configuration-button"
                    alignPoints={alignPoints}
                >
                    <div className="configuration-panel">
                        <div className="configuration-panel-header">
                            <Typography tagName="h3" className="configuration-panel-header-title">
                                <FormattedMessage id="filters.configurationPanel.header" />
                            </Typography>
                        </div>
                        <div className="configuration-category">
                            <Typography tagName="h3">
                                <FormattedMessage id="filters.configurationPanel.sectionHeader.interactions" />
                            </Typography>
                            <CrossFilteringToggle />
                        </div>
                    </div>
                </ConfigurationBubble>
            ) : null}
        </div>
    );
}

function CrossFilteringToggle() {
    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering);

    const dispatch = useDashboardDispatch();
    const setDisableCrossFiltering = (disable: boolean) =>
        dispatch(metaActions.setDisableCrossFiltering(disable));

    return (
        <label className="input-checkbox-toggle">
            <input
                type="checkbox"
                checked={!disableCrossFiltering}
                onChange={(e) => {
                    setDisableCrossFiltering(!e.currentTarget.checked);
                }}
            />
            <span className="input-label-text">
                <FormattedMessage id="filters.configurationPanel.crossFiltering.toggle" />
            </span>
        </label>
    );
}
