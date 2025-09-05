// (C) 2025 GoodData Corporation

import { ComponentType } from "react";

import { IInsightWidget } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IShowAsTableButtonProps {
    widget: IInsightWidget;
    isWidgetAsTable: boolean;
    onClick: () => void;
}

/**
 * @alpha
 */
export type CustomShowAsTableButtonComponent = ComponentType<IShowAsTableButtonProps>;
