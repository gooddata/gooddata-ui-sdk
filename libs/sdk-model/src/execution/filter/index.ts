// (C) 2019-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";
import { ObjRef, ObjRefInScope } from "../../objRef/index.js";
import { DateAttributeGranularity, AllTimeGranularity } from "../../base/dateGranularities.js";

/**
 * Attribute elements specified by their URI.
 *
 * @remarks
 * NOTE: attribute element URIs MAY NOT be transferable across workspaces. On some backends (such as bear)
 * same element WILL have different URI in each workspace. In general we recommend using URIs only if your code retrieves
 * them at runtime from backend using elements query or from the data view's headers. Hardcoding URIs is never a good idea, if
 * you find yourself doing that, please consider specifying attribute elements by value
 *
 * See {@link IAttributeElementsByValue}
 *
 * @public
 */
export interface IAttributeElementsByRef {
    uris: Array<string | null>;
}

/**
 * Attribute elements specified by their textual value.
 *
 * @public
 */
export interface IAttributeElementsByValue {
    values: Array<string | null>;
}

/**
 * Attribute elements are used in positive and negative attribute filters. They can be specified either
 * using URI (primary key) or using textual values of the attribute elements.
 *
 * @public
 */
export type IAttributeElements = IAttributeElementsByRef | IAttributeElementsByValue;

/**
 * Object defining the {@link IPositiveAttributeFilter} object body.
 *
 * @public
 */
export interface IPositiveAttributeFilterBody {
    /**
     * Display form whose attribute elements are included in the 'in' list.
     */
    displayForm: ObjRef;

    /**
     * Attribute elements to filter in. The attribute elements can be specified either using
     * their human readable value or by using their URI = the primary key. Using either representation has
     * the same effect. While using human readable representation may be more readable in the client code,
     * the using URI will likely have better performance on the backend.
     */
    in: IAttributeElements;
}

/**
 * Positive attribute filter essentially adds an `IN <set>` condition to the execution on the backend.
 *
 * @remarks
 * When the condition is applied on attribute display form which is included in execution, it essentially limits the
 * attribute elements that will be returned in the results: only those elements that are in the provided list
 * will be returned.
 *
 * The filter can be specified even for attributes that are not included in the execution - such a filter then
 * MAY influence the results of the execution indirectly: if the execution definition specifies MAQL measures that
 * use the filtered attribute.
 *
 * If the attribute elements in the `in` property are empty, then the filter is NOOP.
 * @public
 */
export interface IPositiveAttributeFilter {
    positiveAttributeFilter: IPositiveAttributeFilterBody;
}

/**
 * Object defining the {@link INegativeAttributeFilter} object body.
 *
 * @public
 */
export interface INegativeAttributeFilterBody {
    /**
     * Display form whose attribute elements are included in the 'notIn' list.
     */
    displayForm: ObjRef;

    /**
     * Attribute elements to filter out. The attribute elements can be specified either using
     * their human readable value or by using they URI = the primary key. Using either representation has
     * the same effect. While using human readable representation may be more readable in the client code,
     * the using URI will likely have better performance on the backend.
     */
    notIn: IAttributeElements;
}

/**
 * Negative attribute filter essentially adds an `NOT IN <set>` condition to the execution on the backend.
 *
 * @remarks
 * When the condition is applied on attribute display form which is included in execution, it essentially limits the
 * attribute elements that will be returned in the results: only those elements that ARE NOT in the provided list
 * will be returned.
 *
 * The filter can be specified even for attributes that are not included in the execution - such a filter then
 * MAY influence the results of the execution indirectly: if the execution definition specifies MAQL measures that
 * use the filtered attribute.
 *
 * If the attribute elements in the `notIn` property are empty, then the filter is NOOP.
 *
 * @public
 */
export interface INegativeAttributeFilter {
    negativeAttributeFilter: INegativeAttributeFilterBody;
}

/**
 * Filters results to an absolute date range - from one fixed date to another.
 *
 * @public
 */
