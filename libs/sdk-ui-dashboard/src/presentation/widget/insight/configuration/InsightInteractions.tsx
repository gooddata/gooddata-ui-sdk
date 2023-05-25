// (C) 2022-2023 GoodData Corporation
import React from "react";
import { IInsightWidget, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { ScrollablePanel, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";

import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";

import { InsightDrillConfigPanel } from "./InsightDrillConfigPanel/InsightDrillConfigPanel.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

interface IInsightConfigurationProps {
    widget: IInsightWidget;
}

export const InsightInteractions: React.FC<IInsightConfigurationProps> = ({ widget }) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";

    const classes = cx(
        "configuration-scrollable-panel",
        "s-configuration-scrollable-panel",
        `s-visualization-${widgetRefSuffix}`,
    );

    return (
        <ScrollablePanel className={classes}>
            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
            <OverlayControllerProvider overlayController={overlayController}>
                <InsightDrillConfigPanel widgetRef={widget.ref} />
            </OverlayControllerProvider>
        </ScrollablePanel>
    );
};

export function createInsightInteractionsScreen(widget: IInsightWidget) {
    return <InsightInteractions widget={widget} />;
}
