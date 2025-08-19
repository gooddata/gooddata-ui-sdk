// (C) 2022-2025 GoodData Corporation
import React from "react";

import {
    insightCreated,
    insightIsLocked,
    insightTitle,
    insightUpdated,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import { IInsightDraggingComponentProps } from "../../componentDefinition/types.js";
import { DraggableInsightListItemBody } from "../../dashboard/DashboardSidebar/DraggableInsightList/index.js";

/*
 * @internal
 */
export function InsightDraggingComponent({ item }: IInsightDraggingComponentProps) {
    const insight = item.insight;

    if (!insight) {
        return <DraggableInsightListItemBody className="move-insight-placeholder" />;
    }

    return (
        <DraggableInsightListItemBody
            className="move-insight-placeholder"
            type={insightVisualizationType(insight) as VisType}
            title={insightTitle(insight)}
            updated={insightUpdated(insight) ?? insightCreated(insight)}
            isLocked={insightIsLocked(insight)}
        />
    );
}
