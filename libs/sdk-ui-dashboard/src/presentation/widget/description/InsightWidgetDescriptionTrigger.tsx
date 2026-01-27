// (C) 2022-2026 GoodData Corporation

import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { simplifyText } from "@gooddata/util";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";
import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";
import { useRichTextWidgetFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { type DescriptionTooltipOpenedData } from "../../../model/events/userInteraction.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../../../model/react/useDashboardUserInteraction.js";
import { selectEnableRichTextDynamicReferences } from "../../../model/store/config/configSelectors.js";
import { selectExecutionTimestamp } from "../../../model/store/ui/uiSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

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
                className={`widget-description-${simplifyText(widgetRefAsString)}`}
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
