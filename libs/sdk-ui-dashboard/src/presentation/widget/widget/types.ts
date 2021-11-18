// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { FilterContextItem, IAnalyticalBackend, ScreenSize } from "@gooddata/sdk-backend-spi";
import { IErrorProps, ILoadingProps, OnError } from "@gooddata/sdk-ui";

import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../../../types";
import { ObjRef, ObjRefInScope } from "@gooddata/sdk-model";
import { ExtendedDashboardWidget } from "../../../model";

/**
 * @alpha
 */
export interface IDashboardWidgetProps {
    widget?: ExtendedDashboardWidget;
    screen: ScreenSize;
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

    backend?: IAnalyticalBackend;
    workspace?: string;

    onDrill?: OnFiredDashboardViewDrillEvent;

    onError?: OnError;
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;
    /**
     * Callback that the component MUST call when the widget is clicked.
     */
    onWidgetClicked?: () => void;

    ErrorComponent?: ComponentType<IErrorProps>;
    LoadingComponent?: ComponentType<ILoadingProps>;

    /**
     * Turn widget header on/off.
     */
    showHeader?: boolean;

    /**
     * Turn visibility of the interactions menu on/off.
     */
    showMenu?: boolean;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomDashboardWidgetComponent = ComponentType<IDashboardWidgetProps>;
