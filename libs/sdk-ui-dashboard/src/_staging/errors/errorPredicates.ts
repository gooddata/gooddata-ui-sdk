// (C) 2021-2026 GoodData Corporation

import {
    isBadRequest,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isNegativeValues,
    isNoDataSdkError,
    isProtectedReport,
    isUnknownSdkError,
} from "@gooddata/sdk-ui";
import { isEmptyAfm } from "@gooddata/sdk-ui-ext";
import { combineGuards } from "@gooddata/util";

/**
 * Returns true if the provided error should prevent exports.
 *
 * @remarks Some errors are still ok with respect to exports (e.g. negative values in a pie chart) and these
 * should not prevent exports. However, errors detected by this function really make potential exports
 * nonsensical and should lead to exports being disabled.
 *
 * @internal
 */
export const isNonExportableError = combineGuards(
    isUnknownSdkError,
    isBadRequest,
    isNoDataSdkError,
    isProtectedReport,
    isDataTooLargeToCompute,
    isEmptyAfm,
);

/**
 * @internal
 */
export const isNonExportableErrorExceptTooLarge = combineGuards(
    isUnknownSdkError,
    isNoDataSdkError,
    isProtectedReport,
    isEmptyAfm,
);

/**
 * @internal
 */
export const isDataError = combineGuards(
    isUnknownSdkError,
    isBadRequest,
    isNoDataSdkError,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isProtectedReport,
    isEmptyAfm,
    isNegativeValues,
);

/**
 * @internal
 */
export const isDataErrorExceptTooLarge = combineGuards(
    isUnknownSdkError,
    isNoDataSdkError,
    isProtectedReport,
    isEmptyAfm,
    isNegativeValues,
);

/**
 * @internal
 */
export const isDataErrorTooLarge = combineGuards(isDataTooLargeToCompute, isDataTooLargeToDisplay);
