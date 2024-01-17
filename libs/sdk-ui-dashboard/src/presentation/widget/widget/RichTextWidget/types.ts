// (C) 2022-2024 GoodData Corporation
import { IRichTextWidget, ScreenSize } from "@gooddata/sdk-model";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";

export interface IDefaultDashboardRichTextWidgetProps {
    widget: IRichTextWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;

    // TODO: RICH TEXT do we need loading changed, on error and so on? (probably yes once we add "variables")
    onLoadingChanged?: OnLoadingChanged;
    onError?: OnError;
}
