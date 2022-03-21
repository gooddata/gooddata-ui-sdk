// (C) 2022 GoodData Corporation
import { IBucket, IInsightDefinition, insightBucket } from "@gooddata/sdk-model";
import isString from "lodash/isString";
import toPairs from "lodash/toPairs";
import invariant from "ts-invariant";

import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";

import { IImportInfo, InsightToPropsConverter, PropMeta, PropsWithMeta } from "./types";

type PropTypeShorthand = WellKnownType | PropMeta;

interface IBucketConversion<TProps extends object, TPropKey extends keyof TProps> {
    type: "bucket";
    propName: TPropKey;
    propType: PropTypeShorthand;
    bucketName: string;
    bucketItemAccessor: (bucket: IBucket) => TProps[TPropKey];
}

export function bucketConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    propType: PropTypeShorthand,
    bucketName: string,
    bucketItemAccessor: (bucket: IBucket) => TProps[TPropKey],
): IBucketConversion<TProps, TPropKey> {
    return {
        type: "bucket",
        propName,
        propType,
        bucketName,
        bucketItemAccessor,
    };
}

interface IInsightConversion<TProps extends object, TPropKey extends keyof TProps> {
    type: "insight";
    propName: TPropKey;
    propType: PropTypeShorthand;
    insightItemAccessor: (
        insight: IInsightDefinition,
        ctx: IEmbeddingCodeContext | undefined,
    ) => TProps[TPropKey];
}

export function insightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
    propType: PropTypeShorthand,
    insightItemAccessor: (
        insight: IInsightDefinition,
        ctx: IEmbeddingCodeContext | undefined,
    ) => TProps[TPropKey],
): IInsightConversion<TProps, TPropKey> {
    return {
        type: "insight",
        propName,
        propType,
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
