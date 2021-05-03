// (C) 2019-2021 GoodData Corporation
import { IAttribute, IAttributeOrMeasure, IFilter } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

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
export interface IPlaceholder {
    type: IPlaceholderType;
    id: string;
}

/**
 * @public
 */
export interface IAttributePlaceholder extends IPlaceholder {
    type: "IAttributePlaceholder";
    id: string;
    attribute?: IAttribute;
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
export function newAttributePlaceholder(id: string, defaultAttribute?: IAttribute) {
    const placeholder: IAttributePlaceholder = {
        type: "IAttributePlaceholder",
        id,
        attribute: defaultAttribute,
    };

    return placeholder;
}

/**
 * @public
 */
export interface IAttributeGroupPlaceholder extends IPlaceholder {
    type: "IAttributeGroupPlaceholder";
    id: string;
    attributes: Array<IAttribute | IAttributePlaceholder>;
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
export function newAttributeGroupPlaceholder(
    id: string,
    defaultAttributes: Array<IAttribute | IAttributePlaceholder> = [],
) {
    const placeholder: IAttributeGroupPlaceholder = {
        type: "IAttributeGroupPlaceholder",
        id,
        attributes: defaultAttributes,
    };

    return placeholder;
}

/**
 * @public
 */
export interface IMeasurePlaceholder extends IPlaceholder {
    type: "IMeasurePlaceholder";
    id: string;
    measure?: IAttributeOrMeasure;
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
export function newMeasurePlaceholder(id: string, defaultMeasure?: IAttributeOrMeasure) {
    const placeholder: IMeasurePlaceholder = {
        type: "IMeasurePlaceholder",
        id,
        measure: defaultMeasure,
    };

    return placeholder;
}

/**
 * @public
 */
export interface IMeasureGroupPlaceholder extends IPlaceholder {
    type: "IMeasureGroupPlaceholder";
    id: string;
    measures: Array<IAttributeOrMeasure | IMeasurePlaceholder>;
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
export function newMeasureGroupPlaceholder(
    id: string,
    defaultMeasures: Array<IAttributeOrMeasure | IMeasurePlaceholder> = [],
) {
    const placeholder: IMeasureGroupPlaceholder = {
        type: "IMeasureGroupPlaceholder",
        id,
        measures: defaultMeasures,
    };

    return placeholder;
}

/**
 * @public
 */
export interface IFilterPlaceholder extends IPlaceholder {
    type: "IFilterPlaceholder";
    id: string;
    filter?: IFilter;
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
export function newFilterPlaceholder(id: string, defaultFilter?: IFilter) {
    const placeholder: IFilterPlaceholder = {
        type: "IFilterPlaceholder",
        id,
        filter: defaultFilter,
    };

    return placeholder;
}

/**
 * @public
 */
export interface IFilterGroupPlaceholder extends IPlaceholder {
    type: "IFilterGroupPlaceholder";
    id: string;
    filters: Array<IFilter | IFilterPlaceholder>;
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
export function newFilterGroupPlaceholder(id: string, defaultFilters: IFilter[] = []) {
    const placeholder: IFilterGroupPlaceholder = {
        type: "IFilterGroupPlaceholder",
        id,
        filters: defaultFilters,
    };

    return placeholder;
}
