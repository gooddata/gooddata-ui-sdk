// (C) 2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base";

/**
 * Query to obtain attribute catalog object according to given attribute reference.
 *
 * @public
 */
export interface QueryCatalogAttributes extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.ATTRIBUTES";
    readonly payload: {
        readonly attributeRefs: ObjRef[];
    };
}

export function queryCatalogAttributes(
    attributeRefs: ObjRef[],
    correlationId?: string,
): QueryCatalogAttributes {
    return {
        type: "GDC.DASH/QUERY.CATALOG.ATTRIBUTES",
        correlationId,
        payload: {
            attributeRefs,
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
        measureRefs: ObjRef[];
    };
}

export function queryCatalogMeasures(measureRefs: ObjRef[], correlationId?: string): QueryCatalogMeasures {
    return {
        type: "GDC.DASH/QUERY.CATALOG.MEASURES",
        correlationId,
        payload: {
            measureRefs,
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

export interface QueryCatalogDateAttributes extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.DATE.ATTRIBUTES";
    readonly payload: {
        refs: ObjRef[];
    };
}

export function queryCatalogDateAttributes(
    refs: ObjRef[],
    correlationId?: string,
): QueryCatalogDateAttributes {
    return {
        type: "GDC.DASH/QUERY.CATALOG.DATE.ATTRIBUTES",
        correlationId,
        payload: {
            refs,
        },
    };
}
