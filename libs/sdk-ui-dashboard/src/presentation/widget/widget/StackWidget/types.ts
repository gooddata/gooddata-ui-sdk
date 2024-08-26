// (C) 2022-2024 GoodData Corporation
import { IStackWidget, ScreenSize } from "@gooddata/sdk-model";

export interface IDefaultDashboardStackWidgetProps {
    widget: IStackWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
}
