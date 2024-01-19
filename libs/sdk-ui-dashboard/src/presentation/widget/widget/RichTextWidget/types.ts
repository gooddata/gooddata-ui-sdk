// (C) 2022-2024 GoodData Corporation
import { IRichTextWidget, ScreenSize } from "@gooddata/sdk-model";

export interface IDefaultDashboardRichTextWidgetProps {
    widget: IRichTextWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
}
