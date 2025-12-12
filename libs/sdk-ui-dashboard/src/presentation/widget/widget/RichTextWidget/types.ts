// (C) 2022-2025 GoodData Corporation
import { type IRichTextWidget, type ScreenSize } from "@gooddata/sdk-model";

import { type WidgetExportData } from "../../../export/index.js";

export interface IDefaultDashboardRichTextWidgetProps {
    widget: IRichTextWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
    exportData?: WidgetExportData;
}
