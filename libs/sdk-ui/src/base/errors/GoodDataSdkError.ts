// (C) 2007-2023 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { AuthenticationFlow } from "@gooddata/sdk-backend-spi";

/**
 * Error codes recognized by the SDK.
 *
 * @public
 */
export const ErrorCodes = {
    BAD_REQUEST: "BAD_REQUEST",
    UNAUTHORIZED: "UNAUTHORIZED",
    GEO_LOCATION_MISSING: "GEO_LOCATION_MISSING",
    GEO_MAPBOX_TOKEN_MISSING: "GEO_MAPBOX_TOKEN_MISSING",
    DATA_TOO_LARGE_TO_DISPLAY: "DATA_TOO_LARGE_TO_DISPLAY",
    DATA_TOO_LARGE_TO_COMPUTE: "DATA_TOO_LARGE_TO_COMPUTE",
    NEGATIVE_VALUES: "NEGATIVE_VALUES",
    NO_DATA: "NO_DATA",
    NOT_FOUND: "NOT_FOUND",
    PROTECTED_REPORT: "PROTECTED_REPORT",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
    CANCELLED: "CANCELLED",
    DYNAMIC_SCRIPT_LOAD_ERROR: "DYNAMIC_SCRIPT_LOAD_ERROR",
    TIMEOUT_ERROR: "TIMEOUT_ERROR",
    VISUALIZATION_CLASS_UNKNOWN: "VISUALIZATION_CLASS_UNKNOWN",
};

/**
 * @public
 */
export type SdkErrorType = keyof typeof ErrorCodes;

/**
 * Base class for all anticipated GoodData.UI SDK errors.
 *
 * @public
 */
export abstract class GoodDataSdkError extends Error {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected constructor(
        public readonly seType: SdkErrorType,
        message?: string,
        public readonly cause?: any,
    ) {
        /**
         * This is here to keep exception handling in client code initially backward compatible. Previosly
         * GoodDataSdkError had the error code inside the message itself. Keeping it that way.
         *
         * Note: using || instead of ?? so that code falls back to use error type even on empty message
         */
        super(message || seType);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }

    /**
     * Provides description of the problem or one of {@link ErrorCodes}.
     */
    public getMessage(): string {
        return this.message;
    }

    /**
     * Underlying cause of this error (if any).
     */
    public getCause(): any | undefined {
        return this.cause;
    }

    /**
     * Error code for this exception.
     *
     * @remarks
     * This can be used to identify exact type of exception.
     */
    public getErrorCode(): string {
        return this.seType;
    }
}

/**
 * This error means that server could not understand the request due to invalid syntax.
 *
 * @public
 */
export class BadRequestSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.BAD_REQUEST as SdkErrorType, message, cause);
    }
}

/**
 * This error means that you are not authorized.
 *
 * @public
 */
export class UnauthorizedSdkError extends GoodDataSdkError {
    public authenticationFlow?: AuthenticationFlow;

    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.UNAUTHORIZED as SdkErrorType, message, cause);
    }
}

/**
 * This error means that location bucket is missing
 *
 * @public
 */
export class GeoLocationMissingSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.GEO_LOCATION_MISSING as SdkErrorType, message, cause);
    }
}

/**
 * This error means that mapbox token of GeoChart is missing
 *
 * @public
 */
export class GeoTokenMissingSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.GEO_MAPBOX_TOKEN_MISSING as SdkErrorType, message, cause);
    }
}

/**
 * This error means that executed data were too large to be displayed by GoodData.UI.
 *
 * @public
 */
export class DataTooLargeToDisplaySdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY as SdkErrorType, message, cause);
    }
}

/**
 * This error means that processed request would generate a result too large to be processed
 * by GoodData platform.
 *
 * @public
 */
export class DataTooLargeToComputeSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE as SdkErrorType, message, cause);
    }
}

/**
 * This error means that processed result contains negative values which does not make
 * sense within the given visualization (e.g. pie chart with negative values).
 *
 * @public
 */
export class NegativeValuesSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.NEGATIVE_VALUES as SdkErrorType, message, cause);
    }
}

/**
 * This error means that the processed result does not contain any data.
 *
 * @public
 */
export class NoDataSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.NO_DATA as SdkErrorType, message, cause);
    }
}

/**
 * This error means that requested entity (e.g. a visualization) was not found on the server.
 *
 * @public
 */
export class NotFoundSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.NO_DATA as SdkErrorType, message, cause);
    }
}

