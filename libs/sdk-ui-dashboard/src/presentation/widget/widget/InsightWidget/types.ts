// (C) 2022 GoodData Corporation
import { IInsight, IInsightWidget, ScreenSize } from "@gooddata/sdk-model";
import { OnError, OnExportReady, OnLoadingChanged } from "@gooddata/sdk-ui";

export interface IDefaultDashboardInsightWidgetProps {
    widget: IInsightWidget;
    insight: IInsight;
    screen: ScreenSize;
    dashboardItemClasses: string;

    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
}
