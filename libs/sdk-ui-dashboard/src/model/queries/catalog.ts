// (C) 2022 GoodData Corporation
import { IAttribute, IMeasure, ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base";

/**
 * Query to obtain attribute catalog object according to given attribute reference.
 *
 * @public
 */
export interface QueryCatalogAttributes extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.ATTRIBUTES";
    readonly payload: {
        readonly attributesOrRefs: ObjRef[] | IAttribute[];
    };
}

export function queryCatalogAttributes(
    attributesOrRefs: ObjRef[] | IAttribute[],
    correlationId?: string,
): QueryCatalogAttributes {
    return {
        type: "GDC.DASH/QUERY.CATALOG.ATTRIBUTES",
        correlationId,
        payload: {
            attributesOrRefs,
        },
    };
}

export interface QueryCatalogFacts extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.FACTS";
    readonly payload: {
        factRefs: ObjRef[];
    };
}

export function queryCatalogFacts(factRefs: ObjRef[], correlationId?: string): QueryCatalogFacts {
    return {
        type: "GDC.DASH/QUERY.CATALOG.FACTS",
        correlationId,
        payload: {
            factRefs,
        },
    };
}

export interface QueryCatalogMeasures extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.MEASURES";
    readonly payload: {
        measuresOrRefs: ObjRef[] | IMeasure[];
    };
}

export function queryCatalogMeasures(
    measuresOrRefs: ObjRef[] | IMeasure[],
    correlationId?: string,
): QueryCatalogMeasures {
    return {
        type: "GDC.DASH/QUERY.CATALOG.MEASURES",
        correlationId,
        payload: {
            measuresOrRefs,
        },
    };
}

export interface QueryCatalogDateDatasets extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.DATE.DATASETS";
    readonly payload: {
        refs: ObjRef[];
    };
}

export function queryCatalogDateDatasets(refs: ObjRef[], correlationId?: string): QueryCatalogDateDatasets {
    return {
        type: "GDC.DASH/QUERY.CATALOG.DATE.DATASETS",
        correlationId,
        payload: {
            refs,
        },
    };
}
