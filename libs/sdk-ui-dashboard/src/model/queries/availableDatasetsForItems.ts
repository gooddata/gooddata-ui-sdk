// (C) 2024-2025 GoodData Corporation
import { IAttributeOrMeasure } from "@gooddata/sdk-model";

import { IDashboardQuery } from "./base.js";

/**
 * @internal
 */
export interface QueryAvailableDatasetsForItems extends IDashboardQuery {
    type: "GDC.DASH/QUERY.AVAILABLE.DATA.SETS.FOR.ITEMS";
    payload: {
        readonly items: IAttributeOrMeasure[];
    };
}

/**
 * Creates action through which you can query available data sets data set for given item
 *
 * @param items - attribute or measure
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns attribute data set for given display form
 *
 * @internal
 */
export function queryAvailableDatasetsForItems(
    items: IAttributeOrMeasure[],
    correlationId?: string,
): QueryAvailableDatasetsForItems {
    return {
        type: "GDC.DASH/QUERY.AVAILABLE.DATA.SETS.FOR.ITEMS",
        correlationId,
        payload: {
            items,
        },
    };
}
