// (C) 2019-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";

/**
 * Placeholder represent specific part of the execution (attribute(s), measure(s), filter(s), sort(s)...)
 * that may change the value at runtime. You can provide it to visualization instead of the attributes/measures/filters/sorts themselves,
 * which allows you to control and change execution elements for any number of visualizations you want -
 * just by updating the placeholder(s) value(s).
 *
 * Placeholder values are living in React context and you can obtain/set them by the provided hooks:
 * usePlaceholder / usePlaceholders / useResolveValueWithPlaceholders / useResolveValuesWithPlaceholders
 *
 * @public
 */
export type IPlaceholder = ISinglePlaceholder<any> | IGroupPlaceholder<any> | IComputedPlaceholder<any, any>;

/**
 * Type-guard testing whether the provided object is an instance of {@link IPlaceholder}.
 * @public
 */
export function isPlaceholder(obj: unknown): obj is IPlaceholder {
    const guards: ((obj: unknown) => boolean)[] = [
        isSinglePlaceholder,
        isGroupPlaceholder,
        isComputedPlaceholder,
    ];

    return guards.some((pred) => pred(obj));
}

/**
 * Represents placeholder holding single value.
 * @public
 */
export type ISinglePlaceholder<T> = {
    type: "ISinglePlaceholder";
    id: string;
    defaultValue?: T;
    value?: T;
    validate?: (value?: T) => void;
    use: IUsePlaceholderHook<ISinglePlaceholder<T>>;
};

/**
 * Type-guard testing whether the provided object is an instance of {@link ISinglePlaceholder}.
 * @public
 */
export function isSinglePlaceholder<T>(obj: unknown): obj is ISinglePlaceholder<T> {
    return !isEmpty(obj) && (obj as ISinglePlaceholder<T>).type === "ISinglePlaceholder";
}

/**
 * Represents placeholder holding multiple values.
 * Note: Values can be also other placeholders.
 *
 * @public
 */
export interface IGroupPlaceholder<T extends any[]> {
    type: "IGroupPlaceholder";
    id: string;
    defaultValue?: T;
    value?: T;
    // TODO: Should be placeholders resolved values?
    validate?: (value?: [...T]) => void;
    use: IUsePlaceholderHook<IGroupPlaceholder<T>>;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IGroupPlaceholder}.
 * @public
 */
export function isGroupPlaceholder<T extends any[]>(obj: unknown): obj is IGroupPlaceholder<T> {
    return !isEmpty(obj) && (obj as IGroupPlaceholder<T>).type === "IGroupPlaceholder";
}

/**
 * Represents a computed placeholder.
 * Computed placeholder is a placeholder composed of other placeholders.
 * It takes their resolved values, perform some calculation on top of it, and return another value.
 *
 * This is useful if you want to change the value of a placeholder according to the value of other placeholders.
 *
 * Example use case: Pass filter from filter placeholder as a measure filter.
 *
 * @public
 */
export interface IComputedPlaceholder<TReturn = any, TPlaceholders extends IPlaceholder[] = IPlaceholder[]> {
    type: "IComputedPlaceholder";
    placeholders: TPlaceholders;
    computeValue: (values: PlaceholdersResolvedValues<TPlaceholders>) => TReturn;
    validate?: (value: PlaceholdersResolvedValues<TPlaceholders>) => void;
    use: IUsePlaceholderHook<IComputedPlaceholder<TReturn, TPlaceholders>>;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IComputedPlaceholder}.
 * @public
 */
export function isComputedPlaceholder<TReturn, TPlaceholders extends IPlaceholder[] = IPlaceholder[]>(
    obj: unknown,
): obj is IComputedPlaceholder<TReturn, TPlaceholders> {
    return (
        !isEmpty(obj) && (obj as IComputedPlaceholder<TReturn, TPlaceholders>).type === "IComputedPlaceholder"
    );
}

/**
 * React hook to obtain and set placeholder value.
 *
 * @public
 */
export type IUsePlaceholderHook<T extends IPlaceholder> = () => [
    value: PlaceholderResolvedValue<T> | undefined,
    setPlaceholder: (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>) => void,
];

/**
 * Flatten array type.
 * If the type is not an array, return the same type.
 * Works only for 1 level, nested array types are not recursively flattened.
 *
 * Examples:
 * - number[] is resolved as number
 * - string[][] is resolved as string[]
 * - string is resolved as string
 *
 * @public
 */
export type Flatten<T> = T extends Array<infer A> ? A : T;

/**
 * Get placeholder raw value type.
 * If the type is not a placeholder, return the same type.
 *
 * Examples:
 * - IAttributePlaceholder is resolved as IAttribute | undefined
 * - IAttributeGroupPlaceholder is resolved as IAttributeOrPlaceholder[]
 * - IComputedPlaceholder\<IMeasure\> is resolved as IMeasure
 * - null is resolved as null
 *
 * @public
 */
