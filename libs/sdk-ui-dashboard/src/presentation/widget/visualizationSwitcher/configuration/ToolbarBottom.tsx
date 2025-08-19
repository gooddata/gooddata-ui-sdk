// (C) 2024-2025 GoodData Corporation

import React from "react";

import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { VisualizationConfig } from "./VisualizationConfig.js";
import { VisualizationsPage } from "./VisualizationsPage.js";

interface IToolbarBottomProps {
    visualizations: IInsightWidget[];
    activeVisualizationId: string | undefined;
    onVisualizationAdd: (insight: IInsight) => void;
    onVisualizationDelete: (visualizationWidgetId: string) => void;
    onVisualizationSelect: (visualizationWidgetId: string) => void;
    onVisualizationPositionChange: (visualizationWidgetId: string, direction: string) => void;
    showVisualizationsList: boolean;
}
export const ToolbarBottom: React.FC<IToolbarBottomProps> = ({
    showVisualizationsList,
    visualizations,
    onVisualizationAdd,
    onVisualizationDelete,
    onVisualizationSelect,
    onVisualizationPositionChange,
    activeVisualizationId,
}) => {
    const activeVisualization = visualizations.find(
        (visualization) => visualization.identifier === activeVisualizationId,
    );

    return (
        <div className="gd-visualization-switcher-toolbar-bottom bubble bubble-light">
            {showVisualizationsList || !activeVisualization ? (
                <VisualizationsPage
                    visualizations={visualizations}
                    activeVisualizationId={activeVisualizationId}
                    onVisualizationAdd={onVisualizationAdd}
                    onVisualizationDeleted={onVisualizationDelete}
                    onVisualizationSelect={onVisualizationSelect}
                    onVisualizationPositionChange={onVisualizationPositionChange}
                />
            ) : (
                <VisualizationConfig
                    widget={activeVisualization}
                    onVisualizationDeleted={onVisualizationDelete}
                />
            )}
        </div>
    );
};
