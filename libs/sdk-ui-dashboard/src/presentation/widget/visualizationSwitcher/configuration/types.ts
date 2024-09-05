// (C) 2024 GoodData Corporation

import { IInsightWidget, IVisualizationSwitcherWidget } from "@gooddata/sdk-model";
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface IVisualizationSwitcherToolbarProps {
    widget: IVisualizationSwitcherWidget;
    onWidgetDelete: () => void;
    onVisualizationsChanged: (visualizations: IInsightWidget[]) => void;
    onVisualizationAdded: (insightWidget: IInsightWidget, sizeInfo: any) => void; // TODO INE any
}

/**
 * @alpha
 */
export type CustomVisualizationSwitcherToolbarComponent = ComponentType<IVisualizationSwitcherToolbarProps>;
