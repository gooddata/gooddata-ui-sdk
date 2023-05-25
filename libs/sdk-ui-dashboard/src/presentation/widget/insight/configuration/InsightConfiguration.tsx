// (C) 2022-2023 GoodData Corporation
import React from "react";
import {
    IInsightWidget,
    isInsightWidget,
    objRefToString,
    IInsightWidgetDescriptionConfiguration,
} from "@gooddata/sdk-model";
import { ScrollablePanel, OverlayControllerProvider, OverlayController } from "@gooddata/sdk-ui-kit";

import { stringUtils } from "@gooddata/util";
import cx from "classnames";

import {
    useDashboardSelector,
    selectSettings,
    useDashboardDispatch,
    changeInsightWidgetVisConfiguration,
    changeInsightWidgetDescription,
} from "../../../../model/index.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";

import InsightFilters from "./InsightFilters.js";
import { InsightTitleConfig } from "./InsightTitleConfig.js";
import { InsightDescriptionConfig } from "./InsightDescriptionConfig/InsightDescriptionConfig.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

interface IInsightConfigurationProps {
    widget: IInsightWidget;
}

export const InsightConfiguration: React.FC<IInsightConfigurationProps> = ({ widget }) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";

    const settings = useDashboardSelector(selectSettings);
    const dispatch = useDashboardDispatch();

    const classes = cx(
        "configuration-scrollable-panel",
        "s-configuration-scrollable-panel",
        `s-visualization-${widgetRefSuffix}`,
    );

    const defaultDescriptionConfig: IInsightWidgetDescriptionConfiguration = {
        source: "insight",
        includeMetrics: false,
        visible: true,
    };

    return (
        <ScrollablePanel className={classes}>
            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
            <OverlayControllerProvider overlayController={overlayController}>
                <InsightTitleConfig
                    widget={widget}
                    isHidingOfWidgetTitleEnabled={settings.enableHidingOfWidgetTitle ?? false}
                    hideTitle={widget.configuration?.hideTitle ?? false}
                    setVisualPropsConfigurationTitle={(widget, hideTitle) => {
                        dispatch(
                            changeInsightWidgetVisConfiguration(widget.ref, {
                                ...widget.configuration,
                                ...{ hideTitle },
                            }),
                        );
                    }}
                />
                <InsightDescriptionConfig
                    widget={widget}
                    isWidgetDescriptionEnabled={settings.enableDescriptions ?? false}
                    descriptionConfig={widget.configuration?.description ?? defaultDescriptionConfig}
                    setDescriptionConfiguration={(widget, config) => {
                        dispatch(
                            changeInsightWidgetVisConfiguration(widget.ref, {
                                hideTitle: false, // hideTitle is mandatory part of config on Bear
                                ...widget.configuration,
                                description: config,
                            }),
                        );
                    }}
                    setWidgetDescription={(widget, description) => {
                        dispatch(
                            changeInsightWidgetDescription(widget.ref, {
                                description,
                            }),
                        );
                    }}
                />
                <InsightFilters widget={widget} />
            </OverlayControllerProvider>
        </ScrollablePanel>
    );
};
