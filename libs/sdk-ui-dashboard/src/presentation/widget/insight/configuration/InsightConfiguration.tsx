// (C) 2022 GoodData Corporation
import React from "react";
import { IInsightWidget, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import omit from "lodash/omit";
import cx from "classnames";

import {
    useDashboardSelector,
    selectSettings,
    useDashboardDispatch,
    changeInsightWidgetVisConfiguration,
} from "../../../../model";
import { WidgetScrollablePanel } from "../../common/WidgetScrollablePanel";
import { InsightTitleConfig } from "./InsightTitleConfig";

import InsightFilters from "./InsightFilters";

interface IInsightConfigurationProps {
    widget: IInsightWidget;
}

export const InsightConfiguration: React.FC<IInsightConfigurationProps> = ({ widget }) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";

    const settings = useDashboardSelector(selectSettings);
    const dispatch = useDashboardDispatch();

    const classes = cx("configuration-panel", `s-visualization-${widgetRefSuffix}`);

    return (
        <WidgetScrollablePanel className={classes}>
            <InsightTitleConfig
                widget={widget}
                isHidingOfWidgetTitleEnabled={settings.enableHidingOfWidgetTitle ?? false}
                hideTitle={widget.configuration?.hideTitle || false}
                setVisualPropsConfigurationTitle={(widget, hideTitle) => {
                    dispatch(
                        changeInsightWidgetVisConfiguration(widget.ref, {
                            ...omit(widget.configuration, ["hideTitle"]),
                            ...(hideTitle ? { hideTitle } : {}),
                        }),
                    );
                }}
            />
            <InsightFilters widget={widget} />
        </WidgetScrollablePanel>
    );
};
