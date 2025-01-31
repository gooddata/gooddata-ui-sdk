// (C) 2022-2025 GoodData Corporation
import React from "react";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";

import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useDashboardUserInteraction, DescriptionTooltipOpenedData } from "../../../model/index.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";

export const InsightWidgetDescriptionTrigger: React.FC<IInsightWidgetDescriptionTriggerProps> = (props) => {
    const { widget } = props;
    const { isVisible, description, useRichText } = useInsightWidgetDescription(props);
    const widgetRefAsString = objRefToString(widgetRef(widget));

    const userInteraction = useDashboardUserInteraction();

    const eventPayload: DescriptionTooltipOpenedData = {
        from: "widget",
        type: widget.configuration?.description?.source === "widget" ? "custom" : "inherit",
        description,
    };

    if (isVisible) {
        return (
            <DescriptionClickTrigger
                className={`widget-description-${stringUtils.simplifyText(widgetRefAsString)}`}
                description={description}
                onOpen={() => userInteraction.descriptionTooltipOpened(eventPayload)}
                useRichText={useRichText}
            />
        );
    }
    return null;
};
