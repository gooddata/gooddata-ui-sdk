// (C) 2021-2022 GoodData Corporation
import { IDashboardQuery } from "./base.js";
import { ObjRef, ICatalogDateDataset } from "@gooddata/sdk-model";

/**
 * Given a reference to a measure, this query will obtain list of all date datasets that may be used
 * to filter it.
 *
 * @alpha
 */
export interface QueryMeasureDateDatasets extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.MEASURE.DATE.DATASETS";
    readonly payload: {
        readonly measureRef: ObjRef;
    };
}

/**
 * Creates action through which you can query dashboard component for information about the date data sets
 * that are applicable for filtering of the provided measure. measures are typically used to obtain value to render on KPIs.
 *
 * @param measureRef - reference to measure
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function queryDateDatasetsForMeasure(
    measureRef: ObjRef,
    correlationId?: string,
): QueryMeasureDateDatasets {
    return {
        type: "GDC.DASH/QUERY.MEASURE.DATE.DATASETS",
        correlationId,
        payload: {
            measureRef,
        },
    };
}

/**
 * The measure date datasets holds information about available date datasets that can be used for date-filtering a particular
 * measure.
 *
 * The data included herein can be used to select an appropriate date dataset to filter a KPI widget that renders value
 * of particular measure.
 *
 * @alpha
 */
export interface MeasureDateDatasets {
    /**
     * Date datasets that are available for filtering of the measure. The available datasets are obtained by inspecting
     * relation of measure and the different date datasets in the workspace's logical data model.
     */
    readonly dateDatasets: ReadonlyArray<ICatalogDateDataset>;

    /**
     * The contents of the `dateDatasets` prop that are ordered according to the relevance. The most relevant and thus
     * most recommended date dataset is first.
     */
    readonly dateDatasetsOrdered: ReadonlyArray<ICatalogDateDataset>;

    /**
     * A mapping between original date dataset title and a nicely formatted title that is suitable to display to the end-user. All date datasets
     * that figure in the result structure have their titles included in this mapping
     */
    readonly dateDatasetDisplayNames: Record<string, string>;
}
