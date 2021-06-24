// (C) 2021 GoodData Corporation
import { IDashboardQuery } from "./base";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * Given a reference to an insight, this query will obtain list of all date datasets that may be used
 * to filter it.
 *
 * @internal
 */
export interface QueryDateDatasetsForInsight extends IDashboardQuery<DateDatasetsForInsight> {
    type: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS";
    payload: {
        insightRef: ObjRef;
    };
}

/**
 * Creates action through which you can query dashboard component for information about the date data sets
 * that are applicable for the provided insight.
 *
 * @param insightRef - reference to insight
 * @internal
 */
export function queryDateDatasetsForInsight(
    insightRef: ObjRef,
    correlationId?: string,
): QueryDateDatasetsForInsight {
    return {
        type: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
        correlationId,
        payload: {
            insightRef,
        },
    };
}

/**
 * @internal
 */
export type DateDatasetsForInsight = {
    data: any;
};
