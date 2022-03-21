// (C) 2022 GoodData Corporation
import { IBucket, IInsightDefinition, insightBucket } from "@gooddata/sdk-model";
import toPairs from "lodash/toPairs";

import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor";

import { InsightToPropsConverter, PropMeta, PropsWithMeta } from "../types";

export interface IBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
> {
    type: "bucket";
    propName: TPropKey;
    propType: PropMeta;
    bucketName: string;
    bucketItemAccessor: (bucket: IBucket) => TReturnType;
}

export function bucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropMeta,
    bucketName: string,
    bucketItemAccessor: (bucket: IBucket) => TReturnType,
): IBucketConversion<TProps, TPropKey, TReturnType> {
    return {
        type: "bucket",
        propName,
        propType,
        bucketName,
        bucketItemAccessor,
    };
}

export interface IInsightConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
> {
    type: "insight";
    propName: TPropKey;
    propType: PropMeta;
    insightItemAccessor: (insight: IInsightDefinition, ctx: IEmbeddingCodeContext | undefined) => TReturnType;
}

export function insightConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropMeta,
    insightItemAccessor: (insight: IInsightDefinition, ctx: IEmbeddingCodeContext | undefined) => TReturnType,
): IInsightConversion<TProps, TPropKey, TReturnType> {
    return {
        type: "insight",
        propName,
        propType,
        insightItemAccessor,
    };
}

export type Conversion<TProps extends object, TPropKey extends keyof TProps, TReturnType> =
    | IBucketConversion<TProps, TPropKey, TReturnType>
    | IInsightConversion<TProps, TPropKey, TReturnType>;

function isBucketConversion(obj: unknown): obj is IBucketConversion<any, any> {
    return !!obj && (obj as IBucketConversion<any, any>).type === "bucket";
}

function isInsightConversion(obj: unknown): obj is IInsightConversion<any, any> {
    return !!obj && (obj as IInsightConversion<any, any>).type === "insight";
}

export type ConversionSpec<TProps extends object> = {
    [K in keyof TProps]: Conversion<TProps, K, TProps[K]>;
};

export function getInsightToPropsConverter<TProps extends object>(
    conversionSpec: ConversionSpec<TProps>,
): InsightToPropsConverter<TProps> {
    return (insight, ctx) => {
        return toPairs(conversionSpec).reduce(
            (acc: Partial<PropsWithMeta<TProps>>, [propName, conversion]) => {
                if (isBucketConversion(conversion)) {
                    const bucket = insightBucket(insight, conversion.bucketName);
                    const result = bucket && conversion.bucketItemAccessor(bucket);
                    acc[propName] = {
                        value: result,
                        meta: conversion.propType,
                    };
                } else if (isInsightConversion(conversion)) {
                    const result = conversion.insightItemAccessor(insight, ctx);
                    acc[propName] = {
                        value: result,
                        meta: conversion.propType,
                    };
                }
                return acc;
            },
            {},
        ) as PropsWithMeta<TProps>;
    };
}
