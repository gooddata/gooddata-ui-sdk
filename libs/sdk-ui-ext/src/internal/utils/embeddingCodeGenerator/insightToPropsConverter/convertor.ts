// (C) 2022-2023 GoodData Corporation
import { IBucket, IInsightDefinition, insightBucket } from "@gooddata/sdk-model";
import toPairs from "lodash/toPairs.js";

import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";

import { InsightToPropsConverter, PropMeta, PropWithMeta, PropsWithMeta } from "../types.js";

/**
 * Describes a conversion from insight to a particular prop of a visualization.
 */
export interface IInsightToPropConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
> {
    propName: TPropKey;
    propType: PropMeta;
    itemAccessor: (insight: IInsightDefinition, ctx: IEmbeddingCodeContext | undefined) => TReturnType;
}

/**
 * Conversion based on the whole {@link @gooddata/sdk-model#IInsightDefinition}.
 */
export function insightConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropMeta,
    insightItemAccessor: (insight: IInsightDefinition, ctx: IEmbeddingCodeContext | undefined) => TReturnType,
): IInsightToPropConversion<TProps, TPropKey, TReturnType> {
    return {
        propName,
        propType,
        itemAccessor: insightItemAccessor,
    };
}

/**
 * Conversion based on a single bucket.
 */
export function bucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropMeta,
    bucketName: string,
    bucketItemAccessor: (bucket: IBucket) => TReturnType,
): IInsightToPropConversion<TProps, TPropKey, TReturnType> {
    return {
        propName,
        propType,
        itemAccessor(insight) {
            const bucket = insightBucket(insight, bucketName);
            return bucket && bucketItemAccessor(bucket);
        },
    };
}

export type ConversionSpec<TProps extends object> = {
    [K in keyof TProps]: IInsightToPropConversion<TProps, K, TProps[K]>;
};

/**
 * Creates an InsightToProps converter.
 *
 * @remarks
 * This makes the conversion as declarative as possible avoiding any explicit logic in the call sites,
 * rather using specialized object to describe parts of the conversion.
 *
 * @param conversionSpec - Specification of the insight to props conversion
 * @returns function that can be used to convert a given insight to props for some visualization type
 */
export function getInsightToPropsConverter<TProps extends object>(
    conversionSpec: ConversionSpec<TProps>,
): InsightToPropsConverter<TProps> {
    return (insight, ctx) => {
        return toPairs(conversionSpec).reduce(
            (
                acc: Record<string, PropWithMeta<TProps>>,
                [propName, conversion]: [string, IInsightToPropConversion<any, any, any>],
            ) => {
                acc[propName] = {
                    value: conversion.itemAccessor(insight, ctx),
                    meta: conversion.propType,
                };
                return acc;
            },
            {},
        ) as PropsWithMeta<TProps>;
    };
}
