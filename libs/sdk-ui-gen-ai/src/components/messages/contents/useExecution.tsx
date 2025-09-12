// (C) 2024-2025 GoodData Corporation

import React from "react";

import {
    DateAttributeGranularity,
    GenAIAbsoluteDateFilter,
    GenAIDateGranularity,
    GenAIFilter,
    GenAIMetricType,
    GenAINegativeAttributeFilter,
    GenAIPositiveAttributeFilter,
    GenAIRankingFilter,
    GenAIRelativeDateFilter,
    IAttribute,
    IFilter,
    IGenAIVisualization,
    IGenAIVisualizationMetric,
    IMeasure,
    IMeasureDefinition,
    ISortItem,
    LocalIdRef,
    MeasureAggregation,
    MeasureBuilder,
    ObjectType,
    areObjRefsEqual,
    idRef,
    localIdRef,
    newAbsoluteDateFilter,
    newAttribute,
    newMeasure,
    newMeasureSort,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

const measureBuilder = (m: MeasureBuilder, md: IGenAIVisualizationMetric) => {
    if (md.title) {
        m = m.title(md.title);
    }

    if (md.type === "attribute") {
        m = m.aggregation("count");
    }

    if (md.type === "fact" && md.aggFunction) {
        m = m.aggregation(md.aggFunction.toLowerCase() as MeasureAggregation);
    }

    return m;
};

const typeMap: { [key in GenAIMetricType]: ObjectType } = {
    attribute: "attribute",
    fact: "fact",
    metric: "measure",
};

export const useExecution = (vis?: IGenAIVisualization) => {
    return React.useMemo(() => {
        if (!vis) {
            return {
                metrics: [],
                dimensions: [],
                filters: [],
                sorts: [],
            };
        }

        return prepareExecution(vis);
    }, [vis]);
};

export const prepareExecution = (vis: IGenAIVisualization) => {
    const dimensions =
        vis.dimensionality?.map((d, i) => newAttribute(d.id, (m) => m.localId(`local_dimension_${i}`))) ?? [];
    const metrics =
        vis.metrics?.map((md, i) =>
            newMeasure(idRef(md.id, typeMap[md.type]), (m) =>
                measureBuilder(m, md).localId(`local_metric_${i}`),
            ),
        ) ?? [];
    const filters =
        (vis.filters
            ?.map((filter) => convertFilter(filter, metrics, dimensions))
            .filter(Boolean) as IFilter[]) ?? [];
    const sorts = createSorts(metrics, vis.filters);

    return { metrics, dimensions, filters, sorts };
};

const convertFilter = (
    data: GenAIFilter,
    metrics: IMeasure<IMeasureDefinition>[],
    dimensions: IAttribute[],
): IFilter | false => {
    if (isPositiveAttributeFilter(data)) {
        return newPositiveAttributeFilter(idRef(data.using, "displayForm"), { values: data.include });
    }

    if (isNegativeAttributeFilter(data)) {
        return newNegativeAttributeFilter(idRef(data.using, "displayForm"), { values: data.exclude });
    }

    if (isRelativeDateFilter(data)) {
        return newRelativeDateFilter(
            idRef(data.using, "dataSet"),
            granularityMap[data.granularity],
            data.from,
            data.to,
        );
    }

    if (isAbsoluteDateFilter(data)) {
        return newAbsoluteDateFilter(
            idRef(data.using, "dataSet"),
            data.from ??
                (() => {
                    const date = new Date();
                    date.setUTCHours(0, 0, 0, 0);
                    return date.toISOString();
                })(),
            data.to ?? new Date().toISOString(),
        );
    }

    if (isRankingFilter(data)) {
        const metric = findMetric(metrics, data.measures[0]);

        if (!metric) {
            return false;
        }

        if (data.dimensionality) {
            return newRankingFilter(
                localIdRef(metric.measure.localIdentifier),
                data.dimensionality
                    .map((id) => {
                        const ref = idRef(id, "displayForm");
                        const attr = dimensions.find((d) => areObjRefsEqual(d.attribute.displayForm, ref));

                        if (!attr) {
                            return false;
                        }

                        return localIdRef(attr.attribute.localIdentifier);
                    })
                    .filter(Boolean) as LocalIdRef[],
                data.operator,
                data.value,
            );
        }
        return newRankingFilter(localIdRef(metric.measure.localIdentifier), data.operator, data.value);
    }

    return false;
};

const createSorts = (metrics: IMeasure<IMeasureDefinition>[], filters?: GenAIFilter[]): ISortItem[] => {
    const rankingFilters = filters?.filter(isRankingFilter) ?? [];

    return rankingFilters
        .map((data) => {
            const metric = findMetric(metrics, data.measures[0]);

            if (!metric) {
                return false;
            }

            return newMeasureSort(metric, data.operator === "TOP" ? "desc" : "asc");
        })
        .filter(Boolean) as ISortItem[];
};

function findMetric(metrics: IMeasure<IMeasureDefinition>[], id: string) {
    const refMetric = idRef(id, "measure");
    const refFact = idRef(id, "fact");
    return metrics.find(
        (m) =>
            areObjRefsEqual(m.measure.definition.measureDefinition.item, refMetric) ||
            areObjRefsEqual(m.measure.definition.measureDefinition.item, refFact),
    );
}

const isPositiveAttributeFilter = (obj: unknown): obj is GenAIPositiveAttributeFilter => {
    return typeof obj === "object" && obj !== null && "using" in obj && "include" in obj;
};

const isNegativeAttributeFilter = (obj: unknown): obj is GenAINegativeAttributeFilter => {
    return typeof obj === "object" && obj !== null && "using" in obj && "exclude" in obj;
};

const isRelativeDateFilter = (obj: unknown): obj is GenAIRelativeDateFilter => {
    return typeof obj === "object" && obj !== null && "using" in obj && "granularity" in obj;
};

const isAbsoluteDateFilter = (obj: unknown): obj is GenAIAbsoluteDateFilter => {
    return typeof obj === "object" && obj !== null && "using" in obj && ("from" in obj || "to" in obj);
};

const isRankingFilter = (obj: unknown): obj is GenAIRankingFilter => {
    return (
        typeof obj === "object" && obj !== null && "measures" in obj && "operator" in obj && "value" in obj
    );
};

const granularityMap: { [key in GenAIDateGranularity]: DateAttributeGranularity } = {
    MINUTE: "GDC.time.minute",
    HOUR: "GDC.time.hour",
    DAY: "GDC.time.date",
    WEEK: "GDC.time.week",
    MONTH: "GDC.time.month",
    QUARTER: "GDC.time.quarter",
    YEAR: "GDC.time.year",
    MINUTE_OF_HOUR: "GDC.time.minute_in_hour",
    HOUR_OF_DAY: "GDC.time.hour_in_day",
    DAY_OF_WEEK: "GDC.time.day_in_week",
    DAY_OF_MONTH: "GDC.time.day_in_month",
    DAY_OF_YEAR: "GDC.time.day_in_year",
    WEEK_OF_YEAR: "GDC.time.week_in_year",
    MONTH_OF_YEAR: "GDC.time.month_in_year",
    QUARTER_OF_YEAR: "GDC.time.quarter_in_year",
};
