// (C) 2024 GoodData Corporation

import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { FilterContextItem, IDashboardLayout, IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";
import { IErrorProps, OnError } from "@gooddata/sdk-ui";
import { IDashboardFilter, OnFiredDashboardDrillEvent, ILayoutItemPath } from "../../../types.js";
import { ExtendedDashboardLayoutWidget, ExtendedDashboardWidget } from "../../../model/index.js";

/**
 * @alpha
 */
export interface IDashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: is this necessary? (there are events for it)
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;
    onDrill?: OnFiredDashboardDrillEvent;
    onError?: OnError;
    // valid only for nested layouts
    widget?: ExtendedDashboardLayoutWidget;
    // if not provided, root layout from appState will be used
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
    // if not provided, the layout size will be considered to be default (12 columns)
    parentLayoutItemSize?: IDashboardLayoutSizeByScreenSize;
    // if not provided, the layout is expected to be root
    parentLayoutPath?: ILayoutItemPath;
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
     * Workspace where the Insight widget exists.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     *
     * @alpha
     */
    workspace?: string;

    /**
     * Height of the visualization switcher widget container.
     *
     * @alpha
     */
    clientHeight?: number;

    /**
     * Width of the visualization switcher widget container.
     *
     * @alpha
     */
    clientWidth?: number;
}

/**
 * @alpha
 */
export type CustomDashboardLayoutComponent = ComponentType<IDashboardLayoutProps>;
