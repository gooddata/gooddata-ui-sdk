// (C) 2019-2022 GoodData Corporation
import { isAttribute } from "../attribute/index.js";
import {
    IDimension,
    isDimension,
    MeasureGroupIdentifier,
    newDimension,
    newTwoDimensional,
} from "../base/dimension.js";
import { ISortItem } from "../base/sort.js";
import { IAttributeOrMeasure, bucketAttributes, bucketMeasures, IBucket } from "../buckets/index.js";
import { bucketsAttributes, bucketsIsEmpty, bucketsMeasures } from "../buckets/bucketArray.js";
import { INullableFilter } from "../filter/index.js";
import { insightBuckets, insightFilters, insightSorts, IInsightDefinition } from "../../insight/index.js";
import { isMeasure } from "../measure/index.js";
import {
    defSetDimensions,
    defSetPostProcessing,
    defSetSorts,
    defWithFilters,
    defSetExecConfig,
    DimensionGenerator,
    IExecutionDefinition,
    IExecutionConfig,
    IPostProcessing,
} from "./index.js";
import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";
import { defValidate } from "./validation.js";

/**
 * Creates new, empty execution definition for the provided workspace.
 *
 * @param workspace - workspace to calculate on
 * @returns always new instance
 * @public
 */
export function emptyDef(workspace: string): IExecutionDefinition {
    return {
        workspace,
        buckets: [],
        attributes: [],
        measures: [],
        dimensions: [],
        filters: [],
        sortBy: [],
        postProcessing: {},
    };
}

/**
 * Prepares a new execution definition for a list of attributes and measures, filtered using the
 * provided filters.
 *
 * @remarks
 * This function MUST be used to implement IExecutionFactory.forItems();
 *
 * @param workspace - workspace to execute against, must not be empty
 * @param items - list of attributes and measures, must not be empty
 * @param filters - list of filters, may not be provided
 * @public
 */
export function newDefForItems(
    workspace: string,
    items: IAttributeOrMeasure[],
    filters: INullableFilter[] = [],
): IExecutionDefinition {
    invariant(workspace, "workspace to create exec def for must be specified");
    invariant(items, "items to create exec def from must be specified");

    const def: IExecutionDefinition = {
        ...emptyDef(workspace),
        attributes: items.filter(isAttribute),
        measures: items.filter(isMeasure),
    };

    defValidate(def);

    return defWithFilters(def, filters);
}

/**
 * Prepares a new execution definition for a list of buckets.
 *
 * @remarks
 * Attributes and measures WILL be transferred to the execution in natural order:
 *
 * - Order of items within a bucket is retained in the execution
 * - Items from first bucket appear before items from second bucket
 *
 * Or more specifically, given two buckets with items as [A1, A2, M1] and [A3, M2, M3], the resulting
 * prepared execution WILL have definition with attributes = [A1, A2, A3] and measures = [M1, M2, M3]
 *
 * This function MUST be used to implement IExecutionFactory.forBuckets();
 *
 * @param workspace - workspace to execute against, must not be empty
 * @param buckets - list of buckets with attributes and measures, must be non empty, must have at least one attr or measure
 * @param filters - optional, may not be provided
 * @public
 */
export function newDefForBuckets(
    workspace: string,
    buckets: IBucket[],
    filters: INullableFilter[] = [],
): IExecutionDefinition {
    invariant(workspace, "workspace to create exec def for must be specified");
    invariant(buckets, "buckets to create exec def from must be specified");

    const def: IExecutionDefinition = {
        ...emptyDef(workspace),
        buckets,
        attributes: bucketsAttributes(buckets),
        measures: bucketsMeasures(buckets),
    };

    defValidate(def);

    return defWithFilters(def, filters);
}

/**
 * Prepares a new execution definition for the provided insight.
 *
 * @remarks
 * Buckets with attributes and measures WILL be used
 * to obtain attributes and measures - the behavior WILL be same as in forBuckets() function. Filters, sort by
 * and totals in the insight WILL be included in the prepared execution.
 *
 * Additionally, an optional list of additional filters WILL be merged with the filters already defined in
 * the insight.
 *
 * - Attributes and measures from insight's buckets are distributed into definition attributes and measures
 *   in natural order.
 * - Insight filters are added into definition
 * - Insight sorts are added into definition
 * - Insight totals are added into definition
 *
 * This function MUST be used to implement IExecutionFactory.forInsight();
 *
 * @param workspace - workspace to execute against, must not be empty
 * @param insight - insight to create execution for, must have buckets which must have some attributes or measures in them
 * @param filters - optional, may not be provided
 * @public
 */
export function newDefForInsight(
    workspace: string,
    insight: IInsightDefinition,
    filters: INullableFilter[] = [],
): IExecutionDefinition {
    invariant(workspace, "workspace to create exec def for must be specified");
    invariant(insight, "insight to create exec def from must be specified");

    const def = newDefForBuckets(workspace, insightBuckets(insight));

    defValidate(def);

    const extraFilters = filters ? filters : [];
    const filteredDef = defWithFilters(def, [...insightFilters(insight), ...extraFilters]);

    return defSetSorts(filteredDef, insightSorts(insight));
}

/**
 * Changes sorting in the definition. Any sorting settings accumulated so far WILL be wiped out.
 *
 * @remarks
 * This function MUST be used to implement IPreparedExecution.withSorting();
 *
 * @param definition - definition to alter with sorting
 * @param sorts - items to sort by
 * @returns new execution with the updated sorts
 * @public
 */
