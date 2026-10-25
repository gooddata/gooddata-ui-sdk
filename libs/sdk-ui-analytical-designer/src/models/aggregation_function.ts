// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";

export interface IAggregationFunction {
    functionName: string;
    applicableTo: string;
}

export interface ITranslatedAggregationFunction {
    functionName: string;
    applicableTo: string;
    title: string;
}

function createAggregation(functionName: string, applicableTo = "fact"): IAggregationFunction {
    return { functionName, applicableTo };
}

export const APPROXIMATE_COUNT_AGGREGATION = "approximate_count";
export const COUNT_AGGREGATION = "count";

const aggregationTitleMessageIds = {
    sum: defineMessage({ id: "aggregations.title.sum" }).id,
    avg: defineMessage({ id: "aggregations.title.avg" }).id,
    min: defineMessage({ id: "aggregations.title.min" }).id,
    max: defineMessage({ id: "aggregations.title.max" }).id,
    median: defineMessage({ id: "aggregations.title.median" }).id,
    runsum: defineMessage({ id: "aggregations.title.runsum" }).id,
    [COUNT_AGGREGATION]: defineMessage({ id: "aggregations.title.count" }).id,
    [APPROXIMATE_COUNT_AGGREGATION]: defineMessage({ id: "aggregations.title.approximate_count" }).id,
} as const;

export const AGGREGATION_FUNCTIONS = [
    createAggregation("sum"),
    createAggregation("avg"),
    createAggregation("min"),
    createAggregation("max"),
    createAggregation("median"),
    createAggregation("runsum"),
    createAggregation(COUNT_AGGREGATION, "attribute"),
    createAggregation(APPROXIMATE_COUNT_AGGREGATION, "attribute"),
];

export const getTranslatedApplicableAggregationFunctions = (
    applicableTo: string,
    formatMessage: (descriptor: { id: string; defaultMessage?: string }) => string,
    aggregationFunctions: IAggregationFunction[] = AGGREGATION_FUNCTIONS,
): ITranslatedAggregationFunction[] => {
    return aggregationFunctions
        .filter((func) => func.applicableTo === applicableTo)
        .map((aggregationFunction) => ({
            ...aggregationFunction,
            title: formatMessage({
                id:
                    aggregationTitleMessageIds[
                        aggregationFunction.functionName as keyof typeof aggregationTitleMessageIds
                    ] ?? `aggregations.title.${aggregationFunction.functionName}`,
            }),
        }));
};
