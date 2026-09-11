// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import {
    type IExecutionConfig,
    type IFilter,
    type IInsight,
    type IInsightWidget,
    type ObjRef,
    type ScreenSize,
} from "@gooddata/sdk-model";

import { type DescriptionExportData } from "../../export/types.js";

export interface IInsightWidgetDescriptionTriggerProps {
    widget: IInsightWidget;
    insight?: IInsight;
    screen: ScreenSize;
    exportData?: DescriptionExportData;
}

export interface IDescriptionClickTriggerProps {
    className: string;
    description?: string;
    onOpen?: () => void;
    useReferences?: boolean;
    LoadingComponent?: ComponentType;
    filters?: IFilter[];
    restrictedReferences?: ObjRef[];
    execConfig?: IExecutionConfig;
    id?: string;
}
