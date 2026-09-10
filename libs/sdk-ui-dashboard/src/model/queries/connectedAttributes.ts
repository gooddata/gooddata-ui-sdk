// (C) 2023-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardQuery } from "./base.js";

/**
 * @alpha
 */
export interface IQueryConnectedAttributes extends IDashboardQuery {
    type: "GDC.DASH/QUERY.CONNECTED.ATTRIBUTES";
    payload: {
        readonly ref: ObjRef;
        /**
         * Also count computed attributes among the connected attributes. The query creator
         * defaults this to false; pass the enableComputedAttributes setting of the dashboard
         * to opt in.
         */
        readonly includeComputedAttributes?: boolean;
    };
}

/**
 * Options for {@link queryConnectedAttributes}.
 *
 * @alpha
 */
export interface IQueryConnectedAttributesOptions {
    /**
     * Also count computed attributes among the connected attributes. Defaults to false.
     */
    includeComputedAttributes?: boolean;
}

/**
 * Creates action through which you can query connected attributes for the information about
 * possibility of parent-child attribute filter relationship as only connected attributes may
 * be dependent on each other.
 *
 * @param ref - reference of the attribute filter display form
 * @param options - query options
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns array of connected attributes for given reference
 *
 * @alpha
 */
export function queryConnectedAttributes(
    ref: ObjRef,
    options?: IQueryConnectedAttributesOptions,
    correlationId?: string,
): IQueryConnectedAttributes {
    return {
        type: "GDC.DASH/QUERY.CONNECTED.ATTRIBUTES",
        correlationId,
        payload: {
            ref,
            includeComputedAttributes: options?.includeComputedAttributes ?? false,
        },
    };
}
