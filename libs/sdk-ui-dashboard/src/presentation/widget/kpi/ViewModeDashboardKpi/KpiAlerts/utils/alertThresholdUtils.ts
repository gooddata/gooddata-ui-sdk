// (C) 2021-2022 GoodData Corporation
import { IWidgetAlertBase } from "@gooddata/sdk-model";
import isNil from "lodash/isNil.js";
import round from "lodash/round.js";

function getNumberOfDecimalPlaces(num: number): number {
    // http://stackoverflow.com/questions/10454518/
    const match = `${num}`.match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

    if (!match) {
        return 0;
    }

    return Math.max(
        0,
        // Number of digits right of decimal point.
        (match[1] ? match[1].length : 0) -
            // Adjust for scientific notation.
            (match[2] ? +match[2] : 0),
    );
}

export function thresholdFromDecimalToPercent(threshold: number): number {
    // Convert threshold to percent (=> multiply by 100), but
    // this can cause floating point error (e.g. 4.56 * 100 = 455.99999999999994).
    // So figure out the number of decimal places specified by user,
    // multiply threshold by 100, and then round to the number of decimal places.
    const numberOfDecimalPlaces = getNumberOfDecimalPlaces(threshold);
    const numberOfWantedDecimalPlaces = Math.max(numberOfDecimalPlaces - 2, 0);

    return isNil(threshold) || isNaN(threshold) // eslint-disable-line no-restricted-globals
        ? threshold
        : round(threshold * 100, numberOfWantedDecimalPlaces);
}

export function thresholdFromPercentToDecimal(threshold: number): number {
    // Convert threshold from percent (=> divide by 100), but
    // this can cause floating point error (e.g. 4.56 / 100 = 0.045599999999999995).
    // So figure out the number of decimal places specified by user,
    // divide threshold by 100, and then round to the number of decimal places.
    const numberOfDecimalPlaces = getNumberOfDecimalPlaces(threshold);
    const numberOfWantedDecimalPlaces = Math.max(numberOfDecimalPlaces + 2, 0);

    return isNil(threshold) || isNaN(threshold) // eslint-disable-line no-restricted-globals
        ? threshold
        : round(threshold / 100, numberOfWantedDecimalPlaces);
}

function sanitizeValue(value: number) {
    return isNaN(value) ? 0 : value; // eslint-disable-line no-restricted-globals
}

export function evaluateAlertTriggered(
    kpiMeasureResult: number,
    threshold: number,
    when: IWidgetAlertBase["whenTriggered"],
): boolean {
    const sanitizedValue = sanitizeValue(kpiMeasureResult);
    const sanitizedThreshold = sanitizeValue(threshold);

    switch (when) {
        case "aboveThreshold":
            return sanitizedValue > sanitizedThreshold;
        case "underThreshold":
            return sanitizedValue < sanitizedThreshold;
        default:
            return false;
    }
}
