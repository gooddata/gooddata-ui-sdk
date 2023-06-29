// (C) 2022 GoodData Corporation
import React from "react";
import { insightIsLocked, insightTitle, insightUpdated, insightVisualizationType } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import { IInsightDraggingComponentProps } from "../../componentDefinition/types.js";
import { DraggableInsightListItemBody } from "../../dashboard/DashboardSidebar/DraggableInsightList/index.js";

/*
 * @internal
 */
export function InsightDraggingComponent({ item }: IInsightDraggingComponentProps) {
    const insight = item.insight;
    const visualizationType = insightVisualizationType(insight) as VisType;

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
