// (C) 2007-2018 GoodData Corporation
import get from "lodash/get";

const BUCKETS = "buckets";

export function getBuckets(mdObj: any) {
    return get(mdObj, BUCKETS, []);
}

function isAttribute(bucketItem: any) {
    return get(bucketItem, "visualizationAttribute") !== undefined;
}

export function isAttributeMeasureFilter(measureFilter: any) {
    return (
        (get(measureFilter, "positiveAttributeFilter") || get(measureFilter, "negativeAttributeFilter")) !==
        undefined
    );
}

function isMeasure(bucketItem: any) {
    return get(bucketItem, "measure") !== undefined;
}

function getAttributesInBucket(bucket: any) {
    return get(bucket, "items").reduce((list: any, bucketItem: any) => {
        if (isAttribute(bucketItem)) {
            list.push(get(bucketItem, "visualizationAttribute"));
        }
        return list;
    }, []);
}

export function getAttributes(mdObject: any) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce(
        (categoriesList: any, bucket: any) => categoriesList.concat(getAttributesInBucket(bucket)),
        [],
    );
}

function getMeasuresInBucket(bucket: any) {
    return get(bucket, "items").reduce((list: any, bucketItem: any) => {
        if (isMeasure(bucketItem)) {
            list.push(get(bucketItem, "measure"));
        }

        return list;
    }, []);
}

export function getDefinition(measure: any) {
    return get(measure, ["definition", "measureDefinition"], {});
}

export function getMeasures(mdObject: any) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce(
        (measuresList: any, bucket: any) => measuresList.concat(getMeasuresInBucket(bucket)),
        [],
    );
}

export function getMeasureFilters(measure: any) {
    return get(getDefinition(measure), "filters", []);
}

export function getMeasureAttributeFilters(measure: any) {
    return getMeasureFilters(measure).filter(isAttributeMeasureFilter);
}

function getAttributeFilters(mdObject: any) {
    return getMeasures(mdObject).reduce(
        (filters: any, measure: any) => filters.concat(getMeasureAttributeFilters(measure)),
        [],
    );
}

function getAttributeFilterDisplayForm(measureFilter: any) {
    return (
        get(measureFilter, ["positiveAttributeFilter", "displayForm", "uri"]) ||
        get(measureFilter, ["negativeAttributeFilter", "displayForm", "uri"])
    );
}

export function getAttributesDisplayForms(mdObject: any) {
    const attributesDfs = getAttributes(mdObject).map((attribute: any) =>
        get(attribute, ["displayForm", "uri"]),
    );
    const attrMeasureFilters = getAttributeFilters(mdObject);
    const attrMeasureFiltersDfs = attrMeasureFilters.map(getAttributeFilterDisplayForm);
    return [...attrMeasureFiltersDfs, ...attributesDfs];
}
