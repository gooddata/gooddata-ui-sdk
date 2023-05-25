// (C) 2022 GoodData Corporation
import React from "react";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";

import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useDashboardUserInteraction, DescriptionTooltipOpenedData } from "../../../model/index.js";

export const InsightWidgetDescriptionTrigger: React.FC<IInsightWidgetDescriptionTriggerProps> = (props) => {
    const { widget, insight } = props;
    const visible = widget.configuration?.description?.visible ?? true;
    const description =
        widget.configuration?.description?.source === "widget" ? widget.description : insight.insight.summary;

    const trimmedDescription = description?.trim();
    const widgetRefAsString = objRefToString(widgetRef(widget));

    const userInteraction = useDashboardUserInteraction();

    const eventPayload: DescriptionTooltipOpenedData = {
        from: "widget",
        type: widget.configuration?.description?.source === "widget" ? "custom" : "inherit",
        description: trimmedDescription,
    };

    if (visible && trimmedDescription && trimmedDescription !== "") {
        return (
            <DescriptionClickTrigger
                className={`widget-description-${stringUtils.simplifyText(widgetRefAsString)}`}
                description={trimmedDescription}
                onOpen={() => userInteraction.descriptionTooltipOpened(eventPayload)}
            />
        );
    }
    return null;
};
