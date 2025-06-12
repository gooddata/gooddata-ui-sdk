// (C) 2022-2025 GoodData Corporation
import React from "react";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import {
    useDashboardUserInteraction,
    DescriptionTooltipOpenedData,
    useDashboardSelector,
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { useRichTextFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";
import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";

export const InsightWidgetDescriptionTrigger: React.FC<IInsightWidgetDescriptionTriggerProps> = (props) => {
    const { widget } = props;
    const { isVisible, description, useRichText } = useInsightWidgetDescription(props);
    const widgetRefAsString = objRefToString(widgetRef(widget));

    const userInteraction = useDashboardUserInteraction();

    const useReferences = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const { filters } = useRichTextFilters(widget);
    const { LoadingComponent } = useDashboardComponentsContext();

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
                useReferences={useReferences}
                filters={filters}
                LoadingComponent={LoadingComponent}
                execConfig={{
                    timestamp: executionTimestamp,
                }}
            />
        );
    }
    return null;
};
