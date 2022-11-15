// (C) 2022 GoodData Corporation
import React from "react";
import { insightIsLocked, insightTitle, insightUpdated, insightVisualizationUrl } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import { IInsightDraggingComponentProps } from "../../componentDefinition/types";
import { DraggableInsightListItemBody } from "../../dashboard/DashboardSidebar/DraggableInsightList";

/*
 * @internal
 */
export function InsightDraggingComponent({ item }: IInsightDraggingComponentProps) {
    const insight = item.insight;
    const visualizationUrl = insightVisualizationUrl(insight);
    const visualizationType = visualizationUrl?.split(":")[1] as VisType;

    return (
        <DraggableInsightListItemBody
            className="move-insight-placeholder"
            type={visualizationType}
            title={insightTitle(insight)}
            updated={insightUpdated(insight)}
            isLocked={insightIsLocked(insight)}
        />
    );
}
