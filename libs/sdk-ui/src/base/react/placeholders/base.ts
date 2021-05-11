// (C) 2019-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import { IMeasure, IMeasureDefinitionType } from "@gooddata/sdk-model";

/**
 * Any placeholder type - common placeholder or composed placeholder.
 * @beta
 */
export type AnyPlaceholder<T = any> = IPlaceholder<T> | IComposedPlaceholder<T, any, any>;

/**
 * Type-guard testing whether the provided object is an instance of {@link AnyPlaceholder}.
 * @beta
 */
export function isAnyPlaceholder<T>(obj: unknown): obj is AnyPlaceholder<T> {
    const guards: ((obj: unknown) => boolean)[] = [isPlaceholder, isComposedPlaceholder];

    return guards.some((pred) => pred(obj));
}

/**
 * Placeholder represent specific part of the execution (attribute(s), measure(s), filter(s), sort(s)...)
 * that may change the value at runtime. You can provide it to visualization instead of the attributes/measures/filters/sorts themselves,
 * which allows you to control and change execution elements for any number of visualizations you want -
 * just by updating the placeholder(s) value(s).
 *
 * Placeholder values are living in React context and you can obtain/set their values by the following hooks:
 * - {@link usePlaceholder}
 * - {@link usePlaceholders}
 * - {@link useComposedPlaceholder}
 * - {@link useResolveValueWithPlaceholders}
 * - {@link useResolveValuesWithPlaceholders}
 *
 * @beta
 */
export type IPlaceholder<T> = {
    type: "IPlaceholder";
    id: string;
    defaultValue?: T;
    value?: T;
    validate?: (value: T) => void;
    use: IUsePlaceholderHook<IPlaceholder<T>>;
};

/**
 * Type-guard testing whether the provided object is an instance of {@link IPlaceholder}.
 * @beta
 */
export function isPlaceholder<T>(obj: unknown): obj is IPlaceholder<T> {
    return !isEmpty(obj) && (obj as IPlaceholder<T>).type === "IPlaceholder";
}

/**
 * Represents placeholder composed from other placeholders.
 * You can perform computation on top of resolved placeholder values.
 * Composed placeholders accepts also other composed placeholders as input.
 *
 * @beta
 */
export interface IComposedPlaceholder<TReturn, TValue extends any[], TContext> {
    type: "IComposedPlaceholder";
    placeholders: TValue;
    computeValue: (values: PlaceholdersResolvedValues<TValue>, resolutionContext: TContext) => TReturn;
    use: IUseComposedPlaceholderHook<IComposedPlaceholder<TReturn, TValue, TContext>>;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IComposedPlaceholder}.
 * @beta
 */
export function isComposedPlaceholder<TReturn, TValue extends any[], TContext>(
    obj: unknown,
): obj is IComposedPlaceholder<TReturn, TValue, TContext> {
    return (
        !isEmpty(obj) &&
        (obj as IComposedPlaceholder<TReturn, TValue, TContext>).type === "IComposedPlaceholder"
    );
}

/**
 * React hook to obtain and set placeholder value.
 * @beta
 */
export type IUsePlaceholderHook<T extends IPlaceholder<any>> = () => [
    value: PlaceholderValue<T> | undefined,
    setPlaceholder: (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>) => void,
];

/**
 * React hook to obtain composed placeholder value.
 * @beta
 */
export type IUseComposedPlaceholderHook<T extends IComposedPlaceholder<any, any, any>> = (
    resolutionContext: ComposedPlaceholderResolutionContext<T>,
) => PlaceholderResolvedValue<T>;

/**
 * Get composed placeholder resolution context type.
 *
 * Examples:
 * - IComposedPlaceholder\<any, any, IResolutionContext\> is resolved as IResolutionContext
 *
 * @beta
 */
export type ComposedPlaceholderResolutionContext<T> = T extends IComposedPlaceholder<any, any, infer TContext>
    ? TContext
    : any;

/**
 * Convert union type to intersection type.
 *
 * Examples:
 * - number | string | boolean is resolved as number & string & boolean
 * - Type1 | Type2 | Type3 is resolved as Type1 & Type2 & Type3
 *
 * @beta
 */
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
    ? R
    : never;

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
 * @beta
 */
export type Flatten<T> = T extends Array<infer A> ? A : T;

/**
 * Get placeholder value type.
 * If the type is not a placeholder, return the same type.
 *
 * Examples:
 * - IPlaceholder\<IAttribute\> is resolved as IAttribute | undefined
 * - IPlaceholder\<IAttribute[]\> is resolved as IAttribute[]
 * - IComposedPlaceholder\<IMeasure\> is resolved as IMeasure
 * - null is resolved as null
 *
 * @beta
 */