/**
 * This error means that requested visualization is restricted by access rules within the GoodData platform.
 * Please contact your administrator.
 *
 * @public
 */
export class ProtectedReportSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.PROTECTED_REPORT as SdkErrorType, message, cause);
    }
}

/**
 * This error means that GoodData.UI does not know how to handle such error.
 *
 * @public
 */
export class UnexpectedSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.UNKNOWN_ERROR as SdkErrorType, message, cause);
    }
}

/**
 * This error means that request has been cancelled usually after component has been unmounted.
 *
 * @public
 */
export class CancelledSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.CANCELLED as SdkErrorType, message, cause);
    }
}

/**
 * This error means that loading of dynamic script/plugin failed.
 *
 * @public
 */
export class DynamicScriptLoadSdkError extends GoodDataSdkError {
    constructor(message?: string, cause?: Error) {
        super(ErrorCodes.DYNAMIC_SCRIPT_LOAD_ERROR as SdkErrorType, message, cause);
    }
}

//
//
//

/**
 * Typeguard checking whether input is an instance of {@link GoodDataSdkError};
 *
 * @public
 */
export function isGoodDataSdkError(obj: unknown): obj is GoodDataSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType !== undefined;
}

/**
 * Typeguard checking whether input is an instance of {@link BadRequestSdkError};
 *
 * @public
 */
export function isBadRequest(obj: unknown): obj is BadRequestSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "BAD_REQUEST";
}

/**
 * Typeguard checking whether input is an instance of {@link UnauthorizedSdkError};
 *
 * @public
 */
export function isUnauthorized(obj: unknown): obj is UnauthorizedSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "UNAUTHORIZED";
}

/**
 * Typeguard checking whether input is an instance of {@link GeoLocationMissingSdkError};
 *
 * @public
 */
export function isGeoLocationMissing(obj: unknown): obj is GeoLocationMissingSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "GEO_LOCATION_MISSING";
}

/**
 * Typeguard checking whether input is an instance of {@link GeoTokenMissingSdkError};
 *
 * @public
 */
export function isGeoTokenMissing(obj: unknown): obj is GeoTokenMissingSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "GEO_MAPBOX_TOKEN_MISSING";
}

/**
 * Typeguard checking whether input is an instance of {@link DataTooLargeToDisplaySdkError};
 *
 * @public
 */
export function isDataTooLargeToDisplay(obj: unknown): obj is DataTooLargeToDisplaySdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "DATA_TOO_LARGE_TO_DISPLAY";
}

/**
 * Typeguard checking whether input is an instance of {@link DataTooLargeToComputeSdkError};
 *
 * @public
 */
export function isDataTooLargeToCompute(obj: unknown): obj is DataTooLargeToComputeSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "DATA_TOO_LARGE_TO_COMPUTE";
}

/**
 * Typeguard checking whether input is an instance of {@link NegativeValuesSdkError};
 *
 * @public
 */
export function isNegativeValues(obj: unknown): obj is NegativeValuesSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "NEGATIVE_VALUES";
}

/**
 * Typeguard checking whether input is an instance of {@link NoDataSdkError};
 *
 * @public
 */
export function isNoDataSdkError(obj: unknown): obj is NoDataSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "NO_DATA";
}

/**
 * Typeguard checking whether input is an instance of {@link NotFoundSdkError};
 *
 * @public
 */
export function isNotFound(obj: unknown): obj is NotFoundSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "NOT_FOUND";
}

/**
 * Typeguard checking whether input is an instance of {@link ProtectedReportSdkError};
 *
 * @public
 */
export function isProtectedReport(obj: unknown): obj is ProtectedReportSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "PROTECTED_REPORT";
}

/**
 * Typeguard checking whether input is an instance of {@link UnexpectedSdkError};
 *
 * @public
 */
export function isUnknownSdkError(obj: unknown): obj is UnexpectedSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "UNKNOWN_ERROR";
}

/**
 * Typeguard checking whether input is an instance of {@link CancelledSdkError};
 *
 * @public
 */
export function isCancelledSdkError(obj: unknown): obj is CancelledSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "CANCELLED";
}

/**
 * Typeguard checking whether input is an instance of {@link DynamicScriptLoadSdkError};
 *
 * @public
 */
export function isDynamicScriptLoadSdkError(obj: unknown): obj is DynamicScriptLoadSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).seType === "DYNAMIC_SCRIPT_LOAD_ERROR";
}
