// (C) 2025 GoodData Corporation

import { type IAttribute, type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { type IGeoAreaChartConfig } from "../../config/areaChart.js";
import { type IGeoSingleLayerWrapperProps } from "../shared.js";

/**
 * Shared props for {@link GeoAreaChart} before the required area attribute is applied.
 *
 * @alpha
 */
export interface IGeoAreaChartBaseProps extends IGeoSingleLayerWrapperProps {
    /**
     * Measure or attribute used for color encoding.
     */
    color?: IAttributeOrMeasure;

    /**
     * Optional segment attribute that drives category legend items.
     */
    segmentBy?: IAttribute;

    /**
     * Configuration specific to area layers.
     */
    config?: IGeoAreaChartConfig;
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
