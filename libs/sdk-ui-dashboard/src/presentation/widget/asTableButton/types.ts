// (C) 2025 GoodData Corporation
import { IInsightWidget } from "@gooddata/sdk-model";
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface IAsTableButtonProps {
    widget: IInsightWidget;
    isWidgetAsTable: boolean;
    onClick: () => void;
}

/**
 * @alpha
 */
export type CustomAsTableButtonComponent = ComponentType<IAsTableButtonProps>;
