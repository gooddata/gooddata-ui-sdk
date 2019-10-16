// (C) 2007-2018 GoodData Corporation
import compact = require("lodash/compact");
import { ExecuteAFM } from "../gd-tiger-model/ExecuteAFM";
import { convertVisualizationObjectFilter } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";
import {
    attributeId,
    attributesFind,
    bucketItems,
    bucketsFindAttribute,
    dimensionTotals,
    IAttribute,
    isAttribute,
    isUriQualifier,
    totalIsNative,
    MeasureGroupIdentifier,
    IExecutionDefinition
} from "@gooddata/sdk-model";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import isEmpty = require("lodash/isEmpty");

function convertAttribute(attribute: IAttribute, idx: number): ExecuteAFM.IAttribute {
    const alias = attribute.attribute.alias;
    const aliasProp = alias ? { alias } : {};
    const displayFromQualifier = attribute.attribute.displayForm;

    if (isUriQualifier(displayFromQualifier)) {
        throw new NotSupported("Tiger backend does not allow specifying display forms by URI");
    }

    return {
        displayForm: displayFromQualifier,
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
        ? compact(def.filters.map(convertVisualizationObjectFilter))
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
            .map(attributeId);

        // and create native total such, that it rolls up all those attributes
        return {
            measureIdentifier: t.measureIdentifier,
            attributeIdentifiers: rollupAttributes,
        };
    });
}

function convertDimensions(def: IExecutionDefinition): ExecuteAFM.IDimension[] {
    def.dimensions.forEach(dim => {
        dim.itemIdentifiers.forEach(item => {
            if (item === MeasureGroupIdentifier) {
                return;
            }

            const attr = attributesFind(def.attributes, item);

            if (!attr) {
                throw new Error(`invalid invariant: dimension specifies undefined attr ${item}`);
            }

            const attrQualifier = attr.attribute.displayForm;

            if (isUriQualifier(attrQualifier)) {
                throw new NotSupported("tiger does not support attributes specified by uri");
            }
        });

        if (dim.totals) {
            throw new NotSupported("Tiger backend does not support totals.");
        }
    });
    return def.dimensions;
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
