// (C) 2022-2026 GoodData Corporation

import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { simplifyText } from "@gooddata/util";

import { useRichTextWidgetInputs } from "../../../_staging/sharedHooks/useRichTextInputs.js";
import { type DescriptionTooltipOpenedData } from "../../../model/events/userInteraction.js";
import { useDashboardUserInteraction } from "../../../model/react/useDashboardUserInteraction.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";
import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";

export function InsightWidgetDescriptionTrigger(props: IInsightWidgetDescriptionTriggerProps) {
    const { widget, insight } = props;
    const { isVisible, description } = useInsightWidgetDescription(props);
    const widgetRefAsString = objRefToString(widgetRef(widget));

    const userInteraction = useDashboardUserInteraction();

    const richTextInputs = useRichTextWidgetInputs(widget, description ?? "", insight);
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
                {...richTextInputs}
                LoadingComponent={LoadingComponent}
            />
        );
    }
    return null;
}
