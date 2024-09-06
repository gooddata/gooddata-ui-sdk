// (C) 2024 GoodData Corporation

import { ComponentType } from "react";
import { IInsight, IInsightWidget, IVisualizationSwitcherWidget } from "@gooddata/sdk-model";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

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
}

/**
 * @alpha
 */
export type CustomVisualizationSwitcherToolbarComponent = ComponentType<IVisualizationSwitcherToolbarProps>;
