// (C) 2025-2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IExecutionConfig, type ITheme } from "@gooddata/sdk-model";
import {
    type IVisualizationCallbacks,
    type IVisualizationProps,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
} from "@gooddata/sdk-ui";

import {
    type CenterPositionChangedCallback,
    type ZoomChangedCallback,
} from "../../../publicTypes/geoCommon.js";
import { type IGeoLayer } from "../layers/index.js";

/**
 * Common execution/host wiring props shared by all GeoChart-family components.
 *
 * @public
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
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     *
     * @remarks
     * Required only when using composed placeholders.
     */
    placeholdersResolutionContext?: object;

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
 * @public
 */
export interface IGeoSingleLayerWrapperProps extends IGeoCommonExecutionProps {
    /**
     * Sorting applied to the **primary layer** execution definition.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Layers rendered after the primary layer (e.g., overlays).
     */
    additionalLayers?: IGeoLayer[];
}
