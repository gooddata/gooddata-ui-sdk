// (C) 2025 GoodData Corporation

import { isEmpty } from "lodash-es";

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

import { IGeoPushpinChartNextConfig } from "./config.js";
import { CenterPositionChangedCallback, ZoomChangedCallback } from "./shared.js";

/**
 * @alpha
 */
export interface IGeoPushpinChartNextBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Backend to execute against
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to execute in
     */
    workspace?: string;

    /**
     * Specifies how to segment data (color)
     */
    segmentBy?: IAttribute;

    /**
     * Specifies the measure that determines the size of the pins
     */
    size?: IAttributeOrMeasure;

    /**
     * Specifies the measure that determines color of the pins
     */
    color?: IAttributeOrMeasure;

    /**
     * Specifies filters to apply to the data
     */
    filters?: INullableFilter[];

    /**
     * Specifies how to sort the data
     */
    sortBy?: ISortItem[];

    /**
     * Specifies the theme to use for the chart
     */
    theme?: ITheme;

    /**
     * Geo-specific configuration
     */
    config?: IGeoPushpinChartNextConfig;

    /**
     * Execution configuration
     */
    execConfig?: IExecutionConfig;

    /**
     * Called when map center position changes
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Called when map zoom changes
     */
    onZoomChanged?: ZoomChangedCallback;
}

/**
 * @alpha
 */
export interface IGeoPushpinChartNextLocationProps extends IGeoPushpinChartNextBaseProps {
    location: IAttribute;
}

/**
 * @alpha
 */
export function isGeoPushpinChartNextLocationProps(
    props: IGeoPushpinChartNextProps,
): props is IGeoPushpinChartNextLocationProps {
    return !isEmpty(props) && "location" in props;
}

/**
 * @alpha
 */
export interface IGeoPushpinChartNextLatitudeLongitudeProps extends IGeoPushpinChartNextBaseProps {
    latitude: IAttribute;
    longitude: IAttribute;
}

/**
 * @alpha
 */
export function isGeoPushpinChartNextLatitudeLongitudeProps(
    props: IGeoPushpinChartNextProps,
): props is IGeoPushpinChartNextLatitudeLongitudeProps {
    return !isEmpty(props) && "latitude" in props && "longitude" in props;
}

/**
 * @alpha
 */
export type IGeoPushpinChartNextProps =
    | IGeoPushpinChartNextLocationProps
    | IGeoPushpinChartNextLatitudeLongitudeProps;
