// (C) 2024-2025 GoodData Corporation

import React from "react";

import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { VisualizationListItem } from "./VisualizationListItem.js";
import { ObjRefMap } from "../../../../../_staging/metadata/objRefMap.js";
import { selectInsightsMap, useDashboardSelector } from "../../../../../model/index.js";

interface IVisulizationsListProps {
    visualizations: IInsightWidget[];
    insights: ObjRefMap<IInsight>;
    activeVisualizationId: string | undefined;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
    onVisualizationSelect: (visualizationWidgetId: string) => void;
    onVisualizationPositionChange: (visualizationWidgetId: string, direction: string) => void;
}

export const VisualizationsList: React.FC<IVisulizationsListProps> = ({
    visualizations,
    activeVisualizationId,
    onVisualizationDeleted,
    onVisualizationSelect,
    onVisualizationPositionChange,
}) => {
    const insightsMap = useDashboardSelector(selectInsightsMap);

    const shouldRenderActions = visualizations.length > 1;

    return visualizations.map((visualization, index) => {
        const insight = insightsMap.get(visualization.insight);
        const isActive = visualization.identifier === activeVisualizationId;
        const isLast = index === visualizations.length - 1;
        const isFirst = index === 0;

        return (
            <VisualizationListItem
                key={visualization.identifier}
                visualization={visualization}
                insight={insight!}
                isActive={isActive}
                isLast={isLast}
                isFirst={isFirst}
                shouldRenderActions={shouldRenderActions}
                onVisualizationSelect={onVisualizationSelect}
                onVisualizationDeleted={onVisualizationDeleted}
                onVisualizationPositionChange={onVisualizationPositionChange}
            />
        );
    });
};
