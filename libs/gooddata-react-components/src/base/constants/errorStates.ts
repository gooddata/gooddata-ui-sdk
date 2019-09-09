// (C) 2007-2018 GoodData Corporation
export enum ErrorCodes {
    APP_NO_DATA = 1001,
    EMPTY_AFM = 1002,

    INVALID_BUCKETS = 2001,
}

export type CANCELLED = "CANCELLED";

export const ErrorStates = {
    /**
     * This error means that server could not understand the request due to invalid syntax.
     */
    BAD_REQUEST: "BAD_REQUEST",

    /**
     * This error means that you are not authorized.
     */
    UNAUTHORIZED: "UNAUTHORIZED",

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
     * This error means that empty AFM was went to the GoodData.UI and as such can't be executed.
     */
    EMPTY_AFM: "EMPTY_AFM",

    /**
     * @internal
     */
    INVALID_BUCKETS: "INVALID_BUCKETS",

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
