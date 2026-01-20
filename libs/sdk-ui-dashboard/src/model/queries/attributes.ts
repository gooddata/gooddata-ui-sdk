// (C) 2022-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardQuery } from "./base.js";

/**
 * @alpha
 */
export interface IQueryAttributeByDisplayForm extends IDashboardQuery {
    type: "GDC.DASH/QUERY.DISPLAY.FORM.ATTRIBUTE";
    payload: {
        readonly displayForms: ObjRef[];
    };
}

/**
 * Creates action through which you can query attributes for given display forms
 *
 * @param displayForms - attribute display forms
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns attribute metadata for given display forms
 *
 * @alpha
 */
export function queryAttributeByDisplayForm(
    displayForms: ObjRef[],
    correlationId?: string,
): IQueryAttributeByDisplayForm {
    return {
        type: "GDC.DASH/QUERY.DISPLAY.FORM.ATTRIBUTE",
        correlationId,
        payload: {
            displayForms,
        },
    };
}
