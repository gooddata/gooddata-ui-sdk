// (C) 2021-2022 GoodData Corporation
import { IDashboardQuery } from "./base.js";
import {
    IInsight,
    InsightDisplayFormUsage,
    ObjRef,
    ICatalogDateDataset,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
} from "@gooddata/sdk-model";

/**
 * Given a reference to an insight, this query will obtain list of all date datasets that may be used
 * to filter it.
 *
 * @alpha
 */
export interface QueryInsightDateDatasets extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS";
    readonly payload: {
        readonly insightOrRef: ObjRef | IInsight;
    };
}

/**
 * Creates action through which you can query dashboard component for information about the date data sets
 * that are applicable for the provided insight.
 *
 * @param insightOrRef - insight body or a reference to an insight. if the reference is provided, then it is expected
 *  to be a reference of an insight that is already placed on a dashboard
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function queryDateDatasetsForInsight(
    insightOrRef: ObjRef | IInsight,
    correlationId?: string,
): QueryInsightDateDatasets {
    return {
        type: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
        correlationId,
        payload: {
            insightOrRef,
        },
    };
}

/**
 * The insight date datasets is a digest of information related to what date datasets are used by the insight and
 * what date datasets are also relevant to the insight.
 *
 * @remarks
 * The relevancy of date datasets is determined by relation of the entities used by the insight (facts, metric, attributes)
 * and the data datasets in the workspace's LDM.
 *
 * The data included herein can be used to select an appropriate date dataset to filter the insight on a dashboard.
 *
 * The `mostImportantFromInsight` date dataset - if available, should be typically picked to use for date filtering. If
 * it is not available (meaning the insight does not directly use anything related to date datasets) then the `dateDatasetsOrdered`
 * can be used to pick the date dataset for filtering.
 *
 * @alpha
 */
export interface InsightDateDatasets {
    /**
     * Date datasets that are available for filtering of the insight. The available datasets are obtained by inspecting
     * the LDM entities used in the insight and how they relate to date datasets in the workspace's logical data model.
     */
    readonly dateDatasets: ReadonlyArray<ICatalogDateDataset>;

    /**
     * The contents of the `dateDatasets` prop that are ordered according to the relevance. The most relevant and thus
     * most recommended date dataset is first.
     */
    readonly dateDatasetsOrdered: ReadonlyArray<ICatalogDateDataset>;

    /**
     * Date datasets that the insight references in its date filters.
     *
     * Will be empty if the insight does not have any date filters.
     */
    readonly usedInDateFilters: ReadonlyArray<ICatalogDateDataset>;

    /**
     * Date datasets that the insight references in the attributes used to slice and dice the results.
     *
     * The order of appearance matches the order in which display forms from the data sets appear in the {@link InsightAttributesMeta}'s
     * `usage.inAttributes`. If some display form does not belong to a date dataset, then the element will be undefined.
     */
    readonly usedInAttributes: ReadonlyArray<ICatalogDateDataset | undefined>;

    /**
     * Date datasets that the insight references in the attribute filters.
     *
     * The order of appearance matches the order in which attribute display forms used for filtering appear in the {@link InsightAttributesMeta}'s
     * `usage.inFilters`. If some display form does not belong to a date dataset, then the element will be undefined.
     */
    readonly usedInAttributeFilters: ReadonlyArray<ICatalogDateDataset | undefined>;

    /**
     * Pin-points the 'most important' date dataset referenced by the insight itself. This may be undefined if the
     * insight does not use any date filtering or does not use any date attribute display form's to filter or slice or
     * dice the results.
     *
     * The importance is evaluated as follows:
     *
     * 1.  Date datasets used directly in date filters have highest importance. Dataset from first-found filter will be used
     * 2.  Date datasets that own the display forms used to slice or dice the insight's data have the second highest importance. Dataset from first-found attribute will be used.
     * 3.  Date datasets that own the display forms used for attribute-filtering the insight have the least important. Dataset from first-found attribute filter will be used.
     */
    readonly mostImportantFromInsight: ICatalogDateDataset | undefined;

    /**
     * A mapping between original date dataset title and a nicely formatted title that is suitable to display to the end-user. All date datasets
     * that figure in the result structure have their titles included in this mapping
     */
    readonly dateDatasetDisplayNames: Record<string, string>;

    /**
     * All date datasets that can be used to filter the insight. This list is union of all the categorized
     * date datasets listed in this result.
     */
    readonly allAvailableDateDatasets: ICatalogDateDataset[];
}

/**
 * Given results of a query of date datasets available to use for filtering an insight, this function will
 * pick a single date dataset to use.
 *
 * @param queryResult - insight date datasets query result
 * @alpha
 */
export function insightSelectDateDataset(queryResult: InsightDateDatasets): ICatalogDateDataset | undefined {
    const { mostImportantFromInsight, dateDatasetsOrdered } = queryResult;

    return mostImportantFromInsight ?? dateDatasetsOrdered[0];
}

//
//
//

/**
 * Given a reference to an insight, this query will obtain metadata about the display forms used in the
 * insight. For each display form, the result will also contain attribute to which the display form
 * belongs.
 *
 * @alpha
 */
export interface QueryInsightAttributesMeta extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.INSIGHT.ATTRIBUTE.META";
    readonly payload: {
        readonly insightOrRef: ObjRef | IInsight;
    };
}

/**
 * @alpha
 */
export interface InsightAttributesMeta {
    /**
     * High-level break down of how different display forms are used in the insight.
     */
    usage: InsightDisplayFormUsage;

    /**
     * List of metadata objects describing display forms used by the insight.
     */
    displayForms: ReadonlyArray<IAttributeDisplayFormMetadataObject>;

    /**
     * List of attributes to which the used display forms belong.
     */
    attributes: ReadonlyArray<IAttributeMetadataObject>;
}

/**
 * Creates action thought which you can query dashboard component for information about display forms and
 * attributes used by an insight.
 *
 * @param insightOrRef - insight body or a reference to an insight on the dashboard
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function queryInsightAttributesMeta(
    insightOrRef: ObjRef | IInsight,
    correlationId?: string,
): QueryInsightAttributesMeta {
    return {
        type: "GDC.DASH/QUERY.INSIGHT.ATTRIBUTE.META",
        correlationId,
        payload: {
            insightOrRef,
        },
    };
}
