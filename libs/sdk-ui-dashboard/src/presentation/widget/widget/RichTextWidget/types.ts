// (C) 2022-2024 GoodData Corporation
import { IRichTextWidget, ScreenSize } from "@gooddata/sdk-model";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";

export interface IDefaultDashboardRichTextWidgetProps {
    widget: IRichTextWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;

    onLoadingChanged?: OnLoadingChanged;
    onError?: OnError;
}
