// (C) 2007-2018 GoodData Corporation
import compact = require("lodash/compact");
import flatMap = require("lodash/flatMap");
import get = require("lodash/get");
import { AFM, VisualizationObject } from "@gooddata/typings";
import { convertVisualizationObjectFilter } from "./FilterConverter";
import MeasureConverter from "./MeasureConverter";

function convertAttribute(
    attribute: VisualizationObject.IVisualizationAttribute,
    idx: number,
): AFM.IAttribute {
    const alias = attribute.visualizationAttribute.alias;
    const aliasProp = alias ? { alias } : {};
    return {
        displayForm: attribute.visualizationAttribute.displayForm,
        localIdentifier: attribute.visualizationAttribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp,
    };
}

function convertAFM(visualizationObject: VisualizationObject.IVisualizationObjectContent): AFM.IAfm {
    const attributes: AFM.IAttribute[] = getAttributes(visualizationObject.buckets).map(convertAttribute);
    const attrProp = attributes.length ? { attributes } : {};

    const measures: AFM.IMeasure[] = getMeasures(visualizationObject.buckets).map(
        MeasureConverter.convertMeasure,
    );
    const measuresProp = measures.length ? { measures } : {};

    const filters: AFM.CompatibilityFilter[] = visualizationObject.filters
        ? compact(visualizationObject.filters.map(convertVisualizationObjectFilter))
        : [];
    const filtersProp = filters.length ? { filters } : {};

    const nativeTotals = convertNativeTotals(visualizationObject);
    const nativeTotalsProp = nativeTotals.length ? { nativeTotals } : {};

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp,
        ...nativeTotalsProp,
    };
}

function getMeasures(buckets: VisualizationObject.IBucket[]): VisualizationObject.IMeasure[] {
    return buckets.reduce((result: VisualizationObject.IMeasure[], bucket: VisualizationObject.IBucket) => {
        const measureItems: VisualizationObject.IMeasure[] = bucket.items.filter(
            VisualizationObject.isMeasure,
        );

        return result.concat(measureItems);
    }, []);
}

function getNativeTotalAttributeIdentifiers(
    bucket: VisualizationObject.IBucket,
    total: VisualizationObject.IVisualizationTotal,
): string[] {
    const attributes = bucket.items.filter(VisualizationObject.isAttribute);

    const totalAttributeIndex = attributes.findIndex(
        attribute => attribute.visualizationAttribute.localIdentifier === total.attributeIdentifier,
    );

    return attributes
        .slice(0, totalAttributeIndex)
        .map(attribute => attribute.visualizationAttribute.localIdentifier);
}

function convertNativeTotals(
    visObj: VisualizationObject.IVisualizationObjectContent,
): AFM.INativeTotalItem[] {
    const nativeTotalsPerBucket = visObj.buckets.map(bucket => {
        const totals = bucket.totals || [];
        const nativeTotals = totals.filter(total => total.type === "nat");

        return nativeTotals.map(total => ({
            measureIdentifier: total.measureIdentifier,
            attributeIdentifiers: getNativeTotalAttributeIdentifiers(bucket, total),
        }));
    });

    return flatMap(nativeTotalsPerBucket);
}

function getAttributes(
    buckets: VisualizationObject.IBucket[],
): VisualizationObject.IVisualizationAttribute[] {
    return buckets.reduce(
        (result: VisualizationObject.IVisualizationAttribute[], bucket: VisualizationObject.IBucket) => {
            const items: VisualizationObject.IVisualizationAttribute[] = bucket.items.filter(
                VisualizationObject.isAttribute,
            );

            return result.concat(items);
        },
        [],
    );
}

function convertSorting(visObj: VisualizationObject.IVisualizationObjectContent): AFM.SortItem[] {
    if (visObj.properties) {
        let properties = {};
        try {
            properties = JSON.parse(visObj.properties);
        } catch {
            // tslint:disable-next-line:no-console
            console.error("Properties contains invalid JSON string.");
        }

        const sorts: AFM.SortItem[] = get(properties, "sortItems", []);
        return sorts ? sorts : [];
    }

    return [];
}

function convertResultSpec(visObj: VisualizationObject.IVisualizationObjectContent): AFM.IResultSpec {
    const sorts = convertSorting(visObj);
    // Workaround because we can handle only 1 sort item for now
    const sortsProp = sorts.length ? { sorts: sorts.slice(0, 1) } : {};

    return {
        ...sortsProp,
    };
}

export interface IConvertedAFM {
    afm: AFM.IAfm;
    resultSpec: AFM.IResultSpec;
}

/**
 * Converts visualizationObject to afm and resultSpec
 *
 * @method toAfmResultSpec
 * @param {VisualizationObject.IVisualizationObjectContent} visObj
 * @returns {IConvertedAFM}
 */
export function toAfmResultSpec(visObj: VisualizationObject.IVisualizationObjectContent): IConvertedAFM {
    const afm = convertAFM(visObj);
    return {
        afm,
        resultSpec: convertResultSpec(visObj),
    };
}
