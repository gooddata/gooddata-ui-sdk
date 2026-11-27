// (C) 2026 GoodData Corporation

import {
    type IInsight,
    type IInsightWidget,
    type IInsightWidgetDescriptionConfiguration,
    isInsight,
} from "@gooddata/sdk-model";

const defaultDescriptionConfig: IInsightWidgetDescriptionConfiguration = {
    source: "insight",
    includeMetrics: false,
    visible: true,
};

/**
 * Returns the description of the insight shown in the drill dialog.
 */
export const getDrillDialogInsightDescription = (
    widget: IInsightWidget | undefined,
    insight: IInsight["insight"] | undefined,
): string | undefined => {
    const descriptionConfig = widget?.configuration?.description ?? defaultDescriptionConfig;
    // We will handler description configuration only for insight widget that is
    // same as insight in dialog
    if (isInsight(widget) && widget.insight.identifier === insight?.identifier) {
        if (!descriptionConfig.visible) {
            return undefined;
        }
        const useInsightDescription = descriptionConfig.source === "insight";
        return useInsightDescription ? insight?.summary : widget?.description;
    }
    // If widget is not insight or insight is not same as insight in dialog, we will use insight summary as default
    return insight?.summary;
};
