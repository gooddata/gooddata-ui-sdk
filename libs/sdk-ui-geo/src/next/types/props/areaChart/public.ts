// (C) 2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    IAttributeOrMeasure,
    IExecutionConfig,
    INullableFilter,
    ISortItem,
    ITheme,
} from "@gooddata/sdk-model";
import { IVisualizationCallbacks, IVisualizationProps } from "@gooddata/sdk-ui";

import { CenterPositionChangedCallback, ZoomChangedCallback } from "../../common/callbacks.js";
import { IGeoAreaChartConfig } from "../../config/areaChart.js";
import { IGeoLayer } from "../../layers/index.js";

/**
 * Shared props for {@link GeoAreaChart} before the required area attribute is applied.
 *
 * @alpha
 */
export interface IGeoAreaChartBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Backend used for data execution. Falls back to BackendProvider.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace identifier. Falls back to WorkspaceProvider.
     */
    workspace?: string;

    /**
     * Measure or attribute used for color encoding.
     */
    color?: IAttributeOrMeasure;

    /**
     * Optional segment attribute that drives category legend items.
     */
    segmentBy?: IAttribute;

    /**
     * Filters applied to the execution.
     */
    filters?: INullableFilter[];

    /**
     * Sorting applied to the execution definition.
     */
    sortBy?: ISortItem[];

    /**
     * Theme override. Defaults to ThemeProvider.
     */
    theme?: ITheme;

    /**
     * Configuration specific to area layers.
     */
    config?: IGeoAreaChartConfig;

    /**
     * Additional execution configuration forwarded to backend.
     */
    execConfig?: IExecutionConfig;

    /**
     * Callback fired when map center changes.
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Callback fired when zoom level changes.
     */
    onZoomChanged?: ZoomChangedCallback;

    /**
     * Layers rendered after the primary area layer (e.g., pushpins).
     */
    additionalLayers?: IGeoLayer[];
}

/**
 * Props for {@link GeoAreaChart}. The `area` attribute is required.
 *
 * @alpha
 */
export interface IGeoAreaChartProps extends IGeoAreaChartBaseProps {
    /**
     * Attribute containing area identifiers (country, state, region, ...).
     */
    area: IAttribute;
}
