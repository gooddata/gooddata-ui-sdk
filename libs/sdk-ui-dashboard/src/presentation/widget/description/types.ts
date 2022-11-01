// (C) 2022 GoodData Corporation
import { IInsight, IInsightWidget, ScreenSize } from "@gooddata/sdk-model";

export interface IInsightWidgetDescriptionTriggerProps {
    widget: IInsightWidget;
    insight: IInsight;
    screen: ScreenSize;
}
