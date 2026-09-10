// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardQuery } from "./base.js";

/**
 * @internal
 */
export interface IQueryComputedAttributeExpression extends IDashboardQuery {
    type: "GDC.DASH/QUERY.COMPUTED.ATTRIBUTE.EXPRESSION";
    payload: {
        /**
         * Reference of the computed attribute.
         */
        readonly ref: ObjRef;
    };
}

/**
 * Creates action through which you can query the MAQL expression of a computed attribute, tokenized
 * with the referenced objects resolved to their metadata (titles) instead of raw id references.
 *
 * @param ref - computed attribute reference
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns tokenized computed attribute expression
 *
 * @internal
 */
export function queryComputedAttributeExpression(
    ref: ObjRef,
    correlationId?: string,
): IQueryComputedAttributeExpression {
    return {
        type: "GDC.DASH/QUERY.COMPUTED.ATTRIBUTE.EXPRESSION",
        correlationId,
        payload: {
            ref,
        },
    };
}
