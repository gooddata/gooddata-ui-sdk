// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import { IMeasure, IMeasureDefinitionType } from "@gooddata/sdk-model";

/**
 * Any placeholder type - placeholder or composed placeholder.
 * @public
 */
export type AnyPlaceholder<T = any> = IPlaceholder<T> | IComposedPlaceholder<T, any, any>;

/**
 * Type-guard testing whether the provided object is an instance of {@link AnyPlaceholder}.
 * @public
 */
export function isAnyPlaceholder<T>(obj: unknown): obj is AnyPlaceholder<T> {
    const guards: ((obj: unknown) => boolean)[] = [isPlaceholder, isComposedPlaceholder];

    return guards.some((pred) => pred(obj));
}

/**
 * Placeholder represents a reference to a specific part of the execution - attribute(s), measure(s), filter(s), sort(s) or total(s),
 * that may change the value at runtime.
 *
 * @remarks
 * You can provide it to visualizations instead of the attributes/measures/filters/sorts/totals themselves,
 * placeholders will be replaced with the actual values on the background.
 *
 * This allows you:
 * - share a reference to the same execution elements across multiple components.
 * - change the value of these execution elements with ease.
 * - decouple hardcoded execution elements from the visualizations.
 * - update any number of visualizations just by updating the placeholder value.
 *
 * Placeholder values are living in React context and you can obtain/set their values by the following hooks:
 * - {@link usePlaceholder}
 *
 * - {@link usePlaceholders}
 *
 * - {@link useComposedPlaceholder}
 *
 * - {@link useResolveValueWithPlaceholders}
 *
 * - {@link useResolveValuesWithPlaceholders}
 *
 * Note:
 * - Don't create placeholders manually, to create a new placeholder, use factory function {@link newPlaceholder}.
 * - To make it work, don't forget to wrap your application in {@link PlaceholdersProvider}.
 *
 * @public
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
 * @public
 */
export function isPlaceholder<T>(obj: unknown): obj is IPlaceholder<T> {
    return !isEmpty(obj) && (obj as IPlaceholder<T>).type === "IPlaceholder";
}

/**
 * Represents placeholder composed from other placeholders.
 *
 * @remarks
 * You can perform computation on top of resolved placeholder values.
 * Composed placeholders accepts also other composed placeholders as an input.
 *
 * You can provide custom resolution context to the composed placeholders,
 * and use it in your computation, but be aware that this context is shared across all composed placeholders in the call tree
 * (e.g. when you are calling composed placeholder composed from other composed placeholders,
 * each composed placeholder will be called with the same resolution context).
 *
 * @public
 */
export interface IComposedPlaceholder<TReturn, TValue extends any[], TContext> {
    type: "IComposedPlaceholder";
    placeholders: TValue;
    computeValue: (values: PlaceholdersResolvedValues<TValue>, resolutionContext: TContext) => TReturn;
    use: IUseComposedPlaceholderHook<IComposedPlaceholder<TReturn, TValue, TContext>>;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IComposedPlaceholder}.
 * @public
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
 * React hook to obtain and set {@link IPlaceholder} value.
 * @public
 */
export type IUsePlaceholderHook<T extends IPlaceholder<any>> = () => [
    PlaceholderValue<T> | undefined,
    (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>) => void,
];

/**
 * React hook to obtain {@link IComposedPlaceholder} value.
 * @public
 */
export type IUseComposedPlaceholderHook<T extends IComposedPlaceholder<any, any, any>> = (
    resolutionContext: ComposedPlaceholderResolutionContext<T>,
) => PlaceholderResolvedValue<T>;

/**
 * Get composed placeholder resolution context type.
 *
 * @example
 * ```
 * IComposedPlaceholder\<any, any, IResolutionContext\> is resolved as IResolutionContext
 * ```
 *
 * @public
 */
export type ComposedPlaceholderResolutionContext<T> = T extends IComposedPlaceholder<any, any, infer TContext>
    ? TContext
    : any;

/**
 * Convert union type to intersection type.
 *
 * @example
 * ```
 * number | string | boolean is resolved as number & string & boolean
 * Type1 | Type2 | Type3 is resolved as Type1 & Type2 & Type3
 * ```
 *
 * @public
 */
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
    ? R
    : never;

/**
 * Flatten array type.
 *
 * @remarks
 * If the type is not an array, return the same type.
 * Works only for 1 level, nested array types are not recursively flattened.
 *
 * @example
 * ```
 * number[] is resolved as number
 * string[][] is resolved as string[]
 * string is resolved as string
 * ```
 * @public
 */
export type Flatten<T> = T extends Array<infer A> ? A : T;

