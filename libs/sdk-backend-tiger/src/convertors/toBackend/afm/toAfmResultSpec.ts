// (C) 2007-2020 GoodData Corporation
import compact = require("lodash/compact");
import isEmpty = require("lodash/isEmpty");
import SortKey = ExecuteAFM.SortKey;
import IAttributeSortKey = ExecuteAFM.IAttributeSortKey;
import IValueSortKey = ExecuteAFM.IValueSortKey;
import IDimensionItemValue = ExecuteAFM.IDimensionItemValue;
import {
    attributeLocalId,
    bucketItems,
    bucketsFindAttribute,
    dimensionTotals,
    IExecutionDefinition,
    ILocatorItem,
    isAttribute,
    isAttributeLocator,
    isAttributeSort,
    ISortItem,
    MeasureGroupIdentifier,
    SortDirection,
    totalIsNative,
} from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/api-client-tiger";
import { convertVisualizationObjectFilter } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";
import { toLocalIdentifier } from "../ObjRefConverter";
import { convertAttribute } from "./AttributeConverter";

function convertAFM(def: IExecutionDefinition): ExecuteAFM.IAfm {
    const attributes: ExecuteAFM.IAttribute[] = def.attributes.map(convertAttribute);
    const attrProp = { attributes };

    const measures: ExecuteAFM.IMeasure[] = def.measures.map(convertMeasure);
    const measuresProp = { measures };

    const filters: ExecuteAFM.CompatibilityFilter[] = def.filters
        ? compact(def.filters.map(convertVisualizationObjectFilter))
        : [];
    const filtersProp = { filters };

    const nativeTotals = convertNativeTotals(def);
    const nativeTotalsProp = nativeTotals.length ? { nativeTotals } : {};

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp,
        ...nativeTotalsProp,
    };
}

function convertNativeTotals(def: IExecutionDefinition): ExecuteAFM.INativeTotalItem[] {
    // first find all native totals defined across dimensions
    const nativeTotals = def.dimensions
        .map(dimensionTotals)
        .reduce((acc, totals) => acc.concat(...totals), [])
        .filter(totalIsNative);

    return nativeTotals.map((t) => {
        // then for each native total, look across buckets (if any) for an attribute that is specified in
        // the total definition
        const attribute = bucketsFindAttribute(def.buckets, t.attributeIdentifier);

        // well - there is native total for attribute that is nowhere in them buckets - this must be caught earlier
        if (!attribute) {
            // TODO: ensure totals referencing missing attributes is not possible
            throw new Error("invalid invariant");
        }

        // now, knowing the bucket and index of the attribute.. take all attributes that are before it in
        // the bucket
        const rollupAttributes = bucketItems(attribute.bucket)
            .slice(0, attribute.idx)
            .filter(isAttribute)
            .map(attributeLocalId)
            .map(toLocalIdentifier);

        // and create native total such, that it rolls up all those attributes
        return {
            measureIdentifier: toLocalIdentifier(t.measureIdentifier),
            attributeIdentifiers: rollupAttributes,
        };
    });
}

function convertSortDirection(direction: SortDirection): ExecuteAFM.SortDirection {
    if (direction === "asc") {
        return "ASC";
    }

    return "DESC";
}

function merge(dims: ExecuteAFM.IDimension[], sorting: SortKey[][]): ExecuteAFM.IDimension[] {
    return dims.map((dim, idx) => {
        if (!isEmpty(sorting[idx])) {
            return {
                ...dim,
                sorting: sorting[idx],
            };
        }

        return dim;
    });
}

/**
 * This messed up function exists because PivotTable expects specific (bear) format of attribute element URIs from
 * which it construct table column ids. The logic behind column ids is deeply rooted (rotted-into) that it would
 * mean non-trivial changes / partial rewrites in the pivot table.
 *
 * To avoid that (because it will likely be several weeks worth of effort and testing), we opted for a dirty 'trick'
 * where tiger backend constructs attribute element URIs so that they resemble the bear URIs. The element ID is
 * actually the primaryLabelValue --> thing that can be used for sorting.
 *
 * This function caters for the dirty trick + in case the sorts were created 'normally', programatically by the
 * user who specified primaryLabelValue directly, it has logic to fall back to using the uri as-is.
 */
function extractItemValueFromElement(elementUri: string): string {
    const parsedUri = elementUri.match(/obj\/([^\/]*)(\/elements\?id=)?(.*)?$/);

    if (parsedUri && parsedUri[3]) {
        return parsedUri[3];
    }

    return elementUri;
}

function convertMeasureLocators(locators: ILocatorItem[]): IDimensionItemValue[] {
    return locators.map<IDimensionItemValue>((locator) => {
        if (isAttributeLocator(locator)) {
            return {
                itemIdentifier: locator.attributeLocatorItem.attributeIdentifier,
                itemValue: extractItemValueFromElement(locator.attributeLocatorItem.element),
            };
        } else {
            return {
                itemIdentifier: MeasureGroupIdentifier,
                itemValue: locator.measureLocatorItem.measureIdentifier,
            };
        }
    });
}

