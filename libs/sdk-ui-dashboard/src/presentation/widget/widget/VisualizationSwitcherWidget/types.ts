// (C) 2024 GoodData Corporation

import { IVisualizationSwitcherWidget, ScreenSize } from "@gooddata/sdk-model";
import { OnError, OnExportReady, OnLoadingChanged } from "@gooddata/sdk-ui";

export interface IDefaultDashboardVisualizationSwitcherWidgetProps {
    widget: IVisualizationSwitcherWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
}