/**
 * Get placeholder value type.
 *
 * @remarks
 * If the type is not a placeholder, return the same type.
 *
 * @example
 * ```
 * IPlaceholder\<IAttribute\> is resolved as IAttribute
 * IPlaceholder\<IAttribute[]\> is resolved as IAttribute[]
 * IComposedPlaceholder\<IMeasure\> is resolved as IMeasure
 * null is resolved as null
 * ```
 *
 * @public
 */
export type PlaceholderValue<T> = T extends IPlaceholder<infer A>
    ? A
    : T extends IComposedPlaceholder<infer B, any, any>
    ? B
    : T;

/**
 * Convert tuple of placeholders to tuple of their respective value types.
 *
 * @example
 * [IPlaceholder\<IAttribute\>, IPlaceholder\<IAttribute[]\>] is resolved as [IAttribute, IAttribute[]]
 *
 * @remarks
 * Check mapped tuple types for more details:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
 *
 * @public
 */
export type PlaceholdersValues<Tuple extends [...any[]]> = {
    [Index in keyof Tuple]: PlaceholderValue<Tuple[Index]>;
};

/**
 * Convert any value that may contain placeholders to its resolved value type.
 *
 * @remarks
 * Nested array placeholders resolved value types are flattened.
 * If the type is not a placeholder, return the same type.
 *
 * @example
 * ```
 * IPlaceholder\<IAttribute\> is resolved as IAttribute
 * IPlaceholder\<IAttribute\>[] is resolved as IAttribute[]
 * IPlaceholder\<IAttribute[]\> is resolved as IAttribute[]
 * [IPlaceholder\<IAttribute[]\>, IPlaceholder\<IMeasure[]\>] is resolved as (IAttribute | IMeasure)[]
 * null is resolved as null
 * ```
 *
 * @public
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
 * @example
 * ```
 * [IPlaceholder\<IAttribute\>, IPlaceholder\<IAttribute[]\>] is resolved as [IAttribute, IAttribute[]]
 * [IPlaceholder\<IMeasure\>, IMeasure] is resolved as [IMeasure, IMeasure]
 * ```
 *
 * @remarks
 * Check mapped tuple types for more details:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
 *
 * @public
 */
export type PlaceholdersResolvedValues<Tuple extends any[]> = {
    [Index in keyof Tuple]: PlaceholderResolvedValue<Tuple[Index]>;
};

/**
 * Wrap each member of union type in the array.
 *
 * @example
 * ```
 * IAttribute | IMeasure | IFilter is resolved as IAttribute[] | IMeasure[] | IFilter[]
 * ```
 * @public
 */
export type ArrayOf<T> = T extends any ? T[] : never;

/**
 * Generate all possible combinations of arrays signatures for the union type.
 *
 * @example
 * ```
 * IAttribute | IMeasure is resolved as IAttribute[] | IMeasure[] | (IAttribute | IMeasure)[]
 * ```
 *
 * @public
 */
export type AnyArrayOf<T> = T[] | ArrayOf<T>;

/**
 * Wrap each member of the union type in AnyPlaceholder.
 *
 * @example
 * ```
 * IAttribute | IMeasure is resolved as AnyPlaceholder\<IAttribute\> | AnyPlaceholder\<IMeasure\>
 * ```
 *
 * @public
 */
export type PlaceholderOf<T> = T extends any ? AnyPlaceholder<T> : never;

/**
 * Generate all possible combinations of placeholder signatures for the union type.
 *
 * @example
 * ```
 * IAttribute | IMeasure
 * is resolved as
 * AnyPlaceholder\<IAttribute\> | AnyPlaceholder\<IMeasure\> | AnyPlaceholder\<IAttribute | IMeasure\>
 * ```
 * @public
 */
export type AnyPlaceholderOf<T> = AnyPlaceholder<T> | PlaceholderOf<T>;

/**
 * Represents value of type T or any placeholder that may hold value T.
 *
 * @public
 */
export type ValueOrPlaceholder<T> = T | AnyPlaceholderOf<T>;

/**
 * Represents array of values T or placeholders that may hold value T.
 *
 * @public
 */
export type ValuesOrPlaceholders<T> = AnyArrayOf<ValueOrMultiValuePlaceholder<T>>;

/**
 * Generate union of measures from union of measure definitions.
 *
 * @example
 * - IMeasureDefinition | IArithmeticMeasureDefinition is resolved as
 *   IMeasure\<IMeasureDefinition\> | IMeasure\<IArithmeticMeasureDefinition\>
 *
 * @public
 */
export type MeasureOf<T extends IMeasureDefinitionType> = T extends any ? IMeasure<T> : never;

/**
 * Represents all possible measure signatures.
 *
 * @public
 */
export type AnyMeasure = IMeasure | MeasureOf<IMeasureDefinitionType>;

/**
 * @public
 */
export type ValueOrMultiValuePlaceholder<T> = ValueOrPlaceholder<T> | AnyPlaceholderOf<T[]>;