export type PlaceholderValue<T> = T extends IPlaceholder<infer A>
    ? A
    : T extends IComposedPlaceholder<infer B, any, any>
    ? B
    : T;

/**
 * Convert tuple of placeholders to tuple of their respective value types.
 *
 * Examples:
 * - [IPlaceholder\<IAttribute\>, IPlaceholder\<IAttribute[]\>] is resolved as [IAttribute, IAttribute[]]
 *
 * Check mapped tuple types for more details:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
 *
 * @beta
 */
export type PlaceholdersValues<Tuple extends [...any[]]> = {
    [Index in keyof Tuple]: PlaceholderValue<Tuple[Index]>;
};

/**
 * Convert any value that may contain placeholders to its resolved value type.
 * Nested array placeholders resolved value types are flattened.
 * If the type is not a placeholder, return the same type.
 *
 * Examples:
 * - IPlaceholder\<IAttribute\> is resolved as IAttribute
 * - IPlaceholder\<IAttribute\>[] is resolved as IAttribute[]
 * - IPlaceholder\<IAttribute[]\> is resolved as IAttribute[]
 * - [IPlaceholder\<IAttribute[]\>, IPlaceholder\<IMeasure[]\>] is resolved as (IAttribute | IMeasure)[]
 * - null is resolved as null
 *
 * @beta
 */
export type PlaceholderResolvedValue<T> = T extends Array<infer A>
    ? Flatten<PlaceholderResolvedValue<A>>[]
    : T extends IPlaceholder<infer B>
    ? B
    : T extends IComposedPlaceholder<infer C, any, any>
    ? C
    : T;

/**
 * Convert tuple of values that may contain placeholders to tuple of their respective resolved value types.
 *
 * Examples:
 * - [IPlaceholder\<IAttribute\>, IPlaceholder\<IAttribute[]\>] is resolved as [IAttribute, IAttribute[]]
 * - [IPlaceholder\<IMeasure\>, IMeasure] is resolved as [IMeasure, IMeasure]
 *
 * Check mapped tuple types for more details:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
 *
 * @beta
 */
export type PlaceholdersResolvedValues<Tuple extends any[]> = {
    [Index in keyof Tuple]: PlaceholderResolvedValue<Tuple[Index]>;
};

/**
 * Wrap each member of union type in the array.
 *
 * Examples:
 * - IAttribute | IMeasure | IFilter is resolved as IAttribute[] | IMeasure[] | IFilter[]
 *
 * @beta
 */
export type ArrayOf<T> = T extends any ? T[] : never;

/**
 * Generate all possible combinations of arrays signatures for the union type.
 *
 * Examples:
 * - IAttribute | IMeasure is resolved as IAttribute[] | IMeasure[] | (IAttribute | IMeasure)[]
 *
 * @beta
 */
export type AnyArrayOf<T> = T[] | ArrayOf<T>;

/**
 * Wrap each member of the union type in AnyPlaceholder.
 *
 * Examples:
 * - IAttribute | IMeasure is resolved as AnyPlaceholder\<IAttribute\> | AnyPlaceholder\<IMeasure\>
 *
 * @beta
 */
export type PlaceholderOf<T> = T extends any ? AnyPlaceholder<T> : never;

/**
 * Generate all possible combinations of placeholder signatures for the union type.
 *
 * Examples:
 * - IAttribute | IMeasure is resolved as
 *   AnyPlaceholder\<IAttribute\> | AnyPlaceholder\<IMeasure\> | AnyPlaceholder\<IAttribute | IMeasure\>
 *
 * @beta
 */
export type AnyPlaceholderOf<T> = AnyPlaceholder<T> | PlaceholderOf<T>;

/**
 * Represents value of type T or any placeholder that may hold value T.
 *
 * @beta
 */
export type ValueOrPlaceholder<T> = T | AnyPlaceholderOf<T>;

/**
 * Represents array of values T or placeholders that may hold value T.
 *
 * @beta
 */
export type ValuesOrPlaceholders<T> = AnyArrayOf<ValueOrPlaceholder<T> | AnyPlaceholderOf<AnyArrayOf<T>>>;

/**
 * Generate union of measures from union of measure definitions.
 *
 * Examples:
 * - IMeasureDefinition | IArithmeticMeasureDefinition is resolved as
 *   IMeasure\<IMeasureDefinition\> | IMeasure\<IArithmeticMeasureDefinition\>
 *
 * @beta
 */
export type MeasureOf<T extends IMeasureDefinitionType> = T extends any ? IMeasure<T> : never;

/**
 * Represents all possible measure signatures.
 *
 * @beta
 */
export type AnyMeasure = IMeasure | MeasureOf<IMeasureDefinitionType>;
