// (C) 2026 GoodData Corporation

import {
    type GoodDataSdkError,
    isClusteringNotReceived,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isForecastNotReceived,
    isNegativeValues,
    isNoDataSdkError,
} from "@gooddata/sdk-ui";

/**
 * Determines whether the provided error is a fatal error.
 *
 * This function evaluates the given error and checks if it is not one of the known
 * non-fatal error types, such as negative values, no data, data too large to display,
 * data too large to compute, forecast not received, or clustering not received.
 *
 * @param error - The error to evaluate.
 * @returns Returns true if the error is considered fatal, otherwise false.
 */
export function isFatalError(error?: Error | GoodDataSdkError | null) {
    return !(
        isNegativeValues(error) ||
        isNoDataSdkError(error) ||
        isDataTooLargeToDisplay(error) ||
        isDataTooLargeToCompute(error) ||
        isForecastNotReceived(error) ||
        isClusteringNotReceived(error)
    );
}

/**
 * Determines if the provided error is viewable, based on specific error conditions.
 *
 * @param error - The error object to evaluate. It can be an instance of Error, GoodDataSdkError, null, or undefined.
 * @returns Returns true if the error is viewable, otherwise false.
 */
export function isViewableError(error?: Error | GoodDataSdkError | null) {
    return isForecastNotReceived(error) || isClusteringNotReceived(error);
}
