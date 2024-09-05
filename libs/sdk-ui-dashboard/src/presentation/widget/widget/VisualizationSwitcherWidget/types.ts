// (C) 2024 GoodData Corporation

import { IVisualizationSwitcherWidget, ScreenSize } from "@gooddata/sdk-model";

export interface IDefaultDashboardVisualizationSwitcherWidgetProps {
    widget: IVisualizationSwitcherWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
}