export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        /**
         * Date data set for filtering
         */
        dataSet: ObjRef;

        /**
         * Start date (including): this is in format 'YYYY-MM-DD'
         */
        from: string;

        /**
         * End date (including): this is in format 'YYYY-MM-DD'
         */
        to: string;
    };
}

/**
 * Filters results to a relative date range.
 *
 * @remarks
 * The relative filtering is always done on some granularity - this specifies
 * the units in the 'from' and 'to' fields.
 *
 * See {@link DateAttributeGranularity}, {@link AllTimeGranularity} and {@link DateGranularity} for further detail.
 * @public
 */
export type IRelativeDateFilter =
    | {
          relativeDateFilter: {
              dataSet: ObjRef;
              granularity: DateAttributeGranularity;
              from: number;
              to: number;
          };
      }
    | {
          relativeDateFilter: {
              dataSet: ObjRef;
              granularity: AllTimeGranularity;
              from: 0;
              to: 0;
          };
      };

/**
 * Attribute filters limit results of execution to data pertaining to attributes that are or are not specified
 * by the filters.
 *
 * @public
 */
export type IAttributeFilter = IPositiveAttributeFilter | INegativeAttributeFilter;

/**
 * Date filters limit the range of results to data within relative or absolute date range.
 *
 * @public
 */
export type IDateFilter = IRelativeDateFilter | IAbsoluteDateFilter;

/**
 * @public
 */
export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

/**
 * @public
 */
export interface IComparisonConditionBody {
    operator: ComparisonConditionOperator;
    value: number;
    treatNullValuesAs?: number;
}

/**
 * @public
 */
export interface IComparisonCondition {
    comparison: IComparisonConditionBody;
}

/**
 * @public
 */
export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

/**
 * Object defining the {@link IRangeCondition} object body.
 *
 * @public
 */
export interface IRangeConditionBody {
    operator: RangeConditionOperator;
    from: number;
    to: number;
    treatNullValuesAs?: number;
}

/**
 * @public
 */
export interface IRangeCondition {
    range: IRangeConditionBody;
}

/**
 * @public
 */
export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

/**
 * Object defining the {@link IMeasureValueFilter} object body.
 *
 * @public
 */
export interface IMeasureValueFilterBody {
    measure: ObjRefInScope;
    condition?: MeasureValueFilterCondition;
}

/**
 * @public
 */
export interface IMeasureValueFilter {
    measureValueFilter: IMeasureValueFilterBody;
}

/**
 * @public
 */
export type RankingFilterOperator = "TOP" | "BOTTOM";

/**
 * Object defining the {@link IRankingFilter} object body.
 *
 * @public
 */
export interface IRankingFilterBody {
    measure: ObjRefInScope;
    attributes?: ObjRefInScope[];
    operator: RankingFilterOperator;
    value: number;
}

/**
 * @public
 */
export interface IRankingFilter {
    rankingFilter: IRankingFilterBody;
}

/**
 * All possible filters.
 *
 * @public
 */
export type IFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter
    | IMeasureValueFilter
    | IRankingFilter;

/**
 * Represents a filter specification variant where either the actual filter or a 'null' filter is
 * provided. Null filters will be ignored during processing.
 *
 * @public
 */
export type INullableFilter = IFilter | undefined | null;

/**
 * All possible filters that can be specified for a simple measure.
 *
 * @public
 */
export type IMeasureFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;

//
// Type guards
//

/**
 * Type guard checking whether the provided object is a positive attribute filter.
 *
 * @public
 */
