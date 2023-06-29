// (C) 2019-2021 GoodData Corporation
import {
    IFilter,
    IAttributeFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IAbsoluteDateFilter,
    IMeasureFilter,
    IDateFilter,
    IRelativeDateFilter,
    IMeasureValueFilter,
    IRankingFilter,
    INullableFilter,
    IAttribute,
    ISortItem,
    ITotal,
} from "@gooddata/sdk-model";
import {
    ValueOrPlaceholder,
    ValuesOrPlaceholders,
    AnyMeasure,
    ValueOrMultiValuePlaceholder,
} from "./base.js";

//
// Due to the combination of TypeScript union merging and the lack of ability to specify
// covariance / contravariance / bivariance of generic types,
// the only possible solution to solve generics assignment issues in strict mode
// (e.g. IPlaceholder<IAttributeFilter> is not assignable to IPlaceholder<IFilter>)
// is to explicitly specify all type combinations that make sense.
//

///

/**
 * Alias for all possible filter or placeholder signatures.
 *
 * @public
 */
export type FilterOrPlaceholder =
    | ValueOrPlaceholder<IFilter>
    | ValueOrPlaceholder<IDateFilter>
    | ValueOrPlaceholder<IMeasureFilter>
    | ValueOrPlaceholder<IAttributeFilter>
    //
    | ValueOrPlaceholder<IAbsoluteDateFilter>
    | ValueOrPlaceholder<IRelativeDateFilter>
    | ValueOrPlaceholder<IPositiveAttributeFilter>
    | ValueOrPlaceholder<INegativeAttributeFilter>
    | ValueOrPlaceholder<IMeasureValueFilter>
    | ValueOrPlaceholder<IRankingFilter>;

///

/**
 * Alias for all possible nullable filter or placeholder signatures.
 *
 * @public
 */
export type NullableFilterOrPlaceholder =
    | FilterOrPlaceholder
    | ValueOrPlaceholder<INullableFilter>
    | ValueOrPlaceholder<IFilter | null>
    | ValueOrPlaceholder<IDateFilter | null>
    | ValueOrPlaceholder<IMeasureFilter | null>
    | ValueOrPlaceholder<IAttributeFilter | null>
    //
    | ValueOrPlaceholder<IAbsoluteDateFilter | null>
    | ValueOrPlaceholder<IRelativeDateFilter | null>
    | ValueOrPlaceholder<IPositiveAttributeFilter | null>
    | ValueOrPlaceholder<INegativeAttributeFilter | null>
    | ValueOrPlaceholder<IMeasureValueFilter | null>
    | ValueOrPlaceholder<IRankingFilter | null>;

///

/**
 *
 * @public
 */
export type FilterOrMultiValuePlaceholder =
    | ValueOrMultiValuePlaceholder<IFilter>
    | ValueOrMultiValuePlaceholder<IDateFilter>
    | ValueOrMultiValuePlaceholder<IMeasureFilter>
    | ValueOrMultiValuePlaceholder<IAttributeFilter>
    //
    | ValueOrMultiValuePlaceholder<IAbsoluteDateFilter>
    | ValueOrMultiValuePlaceholder<IRelativeDateFilter>
    | ValueOrMultiValuePlaceholder<IPositiveAttributeFilter>
    | ValueOrMultiValuePlaceholder<INegativeAttributeFilter>
    | ValueOrMultiValuePlaceholder<IMeasureValueFilter>
    | ValueOrMultiValuePlaceholder<IRankingFilter>;

/**
 * Alias for all possible filters or their placeholder signatures.
 *
 * @public
 */
export type FiltersOrPlaceholders = Array<FilterOrMultiValuePlaceholder>;

///

/**
 * Alias for all possible nullable filters or their placeholder signatures.
 *
 * @public
 */
export type NullableFiltersOrPlaceholders = Array<
    | FilterOrMultiValuePlaceholder
    | ValueOrMultiValuePlaceholder<INullableFilter>
    | ValueOrMultiValuePlaceholder<IFilter | null>
    | ValueOrMultiValuePlaceholder<IDateFilter | null>
    | ValueOrMultiValuePlaceholder<IMeasureFilter | null>
    | ValueOrMultiValuePlaceholder<IAttributeFilter | null>
    //
    | ValueOrMultiValuePlaceholder<IAbsoluteDateFilter | null>
    | ValueOrMultiValuePlaceholder<IRelativeDateFilter | null>
    | ValueOrMultiValuePlaceholder<IPositiveAttributeFilter | null>
    | ValueOrMultiValuePlaceholder<INegativeAttributeFilter | null>
    | ValueOrMultiValuePlaceholder<IMeasureValueFilter | null>
    | ValueOrMultiValuePlaceholder<IRankingFilter | null>
>;

///

/**
 * Alias for all possible attribute filter or placeholder signatures.
 *
 * @public
 */
export type AttributeFilterOrPlaceholder =
    | ValueOrPlaceholder<IAttributeFilter>
    | ValueOrPlaceholder<IPositiveAttributeFilter>
    | ValueOrPlaceholder<INegativeAttributeFilter>;

/**
 * Alias for all possible attribute filters or their placeholder signatures.
 *
 * @public
 */
export type AttributeFiltersOrPlaceholders = Array<
    | ValueOrMultiValuePlaceholder<IAttributeFilter>
    | ValueOrMultiValuePlaceholder<IPositiveAttributeFilter>
    | ValueOrMultiValuePlaceholder<INegativeAttributeFilter>
>;

///

/**
 * Alias for all possible attribute or placeholder signatures.
 *
 * @public
 */
export type AttributeOrPlaceholder = ValueOrPlaceholder<IAttribute>;

/**
 * Alias for all possible attributes or their placeholder signatures.
 *
 * @public
 */
export type AttributesOrPlaceholders = ValuesOrPlaceholders<IAttribute>;

///

/**
 * Alias for all possible measure or placeholder signatures.
 *
 * @public
 */
export type MeasureOrPlaceholder = ValueOrPlaceholder<AnyMeasure>;

/**
 * Alias for all possible measures or their placeholder signatures.
 *
 * @public
 */
export type MeasuresOrPlaceholders = ValuesOrPlaceholders<AnyMeasure>;

///

/**
 * Alias for all possible attribute, measure or placeholder signatures.
 *
 * @public
 */
export type AttributeMeasureOrPlaceholder =
    | ValueOrPlaceholder<IAttribute | AnyMeasure>
    | ValueOrPlaceholder<IAttribute>
    | ValueOrPlaceholder<AnyMeasure>;

/**
 * Alias for all possible attributes, measures or their placeholders signatures.
 *
 * @public
 */
export type AttributesMeasuresOrPlaceholders = Array<
    | ValueOrMultiValuePlaceholder<IAttribute | AnyMeasure>
    | ValueOrMultiValuePlaceholder<IAttribute>
    | ValueOrMultiValuePlaceholder<AnyMeasure>
>;

///

/**
 * Alias for all possible sorts or their placeholders signatures.
 *
 * @public
 */
export type SortsOrPlaceholders = ValuesOrPlaceholders<ISortItem>;

///

/**
 * Alias for all possible totals or their placeholders signatures.
 *
 * @public
 */
export type TotalsOrPlaceholders = ValuesOrPlaceholders<ITotal>;
