// (C) 2025 GoodData Corporation

import { type IAttribute, type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { type IGeoPushpinChartNextConfig } from "../../config/pushpinChart.js";
import { type IGeoSingleLayerWrapperProps } from "../shared.js";

/**
 * Shared props for {@link GeoPushpinChartNext} before latitude/longitude are applied.
 *
 * @alpha
 */
export interface IGeoPushpinChartNextBaseProps extends IGeoSingleLayerWrapperProps {
    /**
     * Optional segment attribute that drives category legend items.
     */
    segmentBy?: IAttribute;

    /**
     * Measure or attribute used for size encoding.
     */
    size?: IAttributeOrMeasure;

    /**
     * Measure or attribute used for color encoding.
     */
    color?: IAttributeOrMeasure;

    /**
     * Configuration specific to pushpin layers.
     */
    config?: IGeoPushpinChartNextConfig;
}

/**
 * Props for {@link GeoPushpinChartNext}. Latitude and longitude are required.
 *
 * @alpha
 */
export interface IGeoPushpinChartNextProps extends IGeoPushpinChartNextBaseProps {
    /**
     * Attribute containing latitude values in decimal degrees.
     */
    latitude: IAttribute;

    /**
     * Attribute containing longitude values in decimal degrees.
     */
    longitude: IAttribute;
}
