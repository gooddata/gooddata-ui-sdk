// (C) 2019 GoodData Corporation
import isEmpty from "lodash/isEmpty";

/**
 * Superclass for all exceptions that can occur in Analytical Backend.
 * @public
 */
export abstract class AnalyticalBackendError extends Error {
    protected constructor(message: string, public readonly abeType: string, public readonly cause: Error) {
        super(message);
    }
}

/**
 * Class for exceptions that can happen while submitting execution
 * @public
 */
export class ExecutionError extends AnalyticalBackendError {
    constructor(message: string, cause: Error) {
        super(message, "EE", cause);
    }
}

/**
 * Class for exceptions that can happen while obtaining data view
 * @public
 */
export class DataViewError extends AnalyticalBackendError {
    constructor(message: string, cause: Error) {
        super(message, "DV", cause);
    }
}

/**
 * Tests whether input is an AnalyticalBackendError.
 *
 * @param obj - anything
 * @public
 */
export function isAnalyticalBackendError(obj: any): obj is AnalyticalBackendError {
    return !isEmpty(obj) && (obj as AnalyticalBackendError).abeType !== undefined;
}

/**
 * Tests whether input is an ExecutionError.
 *
 * @param obj - anything
 * @public
 */
export function isExecutionError(obj: any): obj is ExecutionError {
    return isAnalyticalBackendError(obj) && obj.abeType === "EE";
}

/**
 * Tests whether input is an DataViewError.
 *
 * @param obj - anything
 * @public
 */
export function isDataViewError(obj: any): obj is DataViewError {
    return isAnalyticalBackendError(obj) && obj.abeType === "DV";
}
