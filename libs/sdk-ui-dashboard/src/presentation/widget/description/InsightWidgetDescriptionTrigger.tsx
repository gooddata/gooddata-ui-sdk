// (C) 2022-2026 GoodData Corporation

import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { simplifyText } from "@gooddata/util";

import { useRichTextWidgetFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { type DescriptionTooltipOpenedData } from "../../../model/events/userInteraction.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../../../model/react/useDashboardUserInteraction.js";
import { selectExecutionTimestamp } from "../../../model/store/ui/uiSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";
import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";

export function InsightWidgetDescriptionTrigger(props: IInsightWidgetDescriptionTriggerProps) {
    const { widget } = props;
    const { isVisible, description } = useInsightWidgetDescription(props);
    const widgetRefAsString = objRefToString(widgetRef(widget));

    const userInteraction = useDashboardUserInteraction();

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
                useReferences
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
