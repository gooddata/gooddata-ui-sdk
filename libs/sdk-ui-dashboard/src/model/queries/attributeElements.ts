// (C) 2023 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base.js";

/**
 * @internal
 */
export interface QueryAttributeElements extends IDashboardQuery {
    type: "GDC.DASH/QUERY.ELEMENTS.ATTRIBUTE";
    payload: {
        /**
         * Display form of the attribute filter.
         */
        readonly displayForm: ObjRef;

        /**
         * Desired max number of elements to retrieve; must be a positive number
         */
        readonly limit?: number;
    };
}

/**
 * Creates action through which you can query attribute elements for given display form
 *
 * @param displayForm - attribute display form
 * @param limit - desired max number of elements to retrieve
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns attribute elements for given display form
 *
 * @internal
 */
export function queryAttributeElements(
    displayForm: ObjRef,
    limit?: number,
    correlationId?: string,
): QueryAttributeElements {
    return {
        type: "GDC.DASH/QUERY.ELEMENTS.ATTRIBUTE",
        correlationId,
        payload: {
            displayForm,
            limit,
        },
    };
}
