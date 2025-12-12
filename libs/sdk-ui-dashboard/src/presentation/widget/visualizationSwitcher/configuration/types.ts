// (C) 2024-2025 GoodData Corporation

import { type ComponentType } from "react";

import { type IInsight, type IInsightWidget, type IVisualizationSwitcherWidget } from "@gooddata/sdk-model";
import { type IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

/**
 * @alpha
 */
export interface IVisualizationSwitcherToolbarProps {
    widget: IVisualizationSwitcherWidget;
    onWidgetDelete: () => void;
    onVisualizationsChanged: (visualizations: IInsightWidget[]) => void;
    onVisualizationAdded: (
        insightWidget: IInsightWidget,
        insight: IInsight,
        sizeInfo: IVisualizationSizeInfo,
    ) => void;
    onSelectedVisualizationChanged: (visualizationId: string) => void;
    onClose: () => void;
}

/**
 * @alpha
 */
export type CustomVisualizationSwitcherToolbarComponent = ComponentType<IVisualizationSwitcherToolbarProps>;
