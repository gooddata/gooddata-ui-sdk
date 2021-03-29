// (C) 2019-2021 GoodData Corporation
import { SimpleMeasureDefinitionMeasureAggregationEnum } from "@gooddata/api-client-tiger";
import { MeasureAggregation } from "@gooddata/sdk-model";

type TigerToSdk = {
    [key in SimpleMeasureDefinitionMeasureAggregationEnum]: MeasureAggregation;
};

type SdkToTiger = {
    [key in MeasureAggregation]: SimpleMeasureDefinitionMeasureAggregationEnum;
};

const TigerToSdkAggregationMap: TigerToSdk = {
    [SimpleMeasureDefinitionMeasureAggregationEnum.AVG]: "avg",
    [SimpleMeasureDefinitionMeasureAggregationEnum.COUNT]: "count",
    [SimpleMeasureDefinitionMeasureAggregationEnum.MAX]: "max",
    [SimpleMeasureDefinitionMeasureAggregationEnum.MEDIAN]: "median",
    [SimpleMeasureDefinitionMeasureAggregationEnum.MIN]: "min",
    [SimpleMeasureDefinitionMeasureAggregationEnum.RUNSUM]: "runsum",
    [SimpleMeasureDefinitionMeasureAggregationEnum.SUM]: "sum",
};

/**
 * Converts supported tiger backend aggregations to values recognized by the SDK.
 *
 * @param aggregation - tiger aggregation
 */
export function toSdkAggregation(
    aggregation: SimpleMeasureDefinitionMeasureAggregationEnum | undefined,
): MeasureAggregation | undefined {
    if (!aggregation) {
        return undefined;
    }
    return TigerToSdkAggregationMap[aggregation];
}

const SdkToTigerAggregationMap: SdkToTiger = {
    avg: SimpleMeasureDefinitionMeasureAggregationEnum.AVG,
    count: SimpleMeasureDefinitionMeasureAggregationEnum.COUNT,
    max: SimpleMeasureDefinitionMeasureAggregationEnum.MAX,
    median: SimpleMeasureDefinitionMeasureAggregationEnum.MEDIAN,
    min: SimpleMeasureDefinitionMeasureAggregationEnum.MIN,
    runsum: SimpleMeasureDefinitionMeasureAggregationEnum.RUNSUM,
    sum: SimpleMeasureDefinitionMeasureAggregationEnum.SUM,
};

/**
 * Converts aggregation values recognized by the SDK into aggregations known by tiger.
 *
 * @param aggregation - sdk aggregation
 */
export function toTigerAggregation(
    aggregation: MeasureAggregation | undefined,
): SimpleMeasureDefinitionMeasureAggregationEnum | undefined {
    if (!aggregation) {
        return undefined;
    }
    return SdkToTigerAggregationMap[aggregation];
}
