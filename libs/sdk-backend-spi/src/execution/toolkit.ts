// (C) 2019 GoodData Corporation
import {
    AttributeOrMeasure,
    IBucket,
    IDimension,
    IFilter,
    IInsight,
    isDimension,
    SortItem,
    isMeasure,
    IAttribute,
    isAttribute,
} from "@gooddata/sdk-model";
import {
    defSetDimensions,
    defSetSorts,
    defWithFilters,
    IExecutionDefinition,
    newDefFromBuckets,
    newDefFromInsight,
    newDefFromItems,
} from "./executionDefinition";
import { DimensionGenerator } from "./index";
import isEmpty = require("lodash/isEmpty");

/*
 * This toolkit module defines reusable functions that MUST be used to build execution definition in
 * the various methods exposed by IExecutionFactory and IPreparedExecution. While the technicalities
 * of those implementations MAY vary from backend to backend, the domain agnostic concerns MUST be handled
 * with these functions.
 *
 * NOTE: going for this MVP way now; we may eventually expand this toolkit to a set of template classes / whatever
 * that provides guidelines and controls. Going further, there may even be a base package that can be common for
 * all backend implementations (preferred in the long run, we can keep it simple for now).
 */

/**
 * Prepares a new execution definition for a list of attributes and measures, optionally filtered using the
 * provided filters.
 *
 * This function MUST be used to implement IExecutionFactory.forItems();
 *
 * @param workspace - workspace to execute against, must not be empty
 * @param items - list of attributes and measures, must not be empty
 * @param filters - list of filters, may not be provided
 * @internal
 */
export function defForItems(
    workspace: string,
    items: AttributeOrMeasure[],
    filters?: IFilter[],
): IExecutionDefinition {
    return defWithFilters(newDefFromItems(workspace, items), filters);
}

/**
 * Prepares a new execution definition for a list of buckets. Attributes and measures WILL be transferred to the
 * execution in natural order:
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
 * @internal
 */
export function defForBuckets(
    workspace: string,
    buckets: IBucket[],
    filters?: IFilter[],
): IExecutionDefinition {
    return defWithFilters(newDefFromBuckets(workspace, buckets), filters);
}

/**
 * Prepares a new execution definition for the provided insight. Buckets with attributes and measures WILL be used
 * to obtain attributes and measures - the behavior WILL be same as in forBuckets() function. Filters, sort by
 * and totals in the insight WILL be included in the prepared execution.
 *
 * Additionally, an optional list of additional filters WILL be merged with the filters already defined in
 * the insight.
 *
 * This function MUST be used to implement IExecutionFactory.forInsight();
 *
 * @param workspace - workspace to execute against, must not be empty
 * @param insight - insight to create execution for, must have buckets which must have some attributes or measures in them
 * @param filters - optional, may not be provided
 * @internal
 */
export function defForInsight(
    workspace: string,
    insight: IInsight,
    filters?: IFilter[],
): IExecutionDefinition {
    return defWithFilters(newDefFromInsight(workspace, insight), filters);
}

/**
 * Changes sorting in the definition. Any sorting settings accumulated so far WILL be wiped out.
 *
 * This function MUST be used to implement IPreparedExecution.withSorting();
 *
 * @param definition - definition to alter with sorting
 * @param sorts - items to sort by
 * @returns new execution with the updated sorts
 * @internal
 */
export function defWithSorting(definition: IExecutionDefinition, sorts: SortItem[]): IExecutionDefinition {
    return defSetSorts(definition, sorts);
}

/**
 * Configures dimensions in the exec definition. Any dimension settings accumulated so far WILL be wiped out.
 * If dims is array if dimensions, they will be used as is. If it is an array whose first element is dimension
 * generation function, then the function will be called to obtain dimensions.
 *
 * This function MUST be used to implement IPreparedExecution.withDimensions(); its parameters are constructed in
 * a way that it can handle both signatures of the withDimensions().
 *
 * @param definition - execution definition to alter
 * @param dims - dimensions to set
 * @returns new execution with the updated dimensions
 * @internal
 */
export function defWithDimensions(
    definition: IExecutionDefinition,
    dims: Array<IDimension | DimensionGenerator>,
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
        return maybeGenerator(def.buckets);
    }

    return dimsOrGen.filter(isDimension);
}

const attributeLocalIdentifier = (attr: IAttribute): string => attr.attribute.localIdentifier;

const getAttributesLocalIdentifiers = (items: AttributeOrMeasure[]): string[] =>
    items.filter(isAttribute).map(attributeLocalIdentifier);

export function defaultDimensionsGenerator(definition: IExecutionDefinition): IDimension[] {
    const dimensions: IDimension[] = [];
    const emptyDim: IDimension = {
        itemIdentifiers: [],
    };
    const firstDim: IDimension = { ...emptyDim };
    let secondDim: IDimension | undefined;

    if (isEmpty(definition.buckets)) {
        const attrLocalIds = getAttributesLocalIdentifiers(definition.attributes);
        firstDim.itemIdentifiers = attrLocalIds;
        const hasMeasures = !isEmpty(definition.measures);
        if (hasMeasures) {
            firstDim.itemIdentifiers.push("measureGroup");
        }

        return [firstDim];
    }

    const [firstBucket, ...otherBuckets] = definition.buckets;

    const firstDimAttrLocalIds = getAttributesLocalIdentifiers(firstBucket.items);
    firstDim.itemIdentifiers = firstDimAttrLocalIds;
    dimensions.push(firstDim);

    if (!isEmpty(otherBuckets)) {
        const secondDimAttrLocalIds = otherBuckets.reduce((acc: string[], b) => {
            const attrLocalIds = getAttributesLocalIdentifiers(b.items);
            return [...acc, ...attrLocalIds];
        }, []);
        if (!isEmpty(secondDimAttrLocalIds)) {
            secondDim = { ...emptyDim };
            secondDim.itemIdentifiers = secondDimAttrLocalIds;
            dimensions.push(secondDim);
        }
    }

    const measureDimIdx = definition.buckets.findIndex(b => b.items.some(isMeasure));

    if (measureDimIdx !== -1) {
        dimensions[measureDimIdx].itemIdentifiers.push("measureGroup");
    }

    return dimensions;
}