export function defWithSorting(definition: IExecutionDefinition, sorts: ISortItem[]): IExecutionDefinition {
    return defSetSorts(definition, sorts);
}

/**
 * Changes additional execution configuration in the definition.
 *
 * @remarks
 * Any additional execution configuration settings accumulated so far WILL be wiped out.
 *
 * This function MUST be used to implement IPreparedExecution.withExecConfig();
 *
 * @param definition - definition to alter with execution config
 * @param config - configuration
 * @returns new execution with the updated sorts
 * @public
 */
export function defWithExecConfig(
    definition: IExecutionDefinition,
    config: IExecutionConfig,
): IExecutionDefinition {
    return defSetExecConfig(definition, config);
}

/**
 * Changes the postProcessing of a definition.
 *
 * @param definition - execution definition to alter with postProcessing
 * @param postProcessing - configuration that should be done with the data after they are obtained from the server
 *  and before they are passed to the user
 * @returns new execution with the specified postProcessing
 * @public
 */
export function defWithPostProcessing(
    definition: IExecutionDefinition,
    postProcessing: IPostProcessing,
): IExecutionDefinition {
    return defSetPostProcessing(definition, postProcessing);
}

/**
 * Changes the dateFormat of a postProcessing, other properties of postProcessing (if any) remain unchanged.
 *
 * @remarks
 * This function will call defWithPostProcessing to update definition with the new postProcessing.
 *
 * This function MUST be used to implement IPreparedExecution.withDateFormat();
 *
 * @param definition - execution definition to alter with postProcessing
 * @param dateFormat - Format to be applied to the dates in an AFM execution response.
 * @returns new execution with postProcessing updated with the specified dateFormat
 * @public
 */
export function defWithDateFormat(
    definition: IExecutionDefinition,
    dateFormat: string,
): IExecutionDefinition {
    const currentPostProcessing = definition.postProcessing || {};
    const postProcessing = {
        ...currentPostProcessing,
        dateFormat,
    };
    return defWithPostProcessing(definition, postProcessing);
}

/**
 * Configures dimensions in the exec definition.
 *
 * @remarks
 * Any dimension settings accumulated so far WILL be wiped out.
 * If dims is array if dimensions, they will be used as is. If it is an array whose first element is dimension
 * generation function, then the function will be called to obtain dimensions.
 *
 * This function MUST be used to implement IPreparedExecution.withDimensions(); its parameters are constructed in
 * a way that it can handle both signatures of the withDimensions().
 *
 * @param definition - execution definition to alter
 * @param dims - dimensions to set
 * @returns new execution with the updated dimensions
 * @public
 */
export function defWithDimensions(
    definition: IExecutionDefinition,
    ...dims: Array<IDimension | DimensionGenerator>
): IExecutionDefinition {
    return defSetDimensions(definition, toDimensions(dims, definition));
}

function toDimensions(
    dimsOrGen: Array<IDimension | DimensionGenerator>,
    def: IExecutionDefinition,
): IDimension[] {
    if (!dimsOrGen || isEmpty(dimsOrGen)) {
        return [];
    }

    const maybeGenerator = dimsOrGen[0];

    if (typeof maybeGenerator === "function") {
        return maybeGenerator(def);
    }

    return dimsOrGen.filter(isDimension);
}

function defaultDimensionsWithBuckets(buckets: IBucket[]): IDimension[] {
    const [firstBucket, ...otherBuckets] = buckets;

    if (bucketsIsEmpty(otherBuckets)) {
        if (bucketMeasures(firstBucket).length) {
            return newTwoDimensional([MeasureGroupIdentifier], bucketAttributes(firstBucket));
        }

        return [newDimension(bucketAttributes(firstBucket))];
    }

    const firstDim = bucketAttributes(firstBucket);
    const secondDim = bucketsAttributes(otherBuckets);

    return bucketMeasures(firstBucket).length
        ? newTwoDimensional([...firstDim, MeasureGroupIdentifier], secondDim)
        : newTwoDimensional(firstDim, [...secondDim, MeasureGroupIdentifier]);
}

function defaultDimensionsWithoutBuckets(definition: IExecutionDefinition): IDimension[] {
    if (definition.measures.length) {
        return newTwoDimensional([MeasureGroupIdentifier], definition.attributes);
    }

    return [newDimension(definition.attributes)];
}

/**
 * Default dimension generator for execution definition behaves as follows:
 *
 * @remarks
 * - If the definition was created WITHOUT 'buckets', then:
 *   - If there are no measures specified, then single dimension will be returned and will contain all attributes
 *   - If there are measures, then two dimensions will be returned; measureGroup will be in the first dimension
 *     and all attributes in the second dimension
 *
 * If the definition was created WITH 'buckets' then:
 *   - If there is just one bucket and it contains only attributes, then single dimension with all attributes will be returned
 *   - If there is just one bucket and it contains both attributes and measures, then two dimensions will be returned:
 *     measureGroup will be in first dimension, all other attributes in the second dimension
 *   - If there are multiple buckets, then all attributes from first bucket will be in first dimension and all attributes
 *     from other buckets in the second dimension. If the first bucket contains measure(s), then the MeasureGroup will
 *     be in first dimension. Otherwise it will be in second dimension.
 *
 * @param definition - execution definition to get dims for
 * @public
 */
export function defaultDimensionsGenerator(definition: IExecutionDefinition): IDimension[] {
    invariant(definition, "definition must be specified");

    const buckets = definition.buckets;

    return !bucketsIsEmpty(buckets)
        ? defaultDimensionsWithBuckets(buckets)
        : defaultDimensionsWithoutBuckets(definition);
}
