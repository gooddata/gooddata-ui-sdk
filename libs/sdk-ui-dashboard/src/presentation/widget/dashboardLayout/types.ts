// (C) 2024-2025 GoodData Corporation

import { type ComponentType } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IDashboardLayout,
    type IDashboardLayoutSizeByScreenSize,
} from "@gooddata/sdk-model";
import { type IErrorProps, type OnError } from "@gooddata/sdk-ui";

import { type ExtendedDashboardLayoutWidget, type ExtendedDashboardWidget } from "../../../model/index.js";
import {
    type IDashboardFilter,
    type ILayoutItemPath,
    type OnFiredDashboardDrillEvent,
} from "../../../types.js";

/**
 * @alpha
 */
export interface INestedLayoutProps {
    /**
     * Nested layout widget to render.
     */
    widget?: ExtendedDashboardLayoutWidget;
    /**
     * Corresponding layout.
     * If not provided, root layout from appState will be used.
     */
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
    /**
     * Item size.
     * If not provided, the layout size will be considered to be default (12 columns)
     */
    parentLayoutItemSize?: IDashboardLayoutSizeByScreenSize;
    /**
     * Item path.
     * If not provided, the layout is expected to be root
     */
    parentLayoutPath?: ILayoutItemPath;
    /**
     * CSS classes to apply to the nested layout dashboard item.
     */
    dashboardItemClasses?: string;
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
export interface IDashboardLayoutProps extends INestedLayoutProps {
    ErrorComponent?: ComponentType<IErrorProps>;
    // TODO: is this necessary? (there are events for it)
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;
    onDrill?: OnFiredDashboardDrillEvent;
    onError?: OnError;
}

/**
 * @alpha
 */
export type CustomDashboardLayoutComponent = ComponentType<IDashboardLayoutProps>;
