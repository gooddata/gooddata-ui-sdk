// (C) 2021-2024 GoodData Corporation
import React, { useState } from "react";
import {
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectDisableDashboardUserFilterSave,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

import { IAlignPoint, Icon, Typography, Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { ConfigurationBubble } from "../../widget/common/configuration/ConfigurationBubble.js";
import { metaActions } from "../../../model/store/meta/index.js";
import { FormattedMessage } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const bubbleAlignPoints: IAlignPoint[] = [
    { align: "tr tl", offset: { x: 0, y: 5 } },
    { align: "tl tr", offset: { x: 0, y: 5 } },
];

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
                            <CrossFilteringToggle />
                            <UserFiltersToggle />
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
        <div className="configuration-category-item">
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
                    <BubbleHoverTrigger
                        showDelay={0}
                        hideDelay={0}
                        eventsOnBubble={true}
                        className="configuration-category-item-tooltip-icon"
                    >
                        <span className="gd-icon-circle-question s-configuration-category-crossFiltering-tooltip" />
                        <Bubble alignPoints={bubbleAlignPoints}>
                            <FormattedMessage id="filters.configurationPanel.crossFiltering.toggle.tooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                </span>
            </label>
        </div>
    );
}

function UserFiltersToggle() {
    const disableUserFilterReset = useDashboardSelector(selectDisableDashboardUserFilterReset);
    const disableUserFilterSave = useDashboardSelector(selectDisableDashboardUserFilterSave);

    const dispatch = useDashboardDispatch();
    const setDisableUserFilterReset = (disable: boolean) =>
        dispatch(metaActions.setDisableUserFilterReset(disable));
    const setDisableUserFilterSave = (disable: boolean) =>
        dispatch(metaActions.setDisableUserFilterSave(disable));

    return (
        <>
            <div className="configuration-category-item">
                <label className="input-checkbox-toggle">
                    <input
                        type="checkbox"
                        checked={!disableUserFilterReset}
                        onChange={(e) => {
                            setDisableUserFilterReset(!e.currentTarget.checked);
                        }}
                    />
                    <span className="input-label-text">
                        <FormattedMessage id="filters.configurationPanel.userFilterReset.toggle" />
                        <BubbleHoverTrigger
                            showDelay={0}
                            hideDelay={0}
                            eventsOnBubble={true}
                            className="configuration-category-item-tooltip-icon"
                        >
                            <span className="gd-icon-circle-question s-configuration-category-userFilterReset-tooltip" />
                            <Bubble alignPoints={bubbleAlignPoints}>
                                <FormattedMessage id="filters.configurationPanel.userFilterReset.toggle.tooltip" />
                            </Bubble>
                        </BubbleHoverTrigger>
                    </span>
                </label>
            </div>
            <div className="configuration-category-item">
                <label className="input-checkbox-toggle">
                    <input
                        type="checkbox"
                        checked={!disableUserFilterSave}
                        onChange={(e) => {
                            setDisableUserFilterSave(!e.currentTarget.checked);
                        }}
                    />
                    <span className="input-label-text">
                        <FormattedMessage id="filters.configurationPanel.userFilterSave.toggle" />
                        <BubbleHoverTrigger
                            showDelay={0}
                            hideDelay={0}
                            eventsOnBubble={true}
                            className="configuration-category-item-tooltip-icon"
                        >
                            <span className="gd-icon-circle-question s-configuration-category-userFilterSave-tooltip" />
                            <Bubble alignPoints={bubbleAlignPoints}>
                                <FormattedMessage id="filters.configurationPanel.userFilterSave.toggle.tooltip" />
                            </Bubble>
                        </BubbleHoverTrigger>
                    </span>
                </label>
            </div>
        </>
    );
}
