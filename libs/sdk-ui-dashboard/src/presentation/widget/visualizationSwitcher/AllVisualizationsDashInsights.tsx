// (C) 2024-2025 GoodData Corporation

import React from "react";
import cx from "classnames";
import { useDashboardSelector, selectInsightsMap } from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../../presentation/dashboardContexts/index.js";
import { IInsightWidget } from "@gooddata/sdk-model";
import { OnError, OnExportReady, OnLoadingChanged } from "@gooddata/sdk-ui";
import { DashboardInsight } from "../insight/DashboardInsight.js";
import { WidgetExportDataAttributes } from "../../export/index.js";

export interface IAllVisualizationsDashInsightsProps {
    visualizations: IInsightWidget[];
    activeVisualization: IInsightWidget;
    showOthers: boolean;
    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
    clientHeight?: number;
    clientWidth?: number;
    visualizationClassName?: string;
    exportData?: WidgetExportDataAttributes;
}

export const AllVisualizationsDashInsights: React.FC<IAllVisualizationsDashInsightsProps> = ({
    visualizations,
    onError,
    onExportReady,
    onLoadingChanged,
    activeVisualization,
    showOthers,
    clientHeight,
    clientWidth,
    visualizationClassName,
    exportData,
}) => {
    const insights = useDashboardSelector(selectInsightsMap);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    return (
        <>
            {visualizations
                .filter((vis) => vis.identifier === activeVisualization.identifier || showOthers)
                .map((visualization) => {
                    const insight = insights.get(visualization.insight);
                    if (!insight) {
                        return null;
                    }
                    const isActive = visualization.identifier === activeVisualization.identifier;
                    const containerClassName = cx(visualizationClassName, {
                        "gd-visualization-switcher-visible-visualization": isActive,
                        "gd-visualization-switcher-hidden-visualization": !isActive,
                    });
                    return (
                        <div key={visualization.identifier} className={containerClassName}>
                            <DashboardInsight
                                key={visualization.identifier}
                                clientHeight={isActive ? clientHeight : 0}
                                clientWidth={isActive ? clientWidth : 0}
                                insight={insight}
                                widget={visualization}
                                onExportReady={onExportReady}
                                onLoadingChanged={onLoadingChanged}
                                onError={onError}
                                ErrorComponent={ErrorComponent}
                                LoadingComponent={LoadingComponent}
                                exportData={exportData}
                            />
                        </div>
                    );
                })}
        </>
    );
};
