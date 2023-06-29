// (C) 2020-2022 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IErrorProps, ILoadingProps, OnError } from "@gooddata/sdk-ui";

import { IDashboardFilter, OnFiredDashboardDrillEvent } from "../../../types.js";
import { ObjRef, ObjRefInScope, FilterContextItem, ScreenSize } from "@gooddata/sdk-model";
import { ExtendedDashboardWidget } from "../../../model/index.js";

/**
 * Dashboard widget props.
 *
 * @remarks
 * IMPORTANT: this interface is marked as public but not all properties in it are suitable for public consumption
 * yet. Please heed the per-property API maturity annotations; the alpha level APIs may change in a breaking way
 * in the next release.
 *
 * @public
 */
export interface IDashboardWidgetProps {
    /**
     * Backend to work with.
     *
     * @remarks
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     *
     * @alpha
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the widget exists.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     *
     * @alpha
     */
    workspace?: string;

    /**
     * @public
     */
    widget?: ExtendedDashboardWidget;

    /**
     * Specify date data set to use when passing dashboard date filter to rendered visualization.
     *
     * @remarks
     * If not provided, the date filter will not be applied
     *
     * @public
     */
    dateDataset?: ObjRef;

    /**
     * Specify what attribute filters to ignore for this widget.
     *
     * @remarks
     * Those filters will not be passed to the rendered visualization.
     *
     * @public
     */
    ignoredAttributeFilters?: ObjRefInScope[];

    /**
     * Error component to use when insight rendering fails for any reason.
     *
     * @alpha
     */
    ErrorComponent: ComponentType<IErrorProps>;

    /**
     * Loading component to use while loading and preparing data to render.
     *
     * @alpha
     */
    LoadingComponent: ComponentType<ILoadingProps>;

    /**
     * @alpha
     */
    screen: ScreenSize;

    /**
     * @alpha
     */
    onDrill?: OnFiredDashboardDrillEvent;

    /**
     * @alpha
     */
    onError?: OnError;

    /**
     * @alpha
     */
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;

    /**
     * Callback that the component MUST call when the widget is clicked.
     *
     * @alpha
     */
    onWidgetClicked?: () => void;

    /**
     * Turn widget header on/off.
     *
     * @alpha
     */
    showHeader?: boolean;

    /**
     * Turn visibility of the interactions menu on/off.
     *
     * @alpha
     */
    showMenu?: boolean;
}

///
/// Custom component types
///

/**
 * @public
 */
export type CustomDashboardWidgetComponent = ComponentType<IDashboardWidgetProps>;
