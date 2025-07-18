// (C) 2024-2025 GoodData Corporation

import { useMemo } from "react";
import {
    idRef,
    MeasureAggregation,
    newAttribute,
    newMeasure,
    IGenAIVisualization,
    GenAIFilter,
    newPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newRelativeDateFilter,
    newAbsoluteDateFilter,
    DateAttributeGranularity,
    IFilter,
    GenAIPositiveAttributeFilter,
    GenAINegativeAttributeFilter,
    GenAIRelativeDateFilter,
    GenAIDateGranularity,
    GenAIAbsoluteDateFilter,
    IGenAIVisualizationMetric,
    MeasureBuilder,
    GenAIMetricType,
    ObjectType,
} from "@gooddata/sdk-model";

const measureBuilder = (md: IGenAIVisualizationMetric) => (m: MeasureBuilder) => {
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
    return useMemo(() => {
        if (!vis) {
            return {
                metrics: [],
                dimensions: [],
                filters: [],
            };
        }

        return prepareExecution(vis);
    }, [vis]);
};

export const prepareExecution = (vis: IGenAIVisualization) => {
    const dimensions = vis.dimensionality?.map((d) => newAttribute(d.id)) ?? [];
    const metrics =
        vis.metrics?.map((md) => newMeasure(idRef(md.id, typeMap[md.type]), measureBuilder(md))) ?? [];
    const filters = (vis.filters?.map(convertFilter).filter(Boolean) as IFilter[]) ?? [];

    return { metrics, dimensions, filters };
};

const convertFilter = (data: GenAIFilter): IFilter | false => {
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

    return false;
};

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
