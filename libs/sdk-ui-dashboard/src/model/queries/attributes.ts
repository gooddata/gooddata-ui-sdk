// (C) 2022 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base";

/**
 * @internal
 */
export interface QueryAttributeByDisplayForm extends IDashboardQuery {
    type: "GDC.DASH/QUERY.DISPLAY.FORM.ATTRIBUTE";
    payload: {
        readonly displayForms: ObjRef[];
    };
}

/**
 * Creates action through which you can query connecting attributes for the information about
 * possibility of parent-child attribute filter relationship.
 *
 * @param refs - references of the attributes
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns connecting attributes for given array of references
 *
 * @internal
 */
export function queryAttributeByDisplayForm(
    displayForms: ObjRef[],
    correlationId?: string,
): QueryAttributeByDisplayForm {
    return {
        type: "GDC.DASH/QUERY.DISPLAY.FORM.ATTRIBUTE",
        correlationId,
        payload: {
            displayForms,
        },
    };
}
