// (C) 2022 GoodData Corporation
import React from "react";
import { IInsightWidget, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { ScrollablePanel } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";

import { InsightDrillConfigPanel } from "./InsightDrillConfigPanel";

interface IInsightConfigurationProps {
    widget: IInsightWidget;
}

export const InsightInteractions: React.FC<IInsightConfigurationProps> = ({ widget }) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";

    const classes = cx("configuration-scrollable-panel", `s-visualization-${widgetRefSuffix}`);

    return (
        <ScrollablePanel className={classes}>
            <InsightDrillConfigPanel widgetRef={widget.ref} />
        </ScrollablePanel>
    );
};

export function createInsightInteractionsScreen(widget: IInsightWidget) {
    return <InsightInteractions widget={widget} />;
}
