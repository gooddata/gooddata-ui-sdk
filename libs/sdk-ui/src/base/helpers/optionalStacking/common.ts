// (C) 2007-2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { IExecutionDefinition } from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    bucketMeasures,
    bucketsFind,
    IBucket,
    IMeasure,
    isMeasure,
    measureDoesComputeRatio,
} from "@gooddata/sdk-model";
import { MEASURES } from "../../constants/bucketNames";
import { IChartConfig } from "../../interfaces/Config";

function isMeasureArray(obj: any): obj is IMeasure[] {
    return !isEmpty(obj) && isMeasure(obj[0]);
}

export function sanitizeConfig2(input: IMeasure[] | IBucket[] = [], config: IChartConfig = {}): IChartConfig {
    if (!input.length) {
        return config;
    }

    const measures = isMeasureArray(input) ? input : bucketMeasures(bucketsFind(input, MEASURES));

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

export function getNewSanitizedStackingConfig(
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
