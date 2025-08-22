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
    /**
     * Optional ref to the target visualization container element for focus management.
     * When provided, focus will move to the first focusable element within the target
     * visualization when the show-as-table state changes, simulating natural tab navigation.
     */
    focusTargetRef?: React.RefObject<HTMLElement>;
}

/**
 * @alpha
 */
export type CustomShowAsTableButtonComponent = ComponentType<IShowAsTableButtonProps>;
