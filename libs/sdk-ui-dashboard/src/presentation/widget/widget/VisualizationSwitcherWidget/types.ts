// (C) 2024-2025 GoodData Corporation

import { type IVisualizationSwitcherWidget, type ScreenSize } from "@gooddata/sdk-model";
import { type OnError, type OnExportReady, type OnLoadingChanged } from "@gooddata/sdk-ui";

import { type WidgetExportData } from "../../../export/index.js";

export interface IDefaultDashboardVisualizationSwitcherWidgetProps {
    widget: IVisualizationSwitcherWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
    exportData?: WidgetExportData;
}
