// (C) 2025-2026 GoodData Corporation

import { type AttributeMeasureOrPlaceholder, type AttributeOrPlaceholder } from "@gooddata/sdk-ui";

import { type IGeoAreaChartConfig } from "../../config/areaChart.js";
import { type IGeoSingleLayerWrapperProps } from "../shared.js";

/**
 * Shared props for {@link GeoAreaChart} before the required area attribute is applied.
 *
 * @public
 */
export interface IGeoAreaChartBaseProps extends IGeoSingleLayerWrapperProps {
    /**
     * Measure or attribute used for color encoding.
     */
    color?: AttributeMeasureOrPlaceholder;

    /**
     * Optional segment attribute that drives category legend items.
     */
    segmentBy?: AttributeOrPlaceholder;

    /**
     * Configuration specific to area layers.
     */
    config?: IGeoAreaChartConfig;
}

/**
 * Props for {@link GeoAreaChart}. The `area` attribute is required.
 *
 * @public
 */
export interface IGeoAreaChartProps extends IGeoAreaChartBaseProps {
    /**
     * Attribute containing area identifiers (country, state, region, ...).
     */
    area: AttributeOrPlaceholder;
}
