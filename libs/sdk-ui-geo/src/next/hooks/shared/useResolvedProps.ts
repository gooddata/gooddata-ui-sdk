// (C) 2025 GoodData Corporation

import { useResolvedPlaceholderValues } from "./useResolvedPlaceholderValues.js";
import { IGeoPushpinChartNextResolvedProps } from "../../types/internal.js";
import {
    IGeoPushpinChartNextProps,
    isGeoPushpinChartNextLatitudeLongitudeProps,
} from "../../types/public.js";

/**
 * Resolves placeholders in GeoPushpinChartNext props and returns strongly-typed props.
 *
 * @remarks
 * This hook resolves all placeholder values in location, size, color, segmentBy, filters,
 * and sortBy props using the provided placeholdersResolutionContext.
 *
 * @param props - Component props potentially containing placeholders
 * @returns Props with all placeholders resolved
 *
 * @alpha
 */
export function useResolvedProps(props: IGeoPushpinChartNextProps): IGeoPushpinChartNextResolvedProps {
    const isLatLngMode = isGeoPushpinChartNextLatitudeLongitudeProps(props);

    const [location, latitude, longitude, segmentBy, size, color, filters, sortBy] =
        useResolvedPlaceholderValues([
            isLatLngMode ? undefined : props.location,
            isLatLngMode ? props.latitude : undefined,
            isLatLngMode ? props.longitude : undefined,
            props.segmentBy,
            props.size,
            props.color,
            props.filters,
            props.sortBy,
        ]);

    return {
        ...props,
        location,
        latitude,
        longitude,
        segmentBy,
        size,
        color,
        filters,
        sortBy,
    };
}