/**
 * Places sorting into dimensions. Returns new dimensions augmented by sorting. Does not mutate.
 *
 * Tiger does sorting differently from bear so this is somewhat more complicated than pure object conversions.
 *
 * 1. Sorting is now placed in the dimension that has to be sorted
 * 2. When sorting by attribute (headers), then the attribute sort key must be placed into the dimension that
 *    contains the attribute
 * 3. When sorting by measure, we now fall back to 'bear-like' behavior: the dimension opposite to the one
 *    that contains the measures will be sorted. It will be sorted using the measure (possibly scoped for
 *    particular attribute values) located in the MeasureGroup dimension.
 *
 * At the end, this function walks the sort items in the order defined by the user and distributes them into
 * the dimensions. The function is lenient for now and will log warnings and ignore anything weird that it
 * cannot process (e.g. measure sorting when there is no dim with MeasureGroup, or if there is only dim with MeasureGroup
 * and no other dim).
 *
 * @param dims - dimensions to add sorting to
 * @param sorts - sort items defined by SDK user
 */
function dimensionsWithSorts(dims: ExecuteAFM.IDimension[], sorts: ISortItem[]): ExecuteAFM.IDimension[] {
    if (isEmpty(sorts)) {
        return dims;
    }

    const nonMeasureDimIdx = dims.findIndex((dim) => !dim.itemIdentifiers.includes(MeasureGroupIdentifier));
    const measureDim = dims.find((dim) => dim.itemIdentifiers.includes(MeasureGroupIdentifier));
    const sorting: SortKey[][] = dims.map((_) => []);

    sorts.forEach((sortItem) => {
        if (isAttributeSort(sortItem)) {
            const attributeIdentifier = sortItem.attributeSortItem.attributeIdentifier;

            const attributeSortKey: IAttributeSortKey = {
                attribute: {
                    attributeIdentifier,
                    direction: convertSortDirection(sortItem.attributeSortItem.direction),
                },
            };

            const dimIdx = dims.findIndex((dim) => dim.itemIdentifiers.includes(attributeIdentifier));

            if (dimIdx < 0) {
                // tslint:disable-next-line:no-console
                console.log(
                    `attempting to sort by attribute with localId ${attributeIdentifier} but this attribute is not in any dimension.`,
                );

                return;
            }

            sorting[dimIdx].push(attributeSortKey);
        } else {
            if (nonMeasureDimIdx < 0) {
                // tslint:disable-next-line:no-console
                console.warn(
                    "Trying to use measure sort in an execution that only contains dimension with MeasureGroup. " +
                        "This is not valid sort. Measure sort is used to sort the non-measure dimension by values from measure dimension. Ignoring",
                );

                return;
            }

            if (!measureDim) {
                // tslint:disable-next-line:no-console
                console.warn(
                    "Trying to use measure sort in an execution that does not contain MeasureGroup. Ignoring.",
                );

                return;
            }

            const valueSortKey: IValueSortKey = {
                value: {
                    direction: convertSortDirection(sortItem.measureSortItem.direction),
                    dataColumnLocators: [
                        {
                            dimensionIdentifier: measureDim.localIdentifier,
                            locator: convertMeasureLocators(sortItem.measureSortItem.locators),
                        },
                    ],
                },
            };

            sorting[nonMeasureDimIdx].push(valueSortKey);
        }
    });

    return merge(dims, sorting);
}

function convertDimensions(def: IExecutionDefinition): ExecuteAFM.IDimension[] {
    const dimensionsWithoutSorts: ExecuteAFM.IDimension[] = def.dimensions.map((dim, idx) => {
        if (!isEmpty(dim.totals)) {
            throw new Error("Tiger backend does not support totals.");
        }

        return {
            localIdentifier: `dim_${idx}`,
            itemIdentifiers: dim.itemIdentifiers,
        };
    });

    return dimensionsWithSorts(dimensionsWithoutSorts, def.sortBy);
}

function convertResultSpec(def: IExecutionDefinition): ExecuteAFM.IResultSpec {
    const convertedDimensions = convertDimensions(def);
    const dimsProp = !isEmpty(convertedDimensions) ? { dimensions: convertedDimensions } : {};

    return {
        ...dimsProp,
    };
}

/**
 * Converts execution definition to AFM Execution
 *
 * @param def - execution definition
 * @returns AFM Execution
 */
export function toAfmExecution(def: IExecutionDefinition): ExecuteAFM.IExecution {
    return {
        project: def.workspace,
        resultSpec: convertResultSpec(def),
        execution: {
            ...convertAFM(def),
        },
    };
}
