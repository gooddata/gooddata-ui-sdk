// (C) 2022 GoodData Corporation
import React from "react";
import { IInsightWidget, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";

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

    const classes = cx("configuration-panel", `s-visualization-${widgetRefSuffix}`);

    return (
        <WidgetScrollablePanel className={classes}>
            <InsightTitleConfig
                isHidingOfWidgetTitleEnabled={true} // TODO
                hideTitle={false}
                // resetTitle={() => handleResetTitle(widgetOriginalTitle)} // TODO
            />
            <InsightFilters widget={widget} />
        </WidgetScrollablePanel>
    );
};

export function createInsightConfigurationScreen(widget: IInsightWidget) {
    return <InsightConfiguration widget={widget} />;
}
