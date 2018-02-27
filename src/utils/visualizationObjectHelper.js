import {
    get
} from 'lodash';

const BUCKETS = 'buckets';

export function getBuckets(mdObj) {
    return get(mdObj, BUCKETS, []);
}

function isAttribute(bucketItem) {
    return get(bucketItem, 'visualizationAttribute') !== undefined;
}

export function isAttributeMeasureFilter(measureFilter) {
    return (get(measureFilter, 'positiveAttributeFilter') || get(measureFilter, 'negativeAttributeFilter')) !== undefined;
}

function isMeasure(bucketItem) {
    return get(bucketItem, 'measure') !== undefined;
}

function getAttributesInBucket(bucket) {
    return get(bucket, 'items').reduce((list, bucketItem) => {
        if (isAttribute(bucketItem)) {
            list.push(get(bucketItem, 'visualizationAttribute'));
        }
        return list;
    }, []);
}

export function getAttributes(mdObject) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce((categoriesList, bucket) =>
        categoriesList.concat(getAttributesInBucket(bucket)), []);
}

function getMeasuresInBucket(bucket) {
    return get(bucket, 'items').reduce((list, bucketItem) => {
        if (isMeasure(bucketItem)) {
            list.push(get(bucketItem, 'measure'));
        }

        return list;
    }, []);
}

export function getDefinition(measure) {
    return get(measure, ['definition', 'measureDefinition'], {});
}

export function getMeasures(mdObject) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce((measuresList, bucket) =>
        measuresList.concat(getMeasuresInBucket(bucket)), []);
}

export function getMeasureFilters(measure) {
    return get(getDefinition(measure), 'filters', []);
}

export function getMeasureAttributeFilters(measure) {
    return getMeasureFilters(measure).filter(isAttributeMeasureFilter);
}

function getAttributeFilters(mdObject) {
    return getMeasures(mdObject).reduce((filters, measure) =>
        filters.concat(getMeasureAttributeFilters(measure)),
    []);
}

function getAttributeFilterDisplayForm(measureFilter) {
    return get(measureFilter, ['positiveAttributeFilter', 'displayForm', 'uri']) ||
        get(measureFilter, ['negativeAttributeFilter', 'displayForm', 'uri']);
}

export function getAttributesDisplayForms(mdObject) {
    const attributesDfs = getAttributes(mdObject).map(attribute => get(attribute, ['displayForm', 'uri']));
    const attrMeasureFilters = getAttributeFilters(mdObject);
    const attrMeasureFiltersDfs = attrMeasureFilters.map(getAttributeFilterDisplayForm);
    return [...attrMeasureFiltersDfs, ...attributesDfs];
}
