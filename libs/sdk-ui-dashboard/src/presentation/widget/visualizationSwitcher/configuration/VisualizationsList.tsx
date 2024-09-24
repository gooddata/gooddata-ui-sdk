// (C) 2024 GoodData Corporation

import { Button, InsightListItemTypeIcon, ShortenedText } from "@gooddata/sdk-ui-kit";
import React from "react";
import cx from "classnames";
import { IInsight, IInsightWidget, insightVisualizationType } from "@gooddata/sdk-model";
import { selectInsightsMap, useDashboardSelector } from "../../../../model/index.js";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";

const visualizationIconWidthAndPadding = 42;
const tooltipAlignPoints = [
    {
        align: "cr cl",
    },
    {
        align: "cl cr",
        offset: {
            x: -visualizationIconWidthAndPadding,
            y: 0,
        },
    },
];
interface IVisulizationsListProps {
    visualizations: IInsightWidget[];
    insights: ObjRefMap<IInsight>;
    activeVisualizationId: string | undefined;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
    onVisualizationSelect: (visualizationWidgetId: string) => void;
}

export const VisualizationsList: React.FC<IVisulizationsListProps> = ({
    visualizations,
    activeVisualizationId,
    onVisualizationDeleted,
    onVisualizationSelect,
}) => {
    const insightsMap = useDashboardSelector(selectInsightsMap);

    return visualizations.map((visualization) => {
        const insight = insightsMap.get(visualization.insight);
        const isActive = visualization.identifier === activeVisualizationId;

        return (
            <div
                key={visualization.identifier}
                className={cx("switcher-visualizations-list-item", {
                    "is-selected": isActive,
                })}
            >
                <div
                    className="visualization-title"
                    onClick={() => onVisualizationSelect(visualization.identifier)}
                >
                    {insight ? <InsightListItemTypeIcon type={insightVisualizationType(insight!)} /> : null}
                    <div className="gd-visualizations-list-item-content">
                        <div className="gd-visualizations-list-item-content-name">
                            <ShortenedText
                                className="gd-visualizations-list-item-content-name-text"
                                tooltipAlignPoints={tooltipAlignPoints}
                            >
                                {visualization.title}
                            </ShortenedText>
                        </div>
                    </div>
                </div>
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-trash s-visualization-switcher-remove-button"
                    onClick={() => onVisualizationDeleted(visualization.identifier)}
                />
            </div>
        );
    });
};
