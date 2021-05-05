// (C) 2019-2021 GoodData Corporation
import { IAttribute, IAttributeOrMeasure, IFilter, IMeasure } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export type IPlaceholderValue = IAttribute | IMeasure | IFilter;

/**
 * @public
 */
export type UndefinedPlaceholderHandling = "error" | "warning" | "none";

/**
 * @public
 */
export type IPlaceholderType =
    | "IAttributePlaceholder"
    | "IAttributeGroupPlaceholder"
    | "IMeasurePlaceholder"
    | "IMeasureGroupPlaceholder"
    | "IFilterPlaceholder"
    | "IFilterGroupPlaceholder";

/**
 * @public
 */
export interface IPlaceholderBase {
    type: IPlaceholderType;
    id: string;
    defaultValue?: IPlaceholderValue | Array<IPlaceholderValue | IPlaceholder>;
    value?: IPlaceholderValue | Array<IPlaceholderValue | IPlaceholder>;
}

/**
 * @public
 */
export interface IAttributePlaceholder extends IPlaceholderBase {
    type: "IAttributePlaceholder";
    id: string;
    value?: IAttribute;
    defaultValue?: IAttribute;
}

/**
 * @public
 */
export function isAttributePlaceholder(obj: unknown): obj is IAttributePlaceholder {
    return !isEmpty(obj) && (obj as IAttributePlaceholder).type === "IAttributePlaceholder";
}

/**
 * @public
 */
export interface IAttributeGroupPlaceholder extends IPlaceholderBase {
    type: "IAttributeGroupPlaceholder";
    id: string;
    defaultValue: Array<IAttribute | IAttributePlaceholder>;
    value?: Array<IAttribute | IAttributePlaceholder>;
}

/**
 * @public
 */
export function isAttributeGroupPlaceholder(obj: unknown): obj is IAttributeGroupPlaceholder {
    return !isEmpty(obj) && (obj as IAttributeGroupPlaceholder).type === "IAttributeGroupPlaceholder";
}

/**
 * @public
 */
export interface IMeasurePlaceholder extends IPlaceholderBase {
    type: "IMeasurePlaceholder";
    id: string;
    defaultValue?: IAttributeOrMeasure;
    value?: IAttributeOrMeasure;
}

/**
 * @public
 */
export function isMeasurePlaceholder(obj: unknown): obj is IMeasurePlaceholder {
    return !isEmpty(obj) && (obj as IMeasurePlaceholder).type === "IMeasurePlaceholder";
}

/**
 * @public
 */
export interface IMeasureGroupPlaceholder extends IPlaceholderBase {
    type: "IMeasureGroupPlaceholder";
    id: string;
    defaultValue: Array<IAttributeOrMeasure | IMeasurePlaceholder>;
    value?: Array<IAttributeOrMeasure | IMeasurePlaceholder>;
}

/**
 * @public
 */
export function isMeasureGroupPlaceholder(obj: unknown): obj is IMeasureGroupPlaceholder {
    return !isEmpty(obj) && (obj as IMeasureGroupPlaceholder).type === "IMeasureGroupPlaceholder";
}

/**
 * @public
 */
export interface IFilterPlaceholder extends IPlaceholderBase {
    type: "IFilterPlaceholder";
    id: string;
    defaultValue?: IFilter;
    value?: IFilter;
}

/**
 * @public
 */
export function isFilterPlaceholder(obj: unknown): obj is IFilterPlaceholder {
    return !isEmpty(obj) && (obj as IFilterPlaceholder).type === "IFilterPlaceholder";
}

/**
 * @public
 */
export interface IFilterGroupPlaceholder extends IPlaceholderBase {
    type: "IFilterGroupPlaceholder";
    id: string;
    defaultValue: Array<IFilter | IFilterPlaceholder>;
    value?: Array<IFilter | IFilterPlaceholder>;
}

/**
 * @public
 */
export function isFilterGroupPlaceholder(obj: unknown): obj is IFilterGroupPlaceholder {
    return !isEmpty(obj) && (obj as IFilterGroupPlaceholder).type === "IFilterGroupPlaceholder";
}

/**
 * @public
 */
export type IPlaceholder = ISinglePlaceholder | IGroupPlaceholder;

/**
 * @public
 */
export type ISinglePlaceholder = IFilterPlaceholder | IAttributePlaceholder | IMeasurePlaceholder;

/**
 * @public
 */
export type IGroupPlaceholder =
    | IFilterGroupPlaceholder
    | IAttributeGroupPlaceholder
    | IMeasureGroupPlaceholder;

/**
 * @public
 */
export function isPlaceholder(obj: unknown): obj is IPlaceholder {
    return [
        isMeasurePlaceholder,
        isMeasureGroupPlaceholder,
        isAttributePlaceholder,
        isAttributeGroupPlaceholder,
        isFilterPlaceholder,
        isFilterGroupPlaceholder,
    ].some((pred) => pred(obj));
}

