// (C) 2021 GoodData Corporation
import { IDashboardQuery } from "./base";
import { InsightDisplayFormUsage, ObjRef } from "@gooddata/sdk-model";
import { IAttributeDisplayFormMetadataObject, IAttributeMetadataObject } from "@gooddata/sdk-backend-spi";

/**
 * Given a reference to an insight, this query will obtain list of all date datasets that may be used
 * to filter it.
 *
 * @internal
 */
export interface QueryInsightDateDatasets extends IDashboardQuery<InsightDateDatasets> {
    readonly type: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS";
    readonly payload: {
        readonly insightRef: ObjRef;
    };
}

/**
 * Creates action through which you can query dashboard component for information about the date data sets
 * that are applicable for the provided insight.
 *
 * @param insightRef - reference to insight
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @internal
 */
export function queryDateDatasetsForInsight(
    insightRef: ObjRef,
    correlationId?: string,
): QueryInsightDateDatasets {
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
export type InsightDateDatasets = {
    data: any;
};

//
//
//

/**
 * Given a reference to an insight, this query will obtain metadata about the display forms used in the
 * insight. For each display form, the result will also contain attribute to which the display form
 * belongs.
 *
 * @internal
 */
export interface QueryInsightAttributesMeta extends IDashboardQuery<InsightAttributesMeta> {
    readonly type: "GDC.DASH/QUERY.INSIGHT.ATTRIBUTE.META";
    readonly payload: {
        readonly insightRef: ObjRef;
    };
}

/**
 * @internal
 */
export type InsightAttributesMeta = {
    /**
     * High-level break down of how different display forms are used in the insight.
     */
    usage: InsightDisplayFormUsage;

    /**
     * Mapping of (serialized) display form ref to metadata about the display form. The insight uses these
     * display forms for slicing, dicing and filtering the results.
     */
    displayForms: Record<string, IAttributeDisplayFormMetadataObject>;

    /**
     * Mapping of (serialized) attribute ref to metadata about the attribute.
     */
    attributes: Record<string, IAttributeMetadataObject>;
};

/**
 * Creates action thought which you can query dashboard component for information about display forms and
 * attributes used by an insight.
 *
 * @param insightRef - reference to insight
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @internal
 */
export function queryInsightAttributesMeta(
    insightRef: ObjRef,
    correlationId?: string,
): QueryInsightAttributesMeta {
    return {
        type: "GDC.DASH/QUERY.INSIGHT.ATTRIBUTE.META",
        correlationId,
        payload: {
            insightRef,
        },
    };
}
