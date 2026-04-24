// (C) 2026 GoodData Corporation

import { type IdentifierRef } from "../../objRef/index.js";

/**
 * Value of a workspace parameter for a single insight execution.
 *
 * @alpha
 */
export interface IInsightParameterValue {
    /**
     * Reference to the parameter metadata object.
     */
    ref: IdentifierRef;

    /**
     * Value to use instead of the parameter's default value.
     */
    value: number;
}
