// (C) 2025 GoodData Corporation

import { type DataValue } from "@gooddata/sdk-model";

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
        return null;
    }

    return numericalCoordinate;
}
