// (C) 2023-2025 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardQuery } from "./base.js";

/**
 * @alpha
 */
export interface QueryConnectedAttributes extends IDashboardQuery {
    type: "GDC.DASH/QUERY.CONNECTED.ATTRIBUTES";
    payload: {
        readonly ref: ObjRef;
    };
}

/**
 * Creates action through which you can query connected attributes for the information about
 * possibility of parent-child attribute filter relationship as only connected attributes may
 * be dependent on each other.
 *
 * @param ref - reference of the attribute filter display form
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns array of connected attributes for given reference
 *
 * @alpha
 */
export function queryConnectedAttributes(ref: ObjRef, correlationId?: string): QueryConnectedAttributes {
    return {
        type: "GDC.DASH/QUERY.CONNECTED.ATTRIBUTES",
        correlationId,
        payload: {
            ref,
        },
    };
}
