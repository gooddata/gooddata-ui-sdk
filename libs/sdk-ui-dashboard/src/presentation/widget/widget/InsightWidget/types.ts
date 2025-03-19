// (C) 2022-2025 GoodData Corporation
import { IInsight, IInsightWidget, ScreenSize } from "@gooddata/sdk-model";
import { OnError, OnExportReady, OnLoadingChanged } from "@gooddata/sdk-ui";
import { WidgetExportData } from "../../../export/index.js";

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
