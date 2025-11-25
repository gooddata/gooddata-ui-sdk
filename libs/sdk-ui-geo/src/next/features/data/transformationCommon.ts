// (C) 2025 GoodData Corporation

import { DataValue } from "@gooddata/sdk-model";

import { IGeoLngLat } from "../../types/shared.js";

/**
 * Converts a data value to a float.
 *
 * @internal
 */
export function dataValueAsFloat(value: DataValue): number {
    if (value === null) {
        return NaN;
    }

    const parsedNumber = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(parsedNumber)) {
        console.warn(`SDK: dataValueAsFloat: ${value} is not a number`);
    }

    return parsedNumber;
}

/**
 * Parses a location string in "lat;lng" format into coordinates.
 *
 * @internal
 */
export function getLocation(latlng: string | null): IGeoLngLat | null {
    if (!latlng) {
        return null;
    }

    const [latitude, longitude] = latlng.split(";").map(dataValueAsFloat);
    if (isNaN(latitude) || isNaN(longitude)) {
        console.warn("GeoPushpinChartNext: Invalid location format", latlng);
        return null;
    }

    return {
        lat: latitude,
        lng: longitude,
    };
}

/**
 * Parses a coordinate string into a number.
 *
 * @internal
 */
export function parseCoordinate(coordinate: string | null): number | null {
    if (!coordinate) {
        return null;
    }

    const numericalCoordinate = dataValueAsFloat(coordinate);
    if (isNaN(numericalCoordinate)) {
        console.warn("GeoPushpinChartNext: Invalid coordinate", coordinate);
        return null;
    }

    return numericalCoordinate;
}
