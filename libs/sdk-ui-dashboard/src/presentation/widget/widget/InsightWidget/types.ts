// (C) 2022-2026 GoodData Corporation

import { type IInsight, type IInsightWidget, type ScreenSize } from "@gooddata/sdk-model";
import { type OnError, type OnExportReady, type OnLoadingChanged } from "@gooddata/sdk-ui";

import { type WidgetExportData } from "../../../export/types.js";

export interface IDefaultDashboardInsightWidgetProps {
    widget: IInsightWidget;
    insight?: IInsight;
    screen: ScreenSize;
    dashboardItemClasses: string;
    exportData?: WidgetExportData;

    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
}
