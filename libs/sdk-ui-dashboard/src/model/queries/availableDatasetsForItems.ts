// (C) 2024-2026 GoodData Corporation

import { type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { type IDashboardQuery } from "./base.js";

/**
 * @internal
 */
export interface IQueryAvailableDatasetsForItems extends IDashboardQuery {
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
): IQueryAvailableDatasetsForItems {
    return {
        type: "GDC.DASH/QUERY.AVAILABLE.DATA.SETS.FOR.ITEMS",
        correlationId,
        payload: {
            items,
        },
    };
}
