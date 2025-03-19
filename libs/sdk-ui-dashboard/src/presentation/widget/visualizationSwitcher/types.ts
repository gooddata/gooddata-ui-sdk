// (C) 2024-2025 GoodData Corporation

import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IVisualizationSwitcherWidget, ScreenSize } from "@gooddata/sdk-model";
import { OnError, OnExportReady, OnLoadingChanged } from "@gooddata/sdk-ui";
import { WidgetExportData } from "../../export/index.js";

///
/// Component props
///

/**
 * Visualization switcher widget props.
 *
 * @public
 */
export interface IDashboardVisualizationSwitcherProps {
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
     * Definition of insight widget to render.
     *
     * @public
     */
    widget: IVisualizationSwitcherWidget;

    /**
     * Identifier of visualization currently active.
     */
    activeVisualizationId?: string | undefined;

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

    /**
     * Data for export in export mode.
     *
     * @alpha
     */
    exportData?: WidgetExportData;

    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
    screen: ScreenSize;
}

///
/// Custom component types
///

/**
 * @public
 */
export type CustomDashboardVisualizationSwitcherComponent =
    ComponentType<IDashboardVisualizationSwitcherProps>;
