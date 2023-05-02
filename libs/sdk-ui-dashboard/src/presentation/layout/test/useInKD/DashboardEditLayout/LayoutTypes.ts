// (C) 2007-2022 GoodData Corporation
import { IInsight, IKpi, ObjRef, AnalyticalWidgetType } from "@gooddata/sdk-model";

export type SdkCompliantWidgetContent = IKpi | IInsight;

export enum WidgetCategory {
    kpi = "kpi",
    insight = "insight",
    visualization = "visualization",
    widget = "widget",
}

export enum DropZoneType {
    prev = "prev",
    next = "next",
}

export enum WidgetPosition {
    prev = "prev",
    next = "next",
}

export interface IDragZoneWidget {
    dropzone: {
        widgetType: AnalyticalWidgetType;
        content?: SdkCompliantWidgetContent;
        ref?: ObjRef;
        position?: WidgetPosition;
        isInitialDropzone?: boolean;
    };
}
