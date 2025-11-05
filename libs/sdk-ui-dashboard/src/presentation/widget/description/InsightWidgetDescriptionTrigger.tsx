// (C) 2022-2025 GoodData Corporation

import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";
import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";
import { useRichTextWidgetFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import {
    DescriptionTooltipOpenedData,
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

export function InsightWidgetDescriptionTrigger(props: IInsightWidgetDescriptionTriggerProps) {
    const { widget } = props;
    const { isVisible, description, useRichText } = useInsightWidgetDescription(props);
    const widgetRefAsString = objRefToString(widgetRef(widget));

    const userInteraction = useDashboardUserInteraction();

    const useReferences = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const { filters } = useRichTextWidgetFilters(widget);
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
}
