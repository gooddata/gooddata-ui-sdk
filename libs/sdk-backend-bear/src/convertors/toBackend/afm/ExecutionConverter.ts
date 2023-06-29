// (C) 2007-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { GdcExecuteAFM } from "@gooddata/api-model-bear";
import { convertFilters } from "./FilterConverter.js";
import { convertMeasure } from "./MeasureConverter.js";
import {
    dimensionsFindItem,
    dimensionTotals,
    IAttribute,
    IExecutionDefinition,
    isAttributeLocator,
    isMeasureSort,
    ISortItem,
    ITotal,
    MeasureGroupIdentifier,
    totalIsNative,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { toBearRef } from "../ObjRefConverter.js";

function convertAttribute(attribute: IAttribute, idx: number): GdcExecuteAFM.IAttribute {
    const alias = attribute.attribute.alias;
    const aliasProp = alias ? { alias } : {};
    return {
        displayForm: toBearRef(attribute.attribute.displayForm),
        localIdentifier: attribute.attribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp,
    };
}

function convertAFM(def: IExecutionDefinition): GdcExecuteAFM.IAfm {
    const attributes: GdcExecuteAFM.IAttribute[] = def.attributes.map(convertAttribute);
    const attrProp = attributes.length ? { attributes } : {};

    const measures: GdcExecuteAFM.IMeasure[] = def.measures.map(convertMeasure);
    const measuresProp = measures.length ? { measures } : {};

    const filters: GdcExecuteAFM.CompatibilityFilter[] = convertFilters(def.filters);
    const filtersProp = filters.length ? { filters } : {};

    const nativeTotals = convertNativeTotals(def);
    const nativeTotalsProp = nativeTotals.length ? { nativeTotals } : {};

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp,
        ...nativeTotalsProp,
    };
}

function convertNativeTotals(def: IExecutionDefinition): GdcExecuteAFM.INativeTotalItem[] {
    // first find all native totals defined across dimensions
    const nativeTotals = def.dimensions
        .map(dimensionTotals)
        .reduce((acc, totals) => {
            acc.push(...totals);
            return acc;
        }, [])
        .filter(totalIsNative);

    return nativeTotals.map((t) => {
        // then for each native total, look across buckets (if any) for an attribute that is specified in
        // the total definition
        const attributeInDims = dimensionsFindItem(def.dimensions, t.attributeIdentifier);

        if (!attributeInDims.length) {
            throw new Error(
                `Native total references attribute that is not in any dimension: ${t.attributeIdentifier}`,
            );
        } else if (attributeInDims.length > 1) {
            throw new Error(
                `Native total references attribute that is in multiple dimensions: ${t.attributeIdentifier}`,
            );
        }

        const attributeDim = attributeInDims[0];

        let rollupAttributes;

        // now, knowing the dimension and index of the attribute.. roll up all attributes that are before it
        // and create native total such, that it rolls up all those attributes
        if (attributeDim.dimIdx === 1) {
            const mergedItemsId = [...def.dimensions[0].itemIdentifiers, ...attributeDim.dim.itemIdentifiers];
            const index = mergedItemsId.findIndex((itemId) => itemId === t.attributeIdentifier);
            rollupAttributes = mergedItemsId.slice(0, index).filter((id) => id !== MeasureGroupIdentifier);
        } else {
            rollupAttributes = attributeDim.dim.itemIdentifiers
                .slice(0, attributeDim.itemIdx)
                .filter((id) => id !== MeasureGroupIdentifier);
        }

        return {
            measureIdentifier: t.measureIdentifier,
            attributeIdentifiers: rollupAttributes,
        };
    });
}

function convertTotals(totals: ITotal[] = []): GdcExecuteAFM.ITotalItem[] {
    return totals.map((t) => {
        return {
            type: t.type,
            attributeIdentifier: t.attributeIdentifier,
            measureIdentifier: t.measureIdentifier,
        };
    });
}

function convertDimensions(def: IExecutionDefinition): GdcExecuteAFM.IDimension[] {
    return def.dimensions.map((dim) => {
        const totals = convertTotals(dim.totals);
        const totalsProp = !isEmpty(totals) ? { totals } : {};

        return {
            itemIdentifiers: dim.itemIdentifiers,
            ...totalsProp,
        };
    });
}

function assertNoNullsInSortBy(sortBy: ISortItem[]): void {
    sortBy.forEach((item) => {
        if (isMeasureSort(item)) {
            item.measureSortItem.locators.forEach((locator) => {
                if (isAttributeLocator(locator)) {
                    invariant(
                        locator.attributeLocatorItem.element !== null,
                        "Nulls are not supported as attribute element values or uris on bear",
                    );
                }
            });
        }
    });
}

export function convertResultSpec(def: IExecutionDefinition): GdcExecuteAFM.IResultSpec {
    assertNoNullsInSortBy(def.sortBy ?? []);
    const sortsProp = !isEmpty(def.sortBy)
        ? { sorts: def.sortBy as GdcExecuteAFM.SortItem[] } // checked above, the cast is safe
        : {};
    const dims = convertDimensions(def);
    const dimsProp = !isEmpty(dims) ? { dimensions: dims } : {};

    return {
        ...sortsProp,
        ...dimsProp,
    };
}

// This has to be const function, otherwise api-extractor breaks...
/**
 * Converts execution definition to AFM Execution
 *
 * @param def - execution definition
 * @returns AFM Execution
 *
 * @internal
 */
export const toAfmExecution = (def: IExecutionDefinition): GdcExecuteAFM.IExecution => {
    return {
        execution: {
            afm: convertAFM(def),
            resultSpec: convertResultSpec(def),
        },
    };
};
