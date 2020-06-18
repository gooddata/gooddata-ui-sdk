// (C) 2007-2020 GoodData Corporation
import compact = require("lodash/compact");
import isEmpty = require("lodash/isEmpty");
import {
    attributeLocalId,
    bucketItems,
    bucketsFindAttribute,
    dimensionTotals,
    IExecutionDefinition,
    isAttribute,
    totalIsNative,
} from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/gd-tiger-client";
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

function convertDimensions(def: IExecutionDefinition): ExecuteAFM.IDimension[] {
    return def.dimensions.map((dim) => {
        if (!isEmpty(dim.totals)) {
            throw new Error("Tiger backend does not support totals.");
        }

        return {
            itemIdentifiers: dim.itemIdentifiers,
        };
    });
}

function convertResultSpec(def: IExecutionDefinition): ExecuteAFM.IResultSpec {
    if (!isEmpty(def.sortBy)) {
        // tslint:disable
        console.warn("Tiger backend does not support sorting. Ignoring...");
    }

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
