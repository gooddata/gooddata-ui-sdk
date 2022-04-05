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

/**
 * Query creator for {@link QueryCatalogAttributes} query.
 *
 * @param attributeRefs - references of attributes to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogAttributes}
 *
 * @public
 */
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

/**
 * Query to obtain fact catalog objects according to given fact references
 *
 * @public
 */
export interface QueryCatalogFacts extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.FACTS";
    readonly payload: {
        factRefs: ObjRef[];
    };
}

/**
 * Query creator for {@link QueryCatalogFacts} query.
 *
 * @param factRefs - references of facts to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogFacts}
 *
 * @public
 */
export function queryCatalogFacts(factRefs: ObjRef[], correlationId?: string): QueryCatalogFacts {
    return {
        type: "GDC.DASH/QUERY.CATALOG.FACTS",
        correlationId,
        payload: {
            factRefs,
        },
    };
}

/**
 * Query to obtain measure catalog items according to given measure references.
 *
 * @public
 */
export interface QueryCatalogMeasures extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.MEASURES";
    readonly payload: {
        measureRefs: ObjRef[];
    };
}

/**
 * Query creator for {@link QueryCatalogMeasures} query.
 *
 * @param measureRefs - references of measures to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogMeasures}
 *
 * @public
 */
export function queryCatalogMeasures(measureRefs: ObjRef[], correlationId?: string): QueryCatalogMeasures {
    return {
        type: "GDC.DASH/QUERY.CATALOG.MEASURES",
        correlationId,
        payload: {
            measureRefs,
        },
    };
}

/**
 * Query to obtain date dataset catalog items according to given references.
 *
 * @public
 */
export interface QueryCatalogDateDatasets extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.DATE.DATASETS";
    readonly payload: {
        refs: ObjRef[];
    };
}

/**
 * Query creator for {@link QueryCatalogDateDatasets} query.
 *
 * @param refs - references of objects to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogDateDatasets}
 *
 * @public
 */
export function queryCatalogDateDatasets(refs: ObjRef[], correlationId?: string): QueryCatalogDateDatasets {
    return {
        type: "GDC.DASH/QUERY.CATALOG.DATE.DATASETS",
        correlationId,
        payload: {
            refs,
        },
    };
}

/**
 * Query to obtain date attribute catalog items according to given references.
 *
 * @public
 */
export interface QueryCatalogDateAttributes extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.DATE.ATTRIBUTES";
    readonly payload: {
        refs: ObjRef[];
    };
}

/**
 * Query creator for {@link QueryCatalogDateAttributes} query.
 *
 * @param refs - references of objects to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogDateAttributes}
 *
 * @public
 */
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
