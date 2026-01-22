// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import {
    type IExecutionConfig,
    type IFilter,
    type IInsight,
    type IInsightWidget,
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
    useRichText?: boolean;
    useReferences?: boolean;
    LoadingComponent?: ComponentType;
    filters?: IFilter[];
    execConfig?: IExecutionConfig;
    id?: string;
}
