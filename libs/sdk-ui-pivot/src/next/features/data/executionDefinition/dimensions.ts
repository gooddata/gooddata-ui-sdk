// (C) 2025 GoodData Corporation
import {
    attributeLocalId,
    IAttribute,
    IDimension,
    ITotal,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export function addAttributesToDimension(dimension: IDimension, attributes: IAttribute[]) {
    return {
        ...dimension,
        itemIdentifiers: [...dimension.itemIdentifiers, ...attributes.map(attributeLocalId)],
    };
}

/**
 * @internal
 */
export function addMeasureGroupToDimension(dimension: IDimension) {
    return {
        ...dimension,
        itemIdentifiers: [...dimension.itemIdentifiers, MeasureGroupIdentifier],
    };
}

/**
 * @internal
 */
export function removeMeasureGroupFromDimension(dimension: IDimension) {
    return {
        ...dimension,
        itemIdentifiers: dimension.itemIdentifiers.filter(
            (identifier) => identifier !== MeasureGroupIdentifier,
        ),
    };
}

/**
 * @internal
 */
export function addTotalsToDimension(totals: ITotal[], dimension: IDimension) {
    return {
        ...dimension,
        totals: [...(dimension.totals ?? []), ...totals],
    };
}
