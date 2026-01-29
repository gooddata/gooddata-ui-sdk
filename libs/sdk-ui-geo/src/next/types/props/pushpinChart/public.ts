// (C) 2025-2026 GoodData Corporation

import { type AttributeMeasureOrPlaceholder, type AttributeOrPlaceholder } from "@gooddata/sdk-ui";

import { type IGeoPushpinChartConfig } from "../../config/pushpinChart.js";
import { type IGeoSingleLayerWrapperProps } from "../shared.js";

/**
 * Shared props for {@link GeoPushpinChart} before the location is specified.
 *
 * @public
 */
export interface IGeoPushpinChartBaseProps extends IGeoSingleLayerWrapperProps {
    /**
     * Optional segment attribute that drives category legend items.
     */
    segmentBy?: AttributeOrPlaceholder;

    /**
     * Measure or attribute used for size encoding.
     */
    size?: AttributeMeasureOrPlaceholder;

    /**
     * Measure or attribute used for color encoding.
     */
    color?: AttributeMeasureOrPlaceholder;

    /**
     * Configuration specific to pushpin layers.
     */
    config?: IGeoPushpinChartConfig;
}

/**
 * Props for {@link GeoPushpinChart} in the latitude/longitude mode.
 *
 * @public
 */
export interface IGeoPushpinChartLatitudeLongitudeProps extends IGeoPushpinChartBaseProps {
    /**
     * The attribute definition or placeholder that determines the latitude of the pins.
     */
    latitude: AttributeOrPlaceholder;

    /**
     * The attribute definition or placeholder that determines the longitude of the pins.
     */
    longitude: AttributeOrPlaceholder;
}

/**
 * Props for {@link GeoPushpinChart} in the (legacy) single-attribute mode.
 *
 * @remarks
 * The `location` prop is not supported on Tiger and will fail at runtime, but is kept for backward-compatible typing.
 *
 * @public
 */
export interface IGeoPushpinChartLocationProps extends IGeoPushpinChartBaseProps {
    /**
     * The attribute definition or placeholder that determines the longitude and latitude of the pins.
     * Values expected in format lat;long.
     */
    location: AttributeOrPlaceholder;
}

/**
 * Props for {@link GeoPushpinChart}.
 *
 * @public
 */
export type IGeoPushpinChartProps = IGeoPushpinChartLocationProps | IGeoPushpinChartLatitudeLongitudeProps;
