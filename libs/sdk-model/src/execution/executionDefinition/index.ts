// (C) 2019-2020 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import invariant from "ts-invariant";
import { IAttribute } from "../attribute";
import { dimensionTotals, IDimension } from "../base/dimension";
import { SortItem } from "../base/sort";
import { ITotal } from "../base/totals";
import { IBucket } from "../buckets";
import { IFilter } from "../filter";
import { mergeFilters } from "../filter/filterMerge";
import { IMeasure } from "../measure";

/**
 * Execution definition contains 100% complete description of what will the execution compute and how will
 * the resulting data look like.
 *
 * @public
 */
export interface IExecutionDefinition {
    readonly workspace: string;
    readonly buckets: IBucket[];
    readonly attributes: IAttribute[];
    readonly measures: IMeasure[];
    readonly filters: IFilter[];
    readonly sortBy: SortItem[];
    readonly dimensions: IDimension[];
}

/**
 * Function transforming a list of buckets (with attributes and measures) into execution dimension descriptors.
 *
 * @public
 */
export type DimensionGenerator = (def: IExecutionDefinition) => IDimension[];

/**
 * Creates new execution definition by merging new filters into an existing definition.
 *
 * @param def - existing definition
 * @param filters - array of filters to add to definition
 * @returns always new instance
 * @public
 */
export function defWithFilters(def: IExecutionDefinition, filters: IFilter[] = []): IExecutionDefinition {
    invariant(def, "execution definition to add more filters to must be defined");

    if (isEmpty(filters)) {
        return def;
    }

    return {
        ...def,
        filters: mergeFilters(def.filters, filters),
    };
}

/**
 * Creates new execution definition by merging new sort items into an existing definition.
 *
 * @param def - existing definition
 * @param sortBy - array of sort items to add to definition
 * @returns always new instance
 * @public
 */
export function defSetSorts(def: IExecutionDefinition, sortBy: SortItem[] = []): IExecutionDefinition {
    invariant(def, "execution definition to set sorts in must be defined");

    return {
        ...def,
        sortBy,
    };
}

/**
 * Gets totals from particular dimension in the provided execution definition.
 *
 * @param def - definition to get totals from
 * @param dimIdx - dimension index
 * @returns empty list if no definition or dimension with the provided index not defined or if there are no
 *  totals in the dimension
 * @public
 */
export function defTotals(def: IExecutionDefinition, dimIdx: number): ITotal[] {
    invariant(def, "execution definition to get totals for must be defined");

    if (!def.dimensions[dimIdx]) {
        return [];
    }

    return dimensionTotals(def.dimensions[dimIdx]);
}

/**
 * Creates new execution definition by slapping the provided dimensions on top of the definition.
 *
 * @param def - existing definition
 * @param dimensions - dimensions
 * @returns always new instance
 * @public
 */
export function defSetDimensions(
    def: IExecutionDefinition,
    dimensions: IDimension[] = [],
): IExecutionDefinition {
    invariant(def, "execution definition to set dimension for must be defined");

    return {
        ...def,
        dimensions,
    };
}
