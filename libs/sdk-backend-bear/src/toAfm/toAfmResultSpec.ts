// (C) 2007-2018 GoodData Corporation
import compact = require("lodash/compact");
import isEmpty = require("lodash/isEmpty");
import { ExecuteAFM } from "@gooddata/gd-bear-model";
import { convertFilter } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";
import {
    attributeLocalId,
    bucketItems,
    bucketsFindAttribute,
    dimensionTotals,
    IAttribute,
    isAttribute,
    ITotal,
    totalIsNative,
    IExecutionDefinition,
} from "@gooddata/sdk-model";

function convertAttribute(attribute: IAttribute, idx: number): ExecuteAFM.IAttribute {
    const alias = attribute.attribute.alias;
    const aliasProp = alias ? { alias } : {};
    return {
        displayForm: attribute.attribute.displayForm,
        localIdentifier: attribute.attribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp,
    };
}

function convertAFM(def: IExecutionDefinition): ExecuteAFM.IAfm {
    const attributes: ExecuteAFM.IAttribute[] = def.attributes.map(convertAttribute);
    const attrProp = attributes.length ? { attributes } : {};

    const measures: ExecuteAFM.IMeasure[] = def.measures.map(convertMeasure);
    const measuresProp = measures.length ? { measures } : {};

    const filters: ExecuteAFM.CompatibilityFilter[] = def.filters
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

function convertNativeTotals(def: IExecutionDefinition): ExecuteAFM.INativeTotalItem[] {
    // first find all native totals defined across dimensions
    const nativeTotals = def.dimensions
        .map(dimensionTotals)
        .reduce((acc, totals) => acc.concat(...totals), [])
        .filter(totalIsNative);

    return nativeTotals.map(t => {
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
            .map(attributeLocalId);

        // and create native total such, that it rolls up all those attributes
        return {
            measureIdentifier: t.measureIdentifier,
            attributeIdentifiers: rollupAttributes,
        };
    });
}

function convertTotals(totals: ITotal[] = []): ExecuteAFM.ITotalItem[] {
    return totals.map(t => {
        const newItem: ExecuteAFM.ITotalItem = {
            type: t.type,
            attributeIdentifier: t.attributeIdentifier,
            measureIdentifier: t.measureIdentifier,
        };

        return newItem;
    });
}

function convertDimensions(def: IExecutionDefinition): ExecuteAFM.IDimension[] {
    return def.dimensions.map(dim => {
        const totals = convertTotals(dim.totals);
        const totalsProp = !isEmpty(totals) ? { totals } : {};

        const newDim: ExecuteAFM.IDimension = {
            itemIdentifiers: dim.itemIdentifiers,
            ...totalsProp,
        };

        return newDim;
    });
}

function convertResultSpec(def: IExecutionDefinition): ExecuteAFM.IResultSpec {
    // TODO: SDK8: why this???
    // Workaround because we can handle only 1 sort item for now
    const sortsProp = !isEmpty(def.sortBy) ? { sorts: def.sortBy.slice(0, 1) } : {};
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
 */
export function toAfmExecution(def: IExecutionDefinition): ExecuteAFM.IExecution {
    return {
        execution: {
            afm: convertAFM(def),
            resultSpec: convertResultSpec(def),
        },
    };
}
