// (C) 2019-2021 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { IAttribute, IFilter, IMeasure, ISortItem } from "@gooddata/sdk-model";
import {
    IPlaceholder,
    ISinglePlaceholder,
    IGroupPlaceholder,
    IComputedPlaceholder,
    PlaceholdersResolvedValues,
} from "./base";
import { usePlaceholder } from "./hooks";

/**
 * @public
 */
export interface ISinglePlaceholderOptions<T> {
    /**
     * By default, each placeholder has a unique generated id.
     * You can optionally provide id of the placeholder which can be useful for debugging.
     * Please note that the id should be unique for all your placeholders.
     */
    id?: string;

    /**
     * Optionally provide function to validate the placeholder value.
     */
    validate?: (value?: T) => void;
}

/**
 * Create a new single placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newSinglePlaceholder<T>(
    defaultValue?: T,
    options: ISinglePlaceholderOptions<T> = {},
): ISinglePlaceholder<T> {
    const { id, validate } = options;
    const placeholder: ISinglePlaceholder<T> = {
        type: "ISinglePlaceholder",
        id: id ?? uuidv4(),
        defaultValue,
        validate,
        use: () => usePlaceholder(placeholder),
    };

    return placeholder;
}

/**
 * @public
 */
export interface IGroupPlaceholderOptions<T extends any[]> {
    /**
     * By default, each group placeholder has a unique generated id.
     * You can optionally provide id of the placeholder which can be useful for debugging.
     * Please note that the id should be unique for all your group placeholders.
     */
    id?: string;

    /**
     * Optionally provide function to validate the placeholder value.
     */
    validate?: (values?: [...T]) => void;
}

/**
 * Create a new group placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newGroupPlaceholder<T extends any[]>(
    defaultValue?: T,
    options: IGroupPlaceholderOptions<T> = {},
): IGroupPlaceholder<T> {
    const { id, validate } = options;
    const placeholder: IGroupPlaceholder<T> = {
        type: "IGroupPlaceholder",
        id: id ?? uuidv4(),
        defaultValue,
        validate,
        use: () => usePlaceholder(placeholder),
    };

    return placeholder;
}

/**
 * @public
 */
export interface IComputedPlaceholderOptions<T extends any[]> {
    /**
     * Optionally provide function to validate the coming input from placeholders.
     */
    validate?: (values?: PlaceholdersResolvedValues<T>) => void;
}

/**
 * Create a new computed  placeholder.
 * See {@link IComputedPlaceholder} and {@link IPlaceholder} to read more details.
 *
 * @public
 */
export function newComputedPlaceholder<TReturn, TPlaceholders extends IPlaceholder[]>(
    placeholders: [...TPlaceholders],
    // TODO: accept also custom arguments
    computeValue: (resolvedValues: PlaceholdersResolvedValues<TPlaceholders>) => TReturn,
    options: IComputedPlaceholderOptions<TPlaceholders> = {},
): IComputedPlaceholder<TReturn, TPlaceholders> {
    const { validate } = options;
    const placeholder: IComputedPlaceholder<TReturn, TPlaceholders> = {
        type: "IComputedPlaceholder",
        placeholders,
        computeValue,
        validate,
        // TODO: useComputedPlaceholder (usePlaceholder does not make sense, you cannot set computed placeholder)
        use: () => usePlaceholder(placeholder),
    };

    return placeholder;
}

/**
 * Measure placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export type IMeasurePlaceholder<T extends IMeasure = IMeasure<any>> = ISinglePlaceholder<T>;

/**
 * Create a new measure placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newMeasurePlaceholder<T extends IMeasure>(
    defaultMeasure?: T,
    options: ISinglePlaceholderOptions<T> = {},
): IMeasurePlaceholder<T> {
    return newSinglePlaceholder(defaultMeasure, options);
}

/**
 * @public
 */
export type IMeasureOrPlaceholder = IMeasure<any> | IMeasurePlaceholder | IMeasureGroupPlaceholder<any>;

/**
 * Measure group placeholder.
 * See {@link IGroupPlaceholder} to read more details about placeholder groups.
 *
 * @public
 */
