// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import { ObjRef, ObjRefInScope } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IDashboardWidgetProps {
    /**
     * Specify date data set to use when passing dashboard date filter to rendered visualization.
     *
     * If not provided, the date filter will not be applied
     */
    dateDataset?: ObjRef;

    /**
     * Specify what attribute filters to ignore for this widget. Those filters will not be passed to the
     * rendered visualization.
     */
    ignoredAttributeFilters?: ObjRefInScope[];

    /**
     * Callback that the component MUST call when the widget is clicked.
     */
    onWidgetClicked?: () => void;
}

export interface IDefaultDashboardWidgetProps {
    /**
     * Turn widget header on/off.
     */
    showHeader?: boolean;

    /**
     * Turn visibility of the interactions menu on/off.
     */
    showMenu?: boolean;
}

/**
 * Default implementation of the dashboard widget, includes header and menu. The widget may be configured with all
 * the information essential to resolve and pass-down filters to the actual visualization.
 *
 * @internal
 */
export const DashboardWidget: React.FC<IDashboardWidgetProps & IDefaultDashboardWidgetProps> = (
    _props: IDashboardWidgetProps & IDefaultDashboardWidgetProps,
) => {
    return null;
};

/**
 * No-nonsense implementation of the dashboard. Only includes the filter resolution logic.
 *
 * @param _props
 * @constructor
 */
export const SimpleDashboardWidget: React.FC<IDashboardWidgetProps> = (_props: IDashboardWidgetProps) => {
    return null;
};

export type DashboardWidgetComponent = ComponentType<IDashboardWidgetProps>;