/**
 * @public
 */
export function isGroupPlaceholder(obj: unknown): obj is IGroupPlaceholder {
    return [isMeasureGroupPlaceholder, isAttributeGroupPlaceholder, isFilterGroupPlaceholder].some((pred) =>
        pred(obj),
    );
}

/**
 * Convert placeholder type to it's return type
 * @public
 */
export type PlaceholderReturnType<TPlaceholder extends any> = TPlaceholder extends IFilterPlaceholder
    ? IFilter | undefined
    : TPlaceholder extends IFilterGroupPlaceholder
    ? IFilter[]
    : TPlaceholder extends IAttributePlaceholder
    ? IAttribute | undefined
    : TPlaceholder extends IAttributeGroupPlaceholder
    ? IAttribute[]
    : TPlaceholder extends IMeasurePlaceholder
    ? IAttributeOrMeasure | undefined
    : TPlaceholder extends IMeasureGroupPlaceholder
    ? IAttributeOrMeasure[]
    : never;

/**
 * Represents any value(s) that can contain also placeholders
 * @public
 */
export type ValueWithPlaceholders =
    | IPlaceholderValue
    | IPlaceholder
    | Array<IPlaceholderValue | IPlaceholder>;

/**
 * @public
 */
export type Flatten<T> = T extends Array<infer I> ? I : T;

/**
 * Convert any value(s) that can contain placeholders to actual resolved value(s) type(s).
 *
 * @public
 */
export type ValueWithPlaceholdersReturnType<TValue extends any> =
    // When it's a value itself or undefined, return the same value
    TValue extends IPlaceholderValue | undefined
        ? TValue
        : // When it's a placeholder, return it's return type
        TValue extends IPlaceholder
        ? PlaceholderReturnType<TValue>
        : // When it's an array, resolve all it's values and flatten group placeholder return types
        TValue extends Array<any>
        ? Array<Flatten<ValueWithPlaceholdersReturnType<Flatten<TValue>>>>
        : // When resolution was not successful, return unknown
          unknown;

/**
 * Convert tuple of placeholders [...IPlaceholder[]] to tuple of their respective return types [...IPlaceholderValue[]]
 * @public
 */
export type PlaceholdersReturnTypes<Tuple extends [...IPlaceholder[]]> = {
    [Index in keyof Tuple]: PlaceholderReturnType<Tuple[Index]>;
};

/**
 * Convert tuple of values with possible placeholders [...ValueWithPlaceholders[]] to tuple of their resolved return types [...IPlaceholderValue[]]
 * @public
 */
export type ValuesWithPlaceholdersReturnTypes<Tuple extends [...ValueWithPlaceholders[]]> = {
    [Index in keyof Tuple]: ValueWithPlaceholdersReturnType<Tuple[Index]>;
};

/**
 * @public
 */
export type IUsePlaceholder<TPlaceholder extends IPlaceholder> = () => [
    value: PlaceholderReturnType<TPlaceholder> | undefined,
    setPlaceholder: (
        valueOrUpdateCallback:
            | PlaceholderReturnType<TPlaceholder>
            | ((
                  currentValue: PlaceholderReturnType<TPlaceholder> | undefined,
              ) => PlaceholderReturnType<TPlaceholder> | undefined)
            | undefined,
    ) => void,
];

/**
 * @public
 */
export type IPlaceholderWithHook<TPlaceholder extends IPlaceholder> = TPlaceholder & {
    use: IUsePlaceholder<TPlaceholder>;
};

/**
 * @public
 */
export type PlaceholderComputation<TPlaceholders extends IPlaceholder[], TReturn extends IPlaceholder> = (
    resolvedPlaceholderValues: [...placeholderReturnTypes: PlaceholdersReturnTypes<TPlaceholders>],
) => TReturn;

/**
 * Computed placeholder is placeholder that derives it's value from other placeholder's return values
 * @public
 */
export interface IComputedPlaceholder<
    TPlaceholders extends IPlaceholder[],
    TReturn extends IPlaceholder,
    TComputation extends PlaceholderComputation<TPlaceholders, TReturn>
> {
    type: "IComputedPlaceholder";
    placeholders: IPlaceholder[];
    computedPlaceholder: TComputation;
}

/**
 * @public
 */
export function isComputedPlaceholder<
    TPlaceholders extends IPlaceholder[],
    TReturn extends IPlaceholder,
    TComputation extends PlaceholderComputation<TPlaceholders, TReturn>
>(obj: unknown): obj is IComputedPlaceholder<TPlaceholders, TReturn, TComputation> {
    return !isEmpty(obj) && (obj as IComputedPlaceholder<any, any, any>).type === "IComputedPlaceholder";
}
