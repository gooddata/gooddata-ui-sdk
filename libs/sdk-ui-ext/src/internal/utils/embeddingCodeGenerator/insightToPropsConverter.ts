// (C) 2022 GoodData Corporation
import { IBucket, IInsightDefinition, insightBucket } from "@gooddata/sdk-model";
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
