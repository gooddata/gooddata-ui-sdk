// (C) 2007-2020 GoodData Corporation

import isEmpty from "lodash/isEmpty";

/**
 * This is common SDK-land exception.
 *
 * @public
 */
export class GoodDataSdkError extends Error {
    public readonly sdkError: boolean = true;

    constructor(public message: string, public cause?: any) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }

    /**
     * Provides description of the problem or one of {@link ErrorCodes}.
     */
    public getMessage() {
        return this.message;
    }

    /**
     * Underlying cause of this error (if any).
     */
    public getCause() {
        return this.cause;
    }
}

/**
 * Typeguard checking whether input is an instance of {@link GoodDataSdkError};
 *
 * @public
 */
export function isGoodDataSdkError(obj: any): obj is GoodDataSdkError {
    return !isEmpty(obj) && (obj as GoodDataSdkError).sdkError === true;
}

export const ErrorCodes = {
    /**
     * This error means that server could not understand the request due to invalid syntax.
     */
    BAD_REQUEST: "BAD_REQUEST",

    /**
     * This error means that you are not authorized.
     */
    UNAUTHORIZED: "UNAUTHORIZED",

    /**
     * This error means that location bucket is missing
     */
    GEO_LOCATION_MISSING: "GEO_LOCATION_MISSING",

    /**
     * This error means that mapbox token of GeoChart is missing
     */
    GEO_MAPBOX_TOKEN_MISSING: "GEO_MAPBOX_TOKEN_MISSING",

    /**
     * This error means that executed data were too large to be displayed by GoodData.UI.
     */
    DATA_TOO_LARGE_TO_DISPLAY: "DATA_TOO_LARGE_TO_DISPLAY",

    /**
     * This error means that processed request would generate a result too large to be processed
     * by GoodData platform.
     */
    DATA_TOO_LARGE_TO_COMPUTE: "DATA_TOO_LARGE_TO_COMPUTE",

    /**
     * This error means that processed result contains negative values which does not make
     * sense within the given visualization (e.g. pie chart with negative values).
     */
    NEGATIVE_VALUES: "NEGATIVE_VALUES",

    /**
     * This error means that the processed result does not contain any data.
     */
    NO_DATA: "NO_DATA",

    /**
     * This error means that requested entity (e.g. a visualization) was not found on the server.
     */
    NOT_FOUND: "NOT_FOUND",

    /**
     * This error means that requested visualization is restricted by access rules within the GoodData platform.
     * Please contact your administrator.
     */
    PROTECTED_REPORT: "PROTECTED_REPORT",

    /**
     * This error means that GoodData.UI does not know how to handle such error.
     */
    UNKNOWN_ERROR: "UNKNOWN_ERROR",

    /**
     * This error means that request has been cancelled usually after component has been unmounted.
     */
    CANCELLED: "CANCELLED",
};
