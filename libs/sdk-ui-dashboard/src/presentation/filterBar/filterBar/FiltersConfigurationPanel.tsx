// (C) 2021-2024 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { IAlignPoint, Icon, Typography, Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectDisableDashboardUserFilterSave,
    selectDisableFilterViews,
    useDashboardDispatch,
    useDashboardSelector,
    selectEnableFilterViews,
} from "../../../model/index.js";
import { ConfigurationBubble } from "../../widget/common/configuration/ConfigurationBubble.js";
import { metaActions } from "../../../model/store/meta/index.js";

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "tc br", offset: { x: 4, y: -2 } }];
const PANEL_ALIGN_POINTS: IAlignPoint[] = [{ align: "br tr" }];

interface IConfigurationOptionProps {
    label: React.ReactNode;
    tooltip: React.ReactNode;
    isChecked: boolean;
    onChange: (newValue: boolean) => void;
}

const ConfigurationOption: React.FC<IConfigurationOptionProps> = ({
    label,
    tooltip,
    isChecked,
    onChange,
}) => (
    <div className="configuration-category-item">
        <label className="input-checkbox-toggle">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                    onChange(!e.currentTarget.checked);
                }}
            />
            <span className="input-label-text">
                {label}
                <BubbleHoverTrigger
                    showDelay={0}
                    hideDelay={0}
                    eventsOnBubble={true}
                    className="configuration-category-item-tooltip-icon"
                >
                    <span className="gd-icon-circle-question gd-filter-configuration__help-icon" />
                    <Bubble alignPoints={BUBBLE_ALIGN_POINTS}>
                        <div className="gd-filter-configuration__help-tooltip">{tooltip}</div>
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
        </label>
    </div>
);

const ConfigurationOptions: React.FC = () => {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();

    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering);
    const disableUserFilterReset = useDashboardSelector(selectDisableDashboardUserFilterReset);
    const disableFilterViews = useDashboardSelector(selectDisableFilterViews);
    const disableUserFilterSave = useDashboardSelector(selectDisableDashboardUserFilterSave);

    const isFilterViewsFeatureEnabled = useDashboardSelector(selectEnableFilterViews);

    return (
        <>
            <ConfigurationOption
                label={intl.formatMessage({ id: "filters.configurationPanel.crossFiltering.toggle" })}
                tooltip={intl.formatMessage({
                    id: "filters.configurationPanel.crossFiltering.toggle.tooltip",
                })}
                isChecked={!disableCrossFiltering}
                onChange={(newValue: boolean) => dispatch(metaActions.setDisableCrossFiltering(newValue))}
            />
            <ConfigurationOption
                label={intl.formatMessage({ id: "filters.configurationPanel.userFilterReset.toggle" })}
                tooltip={intl.formatMessage({
                    id: "filters.configurationPanel.userFilterReset.toggle.tooltip",
                })}
                isChecked={!disableUserFilterReset}
                onChange={(newValue: boolean) => dispatch(metaActions.setDisableUserFilterReset(newValue))}
            />
            {isFilterViewsFeatureEnabled ? (
                <ConfigurationOption
                    label={intl.formatMessage({ id: "filters.configurationPanel.filterViews.toggle" })}
                    tooltip={intl.formatMessage(
                        { id: "filters.configurationPanel.filterViews.toggle.tooltip" },
                        {
                            p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                        },
                    )}
                    isChecked={!disableFilterViews}
                    onChange={(newValue: boolean) => dispatch(metaActions.setDisableFilterViews(newValue))}
                />
            ) : null}
            <ConfigurationOption
                label={intl.formatMessage({ id: "filters.configurationPanel.userFilterSave.toggle" })}
                tooltip={intl.formatMessage({
                    id: "filters.configurationPanel.userFilterSave.toggle.tooltip",
                })}
                isChecked={!disableUserFilterSave}
                onChange={(newValue: boolean) => dispatch(metaActions.setDisableUserFilterSave(newValue))}
            />
        </>
    );
};

export const FiltersConfigurationPanel: React.FC = () => {
    const [showConfigurationPanel, setShowConfigurationPanel] = useState(false);
    const theme = useTheme();
    const buttonIconColor = showConfigurationPanel
        ? theme?.palette?.primary?.base ?? "#14b2e2"
        : theme?.palette?.complementary?.c6 ?? "#94a1ad";

    return (
        <div className="gd-filters-configuration">
            <div
                className="gd-filters-configuration-button"
                onClick={() => setShowConfigurationPanel((isVisible) => !isVisible)}
            >
                <Icon.SettingsGear width={18} height={18} color={buttonIconColor} />
            </div>
            {showConfigurationPanel ? (
                <ConfigurationBubble
                    classNames="gd-filters-configuration-panel"
                    onClose={() => setShowConfigurationPanel(false)}
                    alignTo=".gd-filters-configuration-button"
                    alignPoints={PANEL_ALIGN_POINTS}
                >
                    <div className="configuration-panel">
                        <div className="configuration-panel-header gd-filters-configuration__header">
                            <Typography tagName="h3" className="configuration-panel-header-title">
                                <FormattedMessage id="filters.configurationPanel.header" />
                            </Typography>
                        </div>
                        <div className="configuration-category">
                            <ConfigurationOptions />
                        </div>
                    </div>
                </ConfigurationBubble>
            ) : null}
        </div>
    );
};
