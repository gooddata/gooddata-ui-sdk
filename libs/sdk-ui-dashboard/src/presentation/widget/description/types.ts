// (C) 2022-2025 GoodData Corporation
import { IExecutionConfig, IFilter, IInsight, IInsightWidget, ScreenSize } from "@gooddata/sdk-model";
import React from "react";

import { DescriptionExportData } from "../../export/index.js";

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
    LoadingComponent?: React.ComponentType;
    filters?: IFilter[];
    execConfig?: IExecutionConfig;
}
