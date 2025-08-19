// (C) 2022-2025 GoodData Corporation
import { IRichTextWidget, ScreenSize } from "@gooddata/sdk-model";

import { WidgetExportData } from "../../../export/index.js";

export interface IDefaultDashboardRichTextWidgetProps {
    widget: IRichTextWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;
    exportData?: WidgetExportData;
}