export function isPositiveAttributeFilter(obj: unknown): obj is IPositiveAttributeFilter {
    return !isEmpty(obj) && (obj as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a negative attribute filter.
 *
 * @public
 */
export function isNegativeAttributeFilter(obj: unknown): obj is INegativeAttributeFilter {
    return !isEmpty(obj) && (obj as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is an absolute date filter.
 *
 * @public
 */
export function isAbsoluteDateFilter(obj: unknown): obj is IAbsoluteDateFilter {
    return !isEmpty(obj) && (obj as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a relative date filter.
 *
 * @public
 */
export function isRelativeDateFilter(obj: unknown): obj is IRelativeDateFilter {
    return !isEmpty(obj) && (obj as IRelativeDateFilter).relativeDateFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is an all time date filter.
 *
 * @public
 */
export function isAllTimeDateFilter(
    obj: unknown,
): obj is IRelativeDateFilter & { relativeDateFilter: { granularity: "ALL_TIME_GRANULARITY" } } {
    return (
        !isEmpty(obj) &&
        (obj as IRelativeDateFilter).relativeDateFilter?.granularity === "ALL_TIME_GRANULARITY"
    );
}

/**
 * Type guard checking whether the provided object is an attribute filter.
 *
 * @public
 */
export function isAttributeFilter(obj: unknown): obj is IAttributeFilter {
    return isPositiveAttributeFilter(obj) || isNegativeAttributeFilter(obj);
}

/**
 * Type guard checking whether the provided object is a date filter.
 *
 * @public
 */
export function isDateFilter(obj: unknown): obj is IDateFilter {
    return isRelativeDateFilter(obj) || isAbsoluteDateFilter(obj);
}

/**
 * Type guard checking whether the provided object is a measure value filter.
 *
 * @public
 */
export function isMeasureValueFilter(obj: unknown): obj is IMeasureValueFilter {
    return !isEmpty(obj) && (obj as IMeasureValueFilter).measureValueFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a ranking filter.
 *
 * @public
 */
export function isRankingFilter(obj: unknown): obj is IRankingFilter {
    return !isEmpty(obj) && (obj as IRankingFilter).rankingFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a filter.
 *
 * @public
 */
export function isFilter(obj: unknown): obj is IFilter {
    return isDateFilter(obj) || isAttributeFilter(obj) || isMeasureValueFilter(obj) || isRankingFilter(obj);
}

/**
 * Type guard checking whether the provided object is a measure value filter's comparison condition.
 *
 * @public
 */
export function isComparisonCondition(obj: unknown): obj is IComparisonCondition {
    return !isEmpty(obj) && (obj as IComparisonCondition).comparison !== undefined;
}

/**
 * Type guard checking whether the provided operator is a measure value filter's comparison operator.
 *
 * @public
 */
export function isComparisonConditionOperator(obj: unknown): obj is ComparisonConditionOperator {
    return (
        obj === "GREATER_THAN" ||
        obj === "GREATER_THAN_OR_EQUAL_TO" ||
        obj === "LESS_THAN" ||
        obj === "LESS_THAN_OR_EQUAL_TO" ||
        obj === "EQUAL_TO" ||
        obj === "NOT_EQUAL_TO"
    );
}

/**
 * Type guard checking whether the provided object is a measure value filter's range condition.
 *
 * @public
 */
export function isRangeCondition(obj: unknown): obj is IRangeCondition {
    return !isEmpty(obj) && (obj as IRangeCondition).range !== undefined;
}

/**
 * Type guard checking whether the provided object is a measure value filter's range condition operator.
 *
 * @public
 */
export function isRangeConditionOperator(obj: unknown): obj is RangeConditionOperator {
    return obj === "BETWEEN" || obj === "NOT_BETWEEN";
}

/**
 * Type guard checking whether the provided object is list of attribute elements specified by URI reference.
 *
 * @public
 */
export function isAttributeElementsByRef(obj: unknown): obj is IAttributeElementsByRef {
    return !isEmpty(obj) && (obj as IAttributeElementsByRef).uris !== undefined;
}

/**
 * Type guard checking whether the provided object is list of attribute elements specified by their text value.
 *
 * @public
 */
export function isAttributeElementsByValue(obj: unknown): obj is IAttributeElementsByValue {
    return !isEmpty(obj) && (obj as IAttributeElementsByValue).values !== undefined;
}

//
// Functions
//

/**
 * Tests whether the provided attribute element does not specify any attribute elements.
 *
 * @param filter - attribute filter to test
 * @returns true if empty = no attribute elements
 * @public
 */
export function filterIsEmpty(filter: IAttributeFilter): boolean {
    invariant(filter, "filter must be specified");

    if (isPositiveAttributeFilter(filter)) {
        return attributeElementsIsEmpty(filter.positiveAttributeFilter.in);
    }

    return attributeElementsIsEmpty(filter.negativeAttributeFilter.notIn);
}

/**
 * Tests whether the attribute elements object is empty.
 *
 * @param attributeElements - object to test
 * @returns true if empty = attribute elements not specified in any way (URI or value)
 * @internal
 */
export function attributeElementsIsEmpty(attributeElements: IAttributeElements): boolean {
    invariant(attributeElements, "attribute elements must be specified");

    if (isAttributeElementsByRef(attributeElements)) {
        return isEmpty(attributeElements.uris);
    }

    return isEmpty(attributeElements.values);
}

/**
 * Gets the number of items in the {@link IAttributeElements}.
 *
 * @param attributeElements - object to test
 * @returns the number of items
 * @internal
 */
export function attributeElementsCount(attributeElements: IAttributeElements): number {
    invariant(attributeElements, "attribute elements must be specified");

    if (isAttributeElementsByRef(attributeElements)) {
        return attributeElements.uris.length;
    }

    return attributeElements.values.length;
}

/**
 * Gets the items from the {@link IAttributeElements}.
 *
 * @param attributeElements - object to get items from
 * @returns the array of items
 * @internal
 */
export function getAttributeElementsItems(attributeElements: IAttributeElements): Array<string | null> {
    invariant(attributeElements, "attribute elements must be specified");

    if (isAttributeElementsByRef(attributeElements)) {
        return attributeElements.uris;
    }

    return attributeElements.values;
}

/**
 * Updates the items in the {@link IAttributeElements}.
 *
 * @param attributeElements - object to update items in
 * @param newItems - new items to put into attributeElements
 * @returns updated attributeElements object with new item values
 * @internal
 */
export function updateAttributeElementsItems(
    attributeElements: IAttributeElements,
    newItems: Array<string | null>,
): IAttributeElements {
    invariant(attributeElements, "attribute elements must be specified");

    if (isAttributeElementsByRef(attributeElements)) {
        return {
            ...attributeElements,
            uris: newItems,
        };
    }

    return {
        ...attributeElements,
        values: newItems,
    };
}

/**
 * Gets attribute elements specified on the attribute filter.
 *
 * @param filter - attribute filter to work with
 * @returns attribute elements, undefined if not available
 * @public
 */
export function filterAttributeElements(
    filter: IPositiveAttributeFilter | INegativeAttributeFilter,
): IAttributeElements;
/**
 * Gets attribute elements specified on a filter. If the provided filter is not an attribute filter, then
 * undefined is returned
 *
 * @param filter - filter to work with
 * @returns attribute elements, undefined if not available
 * @public
 */
export function filterAttributeElements(filter: IFilter): IAttributeElements | undefined;
export function filterAttributeElements(filter: IFilter): IAttributeElements | undefined {
    invariant(filter, "attribute elements must be specified");

    if (!isAttributeFilter(filter)) {
        return undefined;
    }

    return isPositiveAttributeFilter(filter)
        ? filter.positiveAttributeFilter.in
        : filter.negativeAttributeFilter.notIn;
}

/**
 * Gets reference to object being used for filtering.
 *
 * @remarks
 * For attribute filters, this will be reference to the display form. For date filters this will be reference to the data set.
 *
 * @param filter - filter to work with
 * @returns reference to object used for filtering (display form for attr filters, data set for date filters)
 * @public
 */
export function filterObjRef(
    filter: IAbsoluteDateFilter | IRelativeDateFilter | IPositiveAttributeFilter | INegativeAttributeFilter,
): ObjRef;
/**
 * Gets reference to object being used for filtering.
 *
 * @remarks
 * For attribute filters, this will be reference to the display form.
 * For date filters this will be reference to the data set. For measure value filter, this will be undefined.
 *
 * @param filter - filter to work with
 * @returns reference to object used for filtering (display form for attr filters, data set for date filters), undefined
 *  for measure value filters
 * @public
 */
export function filterObjRef(filter: IFilter): ObjRef | undefined;
export function filterObjRef(filter: IFilter): ObjRef | undefined {
    invariant(filter, "filter must be specified");

    if (isPositiveAttributeFilter(filter)) {
        return filter.positiveAttributeFilter.displayForm;
    }
    if (isNegativeAttributeFilter(filter)) {
        return filter.negativeAttributeFilter.displayForm;
    }
    if (isAbsoluteDateFilter(filter)) {
        return filter.absoluteDateFilter.dataSet;
    }
    if (isRelativeDateFilter(filter)) {
        return filter.relativeDateFilter.dataSet;
    }
    return undefined;
}

/**
 * Gets reference to a measure being used for filtering if the provided filter is measure based. For other filters return undefined.
 *
 * @public
 */
export function filterMeasureRef(filter: IFilter): ObjRefInScope | undefined {
    return isRankingFilter(filter)
        ? filter.rankingFilter.measure
        : isMeasureValueFilter(filter)
        ? filter.measureValueFilter.measure
        : undefined;
}

/**
 * Represents values of an absolute filter.
 *
 * @public
 */
export interface IAbsoluteDateFilterValues {
    from: string;
    to: string;
}

/**
 * Gets effective values of an absolute date filter.
 *
 * @param filter - date filter to work with
 * @returns filter values
 * @public
 */
export function absoluteDateFilterValues(filter: IAbsoluteDateFilter): IAbsoluteDateFilterValues {
    invariant(filter, "filter must be specified");

    return {
        from: filter.absoluteDateFilter.from,
        to: filter.absoluteDateFilter.to,
    };
}

/**
 * Represents values of a relative filter.
 *
 * @public
 */
export interface IRelativeDateFilterValues {
    from: number;
    to: number;
    granularity: string;
}

/**
 * Gets effective values of a relative date filter.
 *
 * @param filter - date filter to work with
 * @returns filter values
 * @public
 */
export function relativeDateFilterValues(filter: IRelativeDateFilter): IRelativeDateFilterValues {
    invariant(filter, "filter must be specified");

    return {
        from: filter.relativeDateFilter.from,
        to: filter.relativeDateFilter.to,
        granularity: filter.relativeDateFilter.granularity,
    };
}

/**
 * Gets measure value filter measure.
 * @param filter - measure value filter to work with
 * @returns filter measure
 * @public
 */
export function measureValueFilterMeasure(filter: IMeasureValueFilter): ObjRefInScope {
    invariant(filter, "filter must be specified");

    return filter.measureValueFilter.measure;
}

/**
 * Gets measure value filter condition.
 * @param filter - measure value filter to work with
 * @returns filter condition
 * @public
 */
export function measureValueFilterCondition(
    filter: IMeasureValueFilter,
): MeasureValueFilterCondition | undefined {
    invariant(filter, "filter must be specified");

    return filter.measureValueFilter.condition;
}

/**
 * Gets operator used in measure value filter condition.
 *
 * @param filter - filter to get operator from
 * @returns undefined if no condition in the filter
 * @public
 */
export function measureValueFilterOperator(
    filter: IMeasureValueFilter,
): ComparisonConditionOperator | RangeConditionOperator | undefined {
    invariant(filter, "filter must be specified");

    if (isComparisonCondition(filter.measureValueFilter.condition)) {
        return filter.measureValueFilter.condition.comparison.operator;
    } else if (isRangeCondition(filter.measureValueFilter.condition)) {
        return filter.measureValueFilter.condition.range.operator;
    }

    return undefined;
}
