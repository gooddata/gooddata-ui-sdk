// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IInsight, type IInsightWidget, type ScreenSize } from "@gooddata/sdk-model";

import { type IRichTextInputs } from "../../../_staging/sharedHooks/useRichTextInputs.js";
import { type DescriptionExportData } from "../../export/types.js";

export interface IInsightWidgetDescriptionTriggerProps {
    widget: IInsightWidget;
    insight?: IInsight;
    screen: ScreenSize;
    exportData?: DescriptionExportData;
}

export interface IDescriptionClickTriggerProps extends IRichTextInputs {
    className: string;
    description?: string;
    onOpen?: () => void;
    useReferences?: boolean;
    LoadingComponent?: ComponentType;
    id?: string;
}
