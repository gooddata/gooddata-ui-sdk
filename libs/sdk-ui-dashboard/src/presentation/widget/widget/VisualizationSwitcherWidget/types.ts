// (C) 2024-2025 GoodData Corporation

import { IVisualizationSwitcherWidget, ScreenSize } from "@gooddata/sdk-model";
import { OnError, OnExportReady, OnLoadingChanged } from "@gooddata/sdk-ui";
import { WidgetExportData } from "../../../export/index.js";

export interface IDefaultDashboardVisualizationSwitcherWidgetProps {
    widget: IVisualizationSwitcherWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
    exportData?: WidgetExportData;
}
