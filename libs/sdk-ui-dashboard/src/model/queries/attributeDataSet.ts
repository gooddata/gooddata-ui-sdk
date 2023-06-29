// (C) 2023 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base.js";

/**
 * @internal
 */
export interface QueryAttributeDataSet extends IDashboardQuery {
    type: "GDC.DASH/QUERY.DATA.SET.ATTRIBUTE";
    payload: {
        /**
         * Display form of the attribute filter.
         */
        readonly displayForm: ObjRef;
    };
}

/**
 * Creates action through which you can query attribute data set for given display form
 *
 * @param displayForm - attribute display form
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns attribute data set for given display form
 *
 * @internal
 */
export function queryAttributeDataSet(displayForm: ObjRef, correlationId?: string): QueryAttributeDataSet {
    return {
        type: "GDC.DASH/QUERY.DATA.SET.ATTRIBUTE",
        correlationId,
        payload: {
            displayForm,
        },
    };
}
