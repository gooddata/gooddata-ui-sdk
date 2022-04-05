// (C) 2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base";

/**
 * Payload for {@link QueryCatalogAttributes}
 *
 * @public
 */
export interface QueryCatalogAttributesPayload {
    /**
     * References of facts to obtain.
     */
    readonly refs: ObjRef[];
}

/**
 * Query to obtain attribute catalog object according to given attribute reference.
 *
 * @public
 */
export interface QueryCatalogAttributes extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.ATTRIBUTES";
    readonly payload: QueryCatalogAttributesPayload;
}

/**
 * Query creator for {@link QueryCatalogAttributes} query.
 *
 * @param refs - references of attributes to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogAttributes}
 *
 * @public
 */
export function queryCatalogAttributes(refs: ObjRef[], correlationId?: string): QueryCatalogAttributes {
    return {
        type: "GDC.DASH/QUERY.CATALOG.ATTRIBUTES",
        correlationId,
        payload: {
            refs,
        },
    };
}

/**
 * Payload for {@link QueryCatalogFacts}.
 *
 * @public
 */
export interface QueryCatalogFactsPayload {
    /**
     * References of facts to obtain.
     */
    refs: ObjRef[];
}

/**
 * Query to obtain fact catalog objects according to given fact references
 *
 * @public
 */
export interface QueryCatalogFacts extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.FACTS";
    readonly payload: QueryCatalogFactsPayload;
}

/**
 * Query creator for {@link QueryCatalogFacts} query.
 *
 * @param refs - references of facts to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogFacts}
 *
 * @public
 */
export function queryCatalogFacts(refs: ObjRef[], correlationId?: string): QueryCatalogFacts {
    return {
        type: "GDC.DASH/QUERY.CATALOG.FACTS",
        correlationId,
        payload: {
            refs,
        },
    };
}

/**
 * Payload for {@link QueryCatalogMeasures}
 *
 * @public
 */
export interface QueryCatalogMeasuresPayload {
    /**
     * References of measures to obtain.
     */
    refs: ObjRef[];
}

/**
 * Query to obtain measure catalog items according to given measure references.
 *
 * @public
 */
export interface QueryCatalogMeasures extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.MEASURES";
    readonly payload: QueryCatalogMeasuresPayload;
}

/**
 * Query creator for {@link QueryCatalogMeasures} query.
 *
 * @param refs - references of measures to query
 * @param correlationId - correlation id
 * @returns {@link QueryCatalogMeasures}
 *
 * @public
 */
export function queryCatalogMeasures(refs: ObjRef[], correlationId?: string): QueryCatalogMeasures {
    return {
        type: "GDC.DASH/QUERY.CATALOG.MEASURES",
        correlationId,
        payload: {
            refs,
        },
    };
}

/**
 * Payload for {@link QueryCatalogDateDatasets}
 *
 * @public
 */
export interface QueryCatalogDateDatasetsPayload {
    /**
     * References of objects you want to obtain date datasets for.
     */
    refs: ObjRef[];
}

/**
 * Query to obtain date dataset catalog items according to given references.
 *
 * @public
 */
export interface QueryCatalogDateDatasets extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.DATE.DATASETS";
    readonly payload: QueryCatalogDateDatasetsPayload;
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
 * Payload for {@link QueryCatalogDateAttributes}
 *
 * @public
 */
export interface QueryCatalogDateAttributesPayload {
    /**
     * References of objects you want to obtain date dataset's attributes for.
     */
    refs: ObjRef[];
}

/**
 * Query to obtain date attribute catalog items according to given references.
 *
 * @public
 */
export interface QueryCatalogDateAttributes extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.CATALOG.DATE.ATTRIBUTES";
    readonly payload: QueryCatalogDateAttributesPayload;
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
