// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
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
import { IChartConfig } from "../../interfaces";

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
    if (executionDef.measures.length === 1) {
        const { stackMeasures, stackMeasuresToPercent } = chartConfig;
        const singleMeasure = executionDef.measures[0];
        const isComputeRatio = measureDoesComputeRatio(singleMeasure);

        return {
            ...chartConfig,
            stackMeasures: stackMeasures && !isComputeRatio,
            stackMeasuresToPercent: stackMeasuresToPercent && !isComputeRatio,
        };
    }
    return chartConfig;
}
