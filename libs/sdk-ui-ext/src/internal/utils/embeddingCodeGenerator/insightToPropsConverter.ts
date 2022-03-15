// (C) 2022 GoodData Corporation
import { IBucket, IInsightDefinition, insightBucket, insightProperties } from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";
import fromPairs from "lodash/fromPairs";
import isNil from "lodash/isNil";
import toPairs from "lodash/toPairs";
import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";
import { InsightToPropsConverter } from "./types";

interface IBucketConversion<TProps extends object, TPropKey extends keyof TProps> {
    type: "bucket";
    propName: TPropKey;
    bucketName: string;
    bucketItemAccessor: (bucket: IBucket) => TProps[TPropKey];
}

export function bucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
    bucketItemAccessor: (bucket: IBucket) => TProps[TPropKey],
): IBucketConversion<TProps, TPropKey> {
    return {
        type: "bucket",
        propName,
        bucketName,
        bucketItemAccessor,
    };
}

interface IInsightConversion<TProps extends object, TPropKey extends keyof TProps> {
    type: "insight";
    propName: TPropKey;
    insightItemAccessor: (
        insight: IInsightDefinition,
        ctx: IEmbeddingCodeContext | undefined,
    ) => TProps[TPropKey];
}

export function insightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    insightItemAccessor: (
        insight: IInsightDefinition,
        ctx: IEmbeddingCodeContext | undefined,
    ) => TProps[TPropKey],
): IInsightConversion<TProps, TPropKey> {
    return {
        type: "insight",
        propName,
        insightItemAccessor,
    };
}

type Conversion<TProps extends object, TPropKey extends keyof TProps> =
    | IBucketConversion<TProps, TPropKey>
    | IInsightConversion<TProps, TPropKey>;

function isBucketConversion(obj: unknown): obj is IBucketConversion<any, any> {
    return !!obj && (obj as IBucketConversion<any, any>).type === "bucket";
}

function isInsightConversion(obj: unknown): obj is IInsightConversion<any, any> {
    return !!obj && (obj as IInsightConversion<any, any>).type === "insight";
}

type ConversionSpec<TProps extends object> = {
    [K in keyof TProps]: Conversion<TProps, K>;
};

export function getInsightToPropsConverter<TProps extends object>(
    conversionSpec: ConversionSpec<TProps>,
): InsightToPropsConverter<TProps> {
    return (insight, ctx) => {
        return toPairs(conversionSpec).reduce((acc: Partial<TProps>, [propName, conversion]) => {
            if (isBucketConversion(conversion)) {
                const bucket = insightBucket(insight, conversion.bucketName);
                const result = bucket && conversion.bucketItemAccessor(bucket);
                acc[propName] = result;
            } else if (isInsightConversion(conversion)) {
                const result = conversion.insightItemAccessor(insight, ctx);
                acc[propName] = result;
            }
            return acc;
        }, {}) as TProps;
    };
}

const supportedChartConfigProperties = new Set<keyof IChartConfig>([
    "dataLabels",
    "dataPoints",
    "dualAxis",
    "enableJoinedAttributeAxisName",
    "grid",
    "legend",
    "legendLayout",
    "limits",
    "primaryChartType",
    "secondaryChartType",
    "secondary_xaxis",
    "secondary_yaxis",
    "separators",
    "stackMeasures",
    "stackMeasuresToPercent",
    "xFormat",
    "xLabel",
    "xaxis",
    "yFormat",
    "yLabel",
    "yaxis",
]);

export function chartConfigFromInsight(insight: IInsightDefinition): IChartConfig {
    const properties = insightProperties(insight);
    const controls = properties?.controls;
    if (!controls) {
        return {};
    }

    return flow(
        toPairs,
        filter(([key, value]) => supportedChartConfigProperties.has(key as any) && !isNil(value)),
        fromPairs,
    )(controls);
}
