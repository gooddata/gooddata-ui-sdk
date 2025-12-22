// (C) 2025 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionConfig,
    type INullableFilter,
    type ISortItem,
    type ITheme,
} from "@gooddata/sdk-model";
import { type IVisualizationCallbacks, type IVisualizationProps } from "@gooddata/sdk-ui";

import { type CenterPositionChangedCallback, type ZoomChangedCallback } from "../common/callbacks.js";
import { type IGeoLayer } from "../layers/index.js";

/**
 * Common execution/host wiring props shared by all GeoChartNext-family components.
 *
 * @remarks
 * This type is intended for internal composition of public props interfaces and is **not** exported
 * from `@gooddata/sdk-ui-geo/next` entrypoint.
 *
 * @alpha
 */
export interface IGeoCommonExecutionProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Backend used for data execution. Falls back to BackendProvider when omitted.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace identifier. Falls back to WorkspaceProvider when omitted.
     */
    workspace?: string;

    /**
     * Filters applied to every layer execution.
     *
     * @remarks
     * These filters are treated as **global** for the whole geo visualization:
     * - They apply to the primary layer and to all additional layer executions.
     * - Layer-specific filters (`IGeoLayer.filters`) are still supported.
     * - When both are provided, these **global** filters are applied *after* layer filters and therefore
     *   take precedence for filter types with “last wins” merge rules (e.g. date filters for the same
     *   date dataset, measure value filters for the same measure). Other filter types may accumulate
     *   according to SDK merge semantics.
     */
    filters?: INullableFilter[];

    /**
     * Theme override. Defaults to the nearest ThemeProvider.
     */
    theme?: ITheme;

    /**
     * Additional execution configuration forwarded to backend.
     */
    execConfig?: IExecutionConfig;

    /**
     * Callback fired when the map center changes.
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Callback fired when map zoom changes.
     */
    onZoomChanged?: ZoomChangedCallback;
}

/**
 * Shared props for wrappers that internally construct a primary layer and allow extra layers.
 *
 * @alpha
 */
export interface IGeoSingleLayerWrapperProps extends IGeoCommonExecutionProps {
    /**
     * Sorting applied to the **primary layer** execution definition.
     */
    sortBy?: ISortItem[];

    /**
     * Layers rendered after the primary layer (e.g., overlays).
     */
    additionalLayers?: IGeoLayer[];
}
