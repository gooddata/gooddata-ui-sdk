// (C) 2024-2026 GoodData Corporation

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import { VisualizationListItem } from "./VisualizationListItem.js";
import { type ObjRefMap } from "../../../../../_staging/metadata/objRefMap.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectInsightsMap } from "../../../../../model/store/insights/insightsSelectors.js";

interface IVisulizationsListProps {
    visualizations: IInsightWidget[];
    insights: ObjRefMap<IInsight>;
    activeVisualizationId: string | undefined;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
    onVisualizationSelect: (visualizationWidgetId: string) => void;
    onVisualizationPositionChange: (visualizationWidgetId: string, direction: string) => void;
}

export const VisualizationsList = ({
    visualizations,
    activeVisualizationId,
    onVisualizationDeleted,
    onVisualizationSelect,
    onVisualizationPositionChange,
}: IVisulizationsListProps) => {
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
