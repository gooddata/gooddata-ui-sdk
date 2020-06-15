// (C) 2007-2020 GoodData Corporation
import compact = require("lodash/compact");
import isEmpty = require("lodash/isEmpty");
import { GdcExecuteAFM } from "@gooddata/gd-bear-model";
import { convertFilter } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";
import {
    dimensionsFindItem,
    dimensionTotals,
    IAttribute,
    IExecutionDefinition,
    ITotal,
    MeasureGroupIdentifier,
    totalIsNative,
} from "@gooddata/sdk-model";
import { toBearRef } from "../ObjRefConverter";

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

    const filters: GdcExecuteAFM.CompatibilityFilter[] = def.filters
        ? compact(def.filters.map(convertFilter))
        : [];
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
        .reduce((acc, totals) => acc.concat(...totals), [])
        .filter(totalIsNative);

    return nativeTotals.map(t => {
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
        // now, knowing the dimension and index of the attribute.. roll up all attributes that are before it
        const rollupAttributes = attributeDim.dim.itemIdentifiers
            .slice(0, attributeDim.itemIdx)
            .filter(id => id !== MeasureGroupIdentifier);

        // and create native total such, that it rolls up all those attributes
        return {
            measureIdentifier: t.measureIdentifier,
            attributeIdentifiers: rollupAttributes,
        };
    });
}

function convertTotals(totals: ITotal[] = []): GdcExecuteAFM.ITotalItem[] {
    return totals.map(t => {
        const newItem: GdcExecuteAFM.ITotalItem = {
            type: t.type,
            attributeIdentifier: t.attributeIdentifier,
            measureIdentifier: t.measureIdentifier,
        };

        return newItem;
    });
}

function convertDimensions(def: IExecutionDefinition): GdcExecuteAFM.IDimension[] {
    return def.dimensions.map(dim => {
        const totals = convertTotals(dim.totals);
        const totalsProp = !isEmpty(totals) ? { totals } : {};

        const newDim: GdcExecuteAFM.IDimension = {
            itemIdentifiers: dim.itemIdentifiers,
            ...totalsProp,
        };

        return newDim;
    });
}

function convertResultSpec(def: IExecutionDefinition): GdcExecuteAFM.IResultSpec {
    const sortsProp = !isEmpty(def.sortBy) ? { sorts: def.sortBy } : {};
    const dims = convertDimensions(def);
    const dimsProp = !isEmpty(dims) ? { dimensions: dims } : {};

    return {
        ...sortsProp,
        ...dimsProp,
    };
}

/**
 * Converts execution definition to AFM Execution
 *
 * @param def - execution definition
 * @returns AFM Execution
 *
 * @internal
 */
export function toAfmExecution(def: IExecutionDefinition): GdcExecuteAFM.IExecution {
    return {
        execution: {
            afm: convertAFM(def),
            resultSpec: convertResultSpec(def),
        },
    };
}