export type PlaceholderValue<T> = T extends ISinglePlaceholder<infer A>
    ? A
    : T extends IGroupPlaceholder<infer B>
    ? B
    : T extends IComputedPlaceholder<infer C>
    ? C
    : T;

/**
 * Convert tuple of placeholders to tuple of their respective raw value types.
 *
 * Examples:
 * - [IAttributePlaceholder, IFilterPlaceholder] is resolved as [IAttribute | undefined, IFilter | undefined]
 * - [IAttributeGroupPlaceholder, IFilterGroupPlaceholder] is resolved as [IAttributeOrPlaceholder[], IFilterOrPlaceholder[]]
 * - [IAttributePlaceholder, IFilterGroupPlaceholder] is resolved as [IAttribute | undefined, IFilterOrPlaceholder[]]
 *
 * Check mapped tuple types for more details:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
 *
 * @public
 */
export type PlaceholdersValues<Tuple extends [...any[]]> = {
    [Index in keyof Tuple]: PlaceholderValue<Tuple[Index]>;
};

/**
 * Convert placeholder to its resolved value type.
 * Nested group placeholders resolved value types are flattened.
 * If the type is not a placeholder, return the same type.
 *
 * Examples:
 * - IAttributePlaceholder is resolved as IAttribute
 * - IAttributeGroupPlaceholder is resolved as IAttribute[]
 * - IComputedPlaceholder\<IMeasure\> is resolved as IMeasure
 * - IAttribute is resolved as IAttribute
 * - null is resolved as null
 *
 * @public
 */
export type PlaceholderResolvedValue<T> = T extends ISinglePlaceholder<infer A>
    ? A
    : T extends IGroupPlaceholder<infer B>
    ? Flatten<PlaceholderResolvedValue<Flatten<B>>>[]
    : T extends IComputedPlaceholder<infer C, any>
    ? C
    : T;

/**
 * Convert tuple of placeholders to tuple of their respective resolved value types.
 *
 * Examples:
 * - [IAttributePlaceholder, IFilterPlaceholder] is resolved as [IAttribute, IFilter]
 * - [IAttributeGroupPlaceholder, IFilterGroupPlaceholder] is resolved as [IAttribute[], IFilter[]]
 * - [IAttributePlaceholder, IFilterGroupPlaceholder] is resolved as [IAttribute, IFilter[]]
 *
 * Check mapped tuple types for more details:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
 *
 * @public
 */
export type PlaceholdersResolvedValues<Tuple extends any[]> = {
    [Index in keyof Tuple]: PlaceholderResolvedValue<Tuple[Index]>;
};

/**
 * Convert any type that may contain placeholders to a type with resolved placeholder value types.
 * Group placeholders resolved value types that are part of an array are flattened.
 * If the type is not a placeholder, return the same type.
 *
 * Examples:
 * - IAttributePlaceholder is resolved as IAttribute
 * - IAttributeGroupPlaceholder is resolved as IAttribute[]
 * - IAttributePlaceholder | IMeasure is resolved as IAttribute | IMeasure
 * - IAttributeGroupPlaceholder | IFilterGroupPlaceholder is resolved as IAttribute[] | IFilter[]
 * - (IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder)[] is resolved as IAttribute[]
 * - IMeasure | (IAttributePlaceholder | IAttributeGroupPlaceholder)[] is resolved as IMeasure | IAttribute[]
 * - null is converted to null
 *
 * @public
 */
export type AnyValueWithPlaceholdersResolvedValue<T> = T extends Array<infer A>
    ? Flatten<PlaceholderResolvedValue<A>>[]
    : PlaceholderResolvedValue<T>;

/**
 * Convert tuple of any types that may contain placeholders to a tuple of their respective resolved value types.
 *
 * Examples:
 * - [IAttributePlaceholder, IFilterPlaceholder] is resolved as [IAttribute, IFilter]
 * - [IAttributeGroupPlaceholder, IFilterGroupPlaceholder] is resolved as [IAttribute[], IFilter[]]
 * - [IAttributePlaceholder[], IAttributeGroupPlaceholder] is resolved as [IAttribute[], IAttribute[]]
 * - [IAttributeGroupPlaceholder[], null] is resolved as [IAttribute[], null]
 *
 * Check mapped tuple types for more details:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
 *
 * @public
 */
export type AnyValuesWithPlaceholdersResolvedValues<Tuple extends any[]> = {
    [Index in keyof Tuple]: AnyValueWithPlaceholdersResolvedValue<Tuple[Index]>;
};