export type IMeasureGroupPlaceholder<
    T extends IMeasureOrPlaceholder[] = IMeasureOrPlaceholder[]
> = IGroupPlaceholder<T>;

/**
 * Create a new measure group placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newMeasureGroupPlaceholder<T extends IMeasureOrPlaceholder[]>(
    defaultMeasures?: T,
    options: IGroupPlaceholderOptions<T> = {},
): IMeasureGroupPlaceholder<T> {
    return newGroupPlaceholder<T>(defaultMeasures, options);
}

/**
 * Attribute placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export type IAttributePlaceholder = ISinglePlaceholder<IAttribute>;

/**
 * Create a new attribute placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newAttributePlaceholder(
    defaultAttribute?: IAttribute,
    options: ISinglePlaceholderOptions<IAttribute> = {},
): IAttributePlaceholder {
    return newSinglePlaceholder(defaultAttribute, options);
}

/**
 * @public
 */
export type IAttributeOrPlaceholder = IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder<any>;

/**
 * Attribute group placeholder.
 * See {@link IGroupPlaceholder} to read more details about placeholder groups.
 *
 * @public
 */
export type IAttributeGroupPlaceholder<
    T extends IAttributeOrPlaceholder[] = IAttributeOrPlaceholder[]
> = IGroupPlaceholder<T>;

/**
 * Create a new attribute group placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newAttributeGroupPlaceholder<T extends IAttributeOrPlaceholder[]>(
    defaultAttributes?: T,
    options: IGroupPlaceholderOptions<T> = {},
): IAttributeGroupPlaceholder<T> {
    return newGroupPlaceholder(defaultAttributes, options);
}

/**
 * Filter placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export type IFilterPlaceholder<T extends IFilter = IFilter> = ISinglePlaceholder<T>;

/**
 * Create a new filter placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newFilterPlaceholder<T extends IFilter>(
    defaultFilter?: T,
    options: ISinglePlaceholderOptions<T> = {},
): IFilterPlaceholder<T> {
    return newSinglePlaceholder(defaultFilter, options);
}

/**
 * @public
 */
export type IFilterOrPlaceholder = IFilter | IFilterPlaceholder<any> | IFilterGroupPlaceholder<any>;

/**
 * Filter group placeholder.
 * See {@link IGroupPlaceholder} to read more details about placeholder groups.
 *
 * @public
 */
export type IFilterGroupPlaceholder<
    T extends IFilterOrPlaceholder[] = IFilterOrPlaceholder[]
> = IGroupPlaceholder<T>;

/**
 * Create a new filter group placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newFilterGroupPlaceholder<T extends IFilterOrPlaceholder[]>(
    defaultFilters?: T,
    options: IGroupPlaceholderOptions<T> = {},
): IFilterGroupPlaceholder<T> {
    return newGroupPlaceholder(defaultFilters, options);
}

/**
 * Sort placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export type ISortPlaceholder<T extends ISortItem = ISortItem> = ISinglePlaceholder<T>;

/**
 * Create a new sort placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newSortPlaceholder<T extends ISortItem>(
    defaultSort?: T,
    options: ISinglePlaceholderOptions<T> = {},
): ISortPlaceholder<T> {
    return newSinglePlaceholder(defaultSort, options);
}

/**
 * @public
 */
export type ISortOrPlaceholder = ISortItem | ISortPlaceholder<any> | ISortGroupPlaceholder<any>;

/**
 * Sort group placeholder.
 * See {@link IGroupPlaceholder} to read more details about placeholder groups.
 *
 * @public
 */
export type ISortGroupPlaceholder<
    T extends ISortOrPlaceholder[] = ISortOrPlaceholder[]
> = IGroupPlaceholder<T>;

/**
 * Create a new sort group placeholder.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function newSortGroupPlaceholder<T extends ISortOrPlaceholder[]>(
    defaultSorts?: T,
    options: IGroupPlaceholderOptions<T> = {},
): ISortGroupPlaceholder<T> {
    return newGroupPlaceholder(defaultSorts, options);
}
