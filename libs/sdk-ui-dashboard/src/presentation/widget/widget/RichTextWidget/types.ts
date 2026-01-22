// (C) 2022-2026 GoodData Corporation

import { type IRichTextWidget, type ScreenSize } from "@gooddata/sdk-model";

import { type WidgetExportData } from "../../../export/types.js";

export interface IDefaultDashboardRichTextWidgetProps {
    widget: IRichTextWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
    exportData?: WidgetExportData;
}
