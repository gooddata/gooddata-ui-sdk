// (C) 2024 GoodData Corporation

import { Button, Typography } from "@gooddata/sdk-ui-kit";
import React from "react";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import {
    selectInsightsMap,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../model/index.js";
import { useIntl } from "react-intl";
import { VisualizationsList } from "./VisualizationsList/VisualizationsList.js";
import { InsightPicker } from "./InsightPicker.js";

interface IVisualizationsPageProps {
    visualizations: IInsightWidget[];
    activeVisualizationId: string | undefined;
    onVisualizationAdd: (insight: IInsight) => void;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
    onVisualizationSelect: (visualizationWidgetId: string) => void;
    onVisualizationPositionChange: (visualizationWidgetId: string, direction: string) => void;
}

export const VisualizationsPage: React.FC<IVisualizationsPageProps> = ({
    visualizations,
    activeVisualizationId,
    onVisualizationDeleted,
    onVisualizationAdd,
    onVisualizationSelect,
    onVisualizationPositionChange,
}) => {
    const [isVisualizationPickerVisible, setVisualizationPickerVisible] = React.useState(false);

    const intl = useIntl();
    const userInteraction = useDashboardUserInteraction();

    const insights = useDashboardSelector(selectInsightsMap);

    const onAdd = () => {
        setVisualizationPickerVisible(!isVisualizationPickerVisible);
    };
    const onBack = () => {
        setVisualizationPickerVisible(!isVisualizationPickerVisible);
    };

    const onAdded = (insight: IInsight) => {
        onVisualizationAdd(insight);
        setVisualizationPickerVisible(false);
        userInteraction.visualizationSwitcherInteraction("visualizationSwitcherVisualizationAdded");
    };
    return isVisualizationPickerVisible ? (
        <InsightPicker onInsightSelect={onAdded} onBack={onBack} />
    ) : (
        <div className="edit-insight-config">
            <div className="insight-configuration">
                <div className="insight-configuration-panel-header">
                    <Typography tagName="h3" className="widget-title">
                        <span>
                            {intl.formatMessage({
                                id: "visualizationSwitcherToolbar.visualizationsList.header",
                            })}
                        </span>
                    </Typography>
                </div>
                <div className="insight-configuration-content">
                    {visualizations.length === 0 && (
                        <div className="no-visualizations-text">
                            {intl.formatMessage({
                                id: "visualizationSwitcherToolbar.visualizationsList.empty",
                            })}
                        </div>
                    )}
                    <div className="visualizations-list">
                        <VisualizationsList
                            visualizations={visualizations}
                            insights={insights}
                            activeVisualizationId={activeVisualizationId}
                            onVisualizationDeleted={onVisualizationDeleted}
                            onVisualizationSelect={onVisualizationSelect}
                            onVisualizationPositionChange={onVisualizationPositionChange}
                        />
                    </div>
                    <div className="horizontal-divider">
                        <div className="horizontal-divider-line" />
                    </div>
                    <Button
                        className="gd-button-link gd-icon-plus gd-add-visualization s-visualization-switcher-add-button"
                        onClick={onAdd}
                    >
                        {intl.formatMessage({ id: "visualizationSwitcherToolbar.visualizationsList.add" })}
                    </Button>
                </div>
            </div>
        </div>
    );
};
