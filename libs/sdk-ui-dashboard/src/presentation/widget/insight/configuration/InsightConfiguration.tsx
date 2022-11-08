// (C) 2022 GoodData Corporation
import React from "react";
import {
    IInsightWidget,
    isInsightWidget,
    objRefToString,
    IInsightWidgetDescriptionConfiguration,
} from "@gooddata/sdk-model";
import { ScrollablePanel } from "@gooddata/sdk-ui-kit";

import { stringUtils } from "@gooddata/util";
import omit from "lodash/omit";
import cx from "classnames";

import {
    useDashboardSelector,
    selectSettings,
    useDashboardDispatch,
    changeInsightWidgetVisConfiguration,
    changeInsightWidgetDescription,
} from "../../../../model";
import { InsightTitleConfig } from "./InsightTitleConfig";

import InsightFilters from "./InsightFilters";
import { InsightDescriptionConfig } from "./InsightDescriptionConfig/InsightDescriptionConfig";

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
        "configuration-panel",
        "configuration-scrollable-panel",
        `s-visualization-${widgetRefSuffix}`,
    );

    const defaultDescriptionConfig: IInsightWidgetDescriptionConfiguration = {
        source: "insight",
        includeMetrics: false,
        visible: true,
    };

    return (
        <ScrollablePanel className={classes}>
            <InsightTitleConfig
                widget={widget}
                isHidingOfWidgetTitleEnabled={settings.enableHidingOfWidgetTitle ?? false}
                hideTitle={widget.configuration?.hideTitle ?? false}
                setVisualPropsConfigurationTitle={(widget, hideTitle) => {
                    dispatch(
                        changeInsightWidgetVisConfiguration(widget.ref, {
                            ...omit(widget.configuration, ["hideTitle"]),
                            ...(hideTitle ? { hideTitle } : {}),
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
        </ScrollablePanel>
    );
};
