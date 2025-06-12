// (C) 2025 GoodData Corporation
import { IInsightWidget } from "@gooddata/sdk-model";
import { ComponentType } from "react";

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
