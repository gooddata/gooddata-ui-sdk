// (C) 2022-2024 GoodData Corporation
import { IInsight, IInsightWidget, IStackWidget, ScreenSize } from "@gooddata/sdk-model";

export interface IDefaultDashboardStackWidgetProps {
    stack: IStackWidget;
    widget?: IInsightWidget;
    insight?: IInsight;
    screen: ScreenSize;
    dashboardItemClasses: string;
}
