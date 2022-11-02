// (C) 2022 GoodData Corporation
import React from "react";
import { IInsightWidget, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";

import { WidgetScrollablePanel } from "../../common/WidgetScrollablePanel";
import { InsightDrillConfigPanel } from "./InsightDrillConfigPanel";

interface IInsightConfigurationProps {
    widget: IInsightWidget;
}

export const InsightInteractions: React.FC<IInsightConfigurationProps> = ({ widget }) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";

    const classes = cx(`s-visualization-${widgetRefSuffix}`);

    return (
        <WidgetScrollablePanel className={classes}>
            <InsightDrillConfigPanel widgetRef={widget.ref} />
        </WidgetScrollablePanel>
    );
};

export function createInsightInteractionsScreen(widget: IInsightWidget) {
    return <InsightInteractions widget={widget} />;
}
