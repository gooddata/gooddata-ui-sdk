// (C) 2022 GoodData Corporation
import {
    bucketAttribute,
    bucketAttributes,
    bucketItems,
    bucketMeasure,
    bucketMeasures,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IFilter,
    IInsightDefinition,
    IMeasure,
    insightBucket,
    insightFilters,
    insightSorts,
    insightTotals,
    ISortItem,
    ITotal,
} from "@gooddata/sdk-model";
import isString from "lodash/isString";
import toPairs from "lodash/toPairs";
import invariant from "ts-invariant";

import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";

import { IImportInfo, InsightToPropsConverter, PropMeta, PropsWithMeta } from "./types";

type PropTypeShorthand = WellKnownType | PropMeta;

export interface IBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
> {
    type: "bucket";
    propName: TPropKey;
    propType: PropTypeShorthand;
    bucketName: string;
    bucketItemAccessor: (bucket: IBucket) => TReturnType;
}

export function bucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropTypeShorthand,
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

export function singleAttributeBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IAttribute> {
    return bucketConversion(propName, "IAttribute", bucketName, bucketAttribute);
}

export function multipleAttributesBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IAttribute[]> {
    return bucketConversion(propName, "IAttribute[]", bucketName, bucketAttributes);
}

export function singleMeasureBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IMeasure> {
    return bucketConversion(propName, "IMeasure", bucketName, bucketMeasure);
}

export function multipleMeasuresBucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    bucketName: string,
): IBucketConversion<TProps, TPropKey, IMeasure[]> {
    return bucketConversion(propName, "IMeasure[]", bucketName, bucketMeasures);
}

function firstBucketItem(bucket: IBucket): IAttributeOrMeasure | undefined {
    return bucketItems(bucket)?.[0];
}

export function singleAttributeOrMeasureBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IBucketConversion<TProps, TPropKey, IAttributeOrMeasure> {
    return bucketConversion(propName, "IAttributeOrMeasure", bucketName, firstBucketItem);
}

export function multipleAttributesOrMeasuresBucketConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
>(propName: TPropKey, bucketName: string): IBucketConversion<TProps, TPropKey, IAttributeOrMeasure[]> {
    return bucketConversion(propName, "IAttributeOrMeasure[]", bucketName, bucketItems);
}

export interface IInsightConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
> {
    type: "insight";
    propName: TPropKey;
    propType: PropTypeShorthand;
    insightItemAccessor: (insight: IInsightDefinition, ctx: IEmbeddingCodeContext | undefined) => TReturnType;
}

export function insightConversion<
    TProps extends object,
    TPropKey extends keyof TProps,
    TReturnType = TProps[TPropKey],
>(
    propName: TPropKey,
    propType: PropTypeShorthand,
    insightItemAccessor: (insight: IInsightDefinition, ctx: IEmbeddingCodeContext | undefined) => TReturnType,
): IInsightConversion<TProps, TPropKey, TReturnType> {
    return {
        type: "insight",
        propName,
        propType,
        insightItemAccessor,
    };
}

export function filtersInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightConversion<TProps, TPropKey, IFilter[]> {
    return insightConversion(propName, "IFilter[]", insightFilters);
}

export function sortsInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightConversion<TProps, TPropKey, ISortItem[]> {
    return insightConversion(propName, "ISortItem[]", insightSorts);
}

export function totalsInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightConversion<TProps, TPropKey, ITotal[]> {
    return insightConversion(propName, "ITotal[]", insightTotals);
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

type ConversionSpec<TProps extends object> = {
    [K in keyof TProps]: Conversion<TProps, K, TProps[K]>;
};

type WellKnownType =
    | "IMeasure"
    | "IMeasure[]"
    | "IAttribute"
    | "IAttribute[]"
    | "IAttributeOrMeasure"
    | "IAttributeOrMeasure[]"
    | "IFilter"
    | "IFilter[]"
    | "ISortItem"
    | "ISortItem[]"
    | "ITotal"
    | "ITotal[]";

const defaultTypes: IImportInfo[] = [
    "IMeasure",
    "IAttribute",
    "IAttributeOrMeasure",
    "IFilter",
    "ISortItem",
    "ITotal",
].map((name): IImportInfo => ({ name, importType: "named", package: "@gooddata/sdk-model" }));

function propTypeShorthandToPropMeta(propType: PropTypeShorthand): PropMeta {
    if (!isString(propType)) {
        return propType;
    }

    const matches = /^(\w+)(\[])?$/.exec(propType);
    invariant(matches, `Invalid propType shorthand: '${propType}'`);

    const [, name, arrayMarker] = matches;
    const matchingImport = defaultTypes.find((i) => i.name === name);
    invariant(matches, `Unknown import for type: '${name}'`);

    return { propImport: matchingImport, propType: arrayMarker ? "array" : "scalar" };
}

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
                        meta: propTypeShorthandToPropMeta(conversion.propType),
                    };
                } else if (isInsightConversion(conversion)) {
                    const result = conversion.insightItemAccessor(insight, ctx);
                    acc[propName] = {
                        value: result,
                        meta: propTypeShorthandToPropMeta(conversion.propType),
                    };
                }
                return acc;
            },
            {},
        ) as PropsWithMeta<TProps>;
    };
}
