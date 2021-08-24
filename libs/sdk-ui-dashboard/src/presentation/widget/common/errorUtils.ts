// (C) 2021 GoodData Corporation
import {
    isBadRequest,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isNegativeValues,
    isNoDataSdkError,
    isProtectedReport,
    isUnknownSdkError,
} from "@gooddata/sdk-ui";
import { isEmptyAfm } from "@gooddata/sdk-ui-ext/dist/internal";
import { typesUtils } from "@gooddata/util";

/**
 * @internal
 */
export const isExportableError = typesUtils.combineGuards(
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
export const isDataError = typesUtils.combineGuards(
    isUnknownSdkError,
    isBadRequest,
    isNoDataSdkError,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isProtectedReport,
    isEmptyAfm,
    isNegativeValues,
);
