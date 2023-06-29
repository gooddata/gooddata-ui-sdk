// (C) 2007-2022 GoodData Corporation
import {
    Dimension,
    SortKeyAttribute,
    SortKeyAttributeAttributeDirectionEnum,
    SortKeyAttributeAttributeSortTypeEnum,
    SortKeyValue,
} from "@gooddata/api-client-tiger";
import {
    IExecutionDefinition,
    ILocatorItem,
    isAttributeAreaSort,
    isAttributeLocator,
    isMeasureLocator,
    isAttributeSort,
    ISortItem,
    MeasureGroupIdentifier,
    SortDirection,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import findIndex from "lodash/findIndex.js";

type SortKey = SortKeyAttribute | SortKeyValue;

function merge(dims: Dimension[], sorting: SortKey[][]): Dimension[] {
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

function convertSortDirection(direction: SortDirection): SortKeyAttributeAttributeDirectionEnum {
    if (direction === "asc") {
        return SortKeyAttributeAttributeDirectionEnum.ASC;
    }

    return SortKeyAttributeAttributeDirectionEnum.DESC;
}

/**
 * For normal attribute sort by value:
 * - DEFAULT sort type is always used.
 * It means, that potential default sort label on model will have always higher priority over sort label provided by execution.
 * It behaves similar to the Bear behavior and according UX but it limits API capabilities as API can override default sort label by the one from execution by using SortType.LABEL
 * If someone needs this here too, we need to extend IAttributeSortItem by some label prioritization flag and consider it in this convertor.
 *
 * For area sort it just uses SortType.AREA to use this sort by numerical sum in execution.
 */
function convertAttributeSortType(sortItem: ISortItem): SortKeyAttributeAttributeSortTypeEnum {
    return isAttributeAreaSort(sortItem)
        ? SortKeyAttributeAttributeSortTypeEnum.AREA
        : SortKeyAttributeAttributeSortTypeEnum.DEFAULT;
}

/**
 * This messed up function exists because PivotTable expects specific (bear) format of attribute element URIs from
 * which it construct table column ids. The logic behind column ids is deeply rooted (rotted-into) that it would
 * mean non-trivial changes / partial rewrites in the pivot table.
 *
 * To avoid that (because it will likely be several weeks worth of effort and testing), we opted for a dirty 'trick'
 * where tiger backend constructs attribute element URIs so that they resemble the bear URIs. The element ID is
 * actually the primaryLabelValue -→ thing that can be used for sorting.
 *
 * This function caters for the dirty trick + in case the sorts were created 'normally', programmatically by the
 * user who specified primaryLabelValue directly, it has logic to fall back to using the uri as-is.
 */
function extractItemValueFromElement(elementUri: string | null): string | null {
    // no reasonable way to avoid the super-linear backtracking right now
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    const parsedUri = elementUri?.match(/obj\/([^/]*)(\/elements\?id=)?(.*)$/);

    if (parsedUri?.[3]) {
        return parsedUri[3];
    }

    return elementUri;
}

function convertMeasureLocators(locators: ILocatorItem[]): { [key: string]: string | null } {
    const dataColumnLocators = locators.map<{ [key: string]: string | null }>((locator) => {
        if (isAttributeLocator(locator)) {
            return {
                [locator.attributeLocatorItem.attributeIdentifier]: extractItemValueFromElement(
                    locator.attributeLocatorItem.element,
                ),
            };
        } else if (isMeasureLocator(locator)) {
            return {
                [MeasureGroupIdentifier]: locator.measureLocatorItem.measureIdentifier,
            };
        } else {
            return {};
        }
    });
    return Object.assign({}, ...dataColumnLocators);
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
function dimensionsWithSorts(dims: Dimension[], sorts: ISortItem[]): Dimension[] {
    if (isEmpty(sorts)) {
        return dims;
    }

    const nonMeasureDimIdx = findIndex(dims, (dim) => !dim.itemIdentifiers.includes(MeasureGroupIdentifier));
    const measureDim = dims.find((dim) => dim.itemIdentifiers.includes(MeasureGroupIdentifier));
    const sorting: SortKey[][] = dims.map((_) => []);

    sorts.forEach((sortItem) => {
        if (isAttributeSort(sortItem)) {
            const attributeIdentifier = sortItem.attributeSortItem.attributeIdentifier;
            const direction = convertSortDirection(sortItem.attributeSortItem.direction);

            const attributeSortKey: SortKeyAttribute = {
                attribute: {
                    attributeIdentifier,
                    // ASC direction is default for Tiger backend. Dont send it to execution to prevent override of possible default sort label direction. It has the same meaning as TigerSortDirection.DEFAULT which does not exist.
                    ...(direction !== SortKeyAttributeAttributeDirectionEnum.ASC ? { direction } : {}),
                    sortType: convertAttributeSortType(sortItem),
                },
            };

            const dimIdx = findIndex(dims, (dim) => dim.itemIdentifiers.includes(attributeIdentifier));

            if (dimIdx < 0) {
                // eslint-disable-next-line no-console
                console.log(
                    `attempting to sort by attribute with localId ${attributeIdentifier} but this attribute is not in any dimension.`,
                );

                return;
            }

            sorting[dimIdx].push(attributeSortKey);
        } else {
            if (nonMeasureDimIdx < 0) {
                console.warn(
                    "Trying to use measure sort in an execution that only contains dimension with MeasureGroup. " +
                        "This is not valid sort. Measure sort is used to sort the non-measure dimension by values from measure dimension. Ignoring",
                );

                return;
            }

            if (!measureDim) {
                console.warn(
                    "Trying to use measure sort in an execution that does not contain MeasureGroup. Ignoring.",
                );

                return;
            }

            const valueSortKey: SortKeyValue = {
                value: {
                    direction: convertSortDirection(sortItem.measureSortItem.direction),
                    dataColumnLocators: {
                        [measureDim.localIdentifier!]: convertMeasureLocators(
                            sortItem.measureSortItem.locators,
                        ),
                    },
                },
            };

            sorting[nonMeasureDimIdx].push(valueSortKey);
        }
    });

    return merge(dims, sorting);
}

export function dimensionLocalIdentifier(idx: number): string {
    return `dim_${idx}`;
}

/**
 * Converts data in execution definition into dimension specifications for tiger. The tiger specifics
 * are that dimensions have localIds and that sorting is specified per-dimension.
 *
 * @param def - execution definition to convert
 */
export function convertDimensions(def: IExecutionDefinition): Dimension[] {
    const dimensionsWithoutSorts: Dimension[] = def.dimensions.map((dim, idx) => {
        return {
            localIdentifier: dimensionLocalIdentifier(idx),
            itemIdentifiers: dim.itemIdentifiers,
        };
    });

    return dimensionsWithSorts(dimensionsWithoutSorts, def.sortBy);
}
