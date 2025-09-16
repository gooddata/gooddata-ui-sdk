// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { IInsightWidget, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { OverlayController, OverlayControllerProvider, ScrollablePanel } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { InsightDrillConfigPanel } from "./InsightDrillConfigPanel/InsightDrillConfigPanel.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

interface IInsightConfigurationProps {
    widget: IInsightWidget;
}

export function InsightInteractions({ widget }: IInsightConfigurationProps) {
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
}

export function createInsightInteractionsScreen(widget: IInsightWidget) {
    return <InsightInteractions widget={widget} />;
}
