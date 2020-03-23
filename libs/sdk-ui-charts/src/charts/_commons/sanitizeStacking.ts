// (C) 2007-2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import {
    AttributeOrMeasure,
    bucketMeasures,
    bucketsFind,
    IBucket,
    IMeasure,
    isMeasure,
    measureDoesComputeRatio,
    IExecutionDefinition,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../interfaces";

function isMeasureArray(obj: any): obj is IMeasure[] {
    return !isEmpty(obj) && isMeasure(obj[0]);
}

export function sanitizeConfig(input: IMeasure[] | IBucket[] = [], config: IChartConfig = {}): IChartConfig {
    if (!input.length) {
        return config;
    }

    const measures = isMeasureArray(input) ? input : bucketMeasures(bucketsFind(input, BucketNames.MEASURES));

    if (measures) {
        const isComputeRatio = isComputeRatioMeasure(measures[0]);
        const { stackMeasures, stackMeasuresToPercent } = config;

        return {
            ...config,
            stackMeasures: stackMeasures && !isComputeRatio,
            stackMeasuresToPercent: stackMeasuresToPercent && !isComputeRatio,
        };
    }

    return config;
}

function isComputeRatioMeasure(bucketItem: AttributeOrMeasure): boolean {
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
