// (C) 2007-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import {
    IAttributeOrMeasure,
    bucketItems,
    bucketsFind,
    IBucket,
    IExecutionDefinition,
    isAttribute,
    isMeasure,
    measureDoesComputeRatio,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../interfaces/index.js";

function isItemsArray(obj: any): obj is IAttributeOrMeasure[] {
    return !isEmpty(obj) && (isMeasure(obj[0]) || isAttribute(obj));
}

export function sanitizeConfig(
    input: IAttributeOrMeasure[] | IBucket[] = [],
    config: IChartConfig = {},
): IChartConfig {
    if (!input.length) {
        return config;
    }

    const items = isItemsArray(input) ? input : bucketItems(bucketsFind(input, BucketNames.MEASURES));

    if (items) {
        const isComputeRatio = isComputeRatioMeasure(items[0]);
        const { stackMeasures, stackMeasuresToPercent } = config;

        return {
            ...config,
            stackMeasures: stackMeasures && !isComputeRatio,
            stackMeasuresToPercent: stackMeasuresToPercent && !isComputeRatio,
        };
    }

    return config;
}

function isComputeRatioMeasure(bucketItem: IAttributeOrMeasure): boolean {
    return isMeasure(bucketItem) && measureDoesComputeRatio(bucketItem);
}

export function getSanitizedStackingConfig(
    executionDef: IExecutionDefinition,
    chartConfig: IChartConfig,
): IChartConfig {
    let updatedChartConfig = chartConfig;

    // In case enableChartSorting is set to true and sort was not specified,
    // we need to change its value, so visualization is able to take default sort
    if (executionDef.sortBy.length === 0 && chartConfig.enableChartSorting) {
        updatedChartConfig = { ...updatedChartConfig, enableChartSorting: false };
    }

    if (executionDef.measures.length === 1) {
        const { stackMeasures, stackMeasuresToPercent } = chartConfig;
        const singleMeasure = executionDef.measures[0];
        const isComputeRatio = measureDoesComputeRatio(singleMeasure);

        return {
            ...updatedChartConfig,
            stackMeasures: stackMeasures && !isComputeRatio,
            stackMeasuresToPercent: stackMeasuresToPercent && !isComputeRatio,
        };
    }

    return updatedChartConfig;
}
