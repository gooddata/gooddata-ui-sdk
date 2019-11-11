// (C) 2007-2018 GoodData Corporation
import get from "lodash/get";
import { VisualizationObject } from "./VisualizationObject";
import IVisualizationObjectContent = VisualizationObject.IVisualizationObjectContent;
import IBucket = VisualizationObject.IBucket;
import BucketItem = VisualizationObject.BucketItem;
import IVisualizationAttributeContent = VisualizationObject.IVisualizationAttributeContent;
import IMeasureContent = VisualizationObject.IMeasureContent;
import IMeasureDefinitionType = VisualizationObject.IMeasureDefinitionType;
import VisualizationObjectFilter = VisualizationObject.VisualizationObjectFilter;
import VisualizationObjectAttributeFilter = VisualizationObject.VisualizationObjectAttributeFilter;
import isAttribute = VisualizationObject.isAttribute;
import isMeasure = VisualizationObject.isMeasure;
import isAttributeFilter = VisualizationObject.isAttributeFilter;

function getBuckets(mdObj: IVisualizationObjectContent): IBucket[] {
    return get(mdObj, "buckets", []);
}

function getAttributesInBucket(bucket: IBucket): IVisualizationAttributeContent[] {
    return get(bucket, "items").reduce((list: IVisualizationAttributeContent[], bucketItem: BucketItem) => {
        if (isAttribute(bucketItem)) {
            list.push(get(bucketItem, "visualizationAttribute"));
        }
        return list;
    }, []);
}

function getAttributes(mdObject: IVisualizationObjectContent): IVisualizationAttributeContent[] {
    const buckets = getBuckets(mdObject);
    return buckets.reduce(
        (categoriesList: IVisualizationAttributeContent[], bucket: IBucket) =>
            categoriesList.concat(getAttributesInBucket(bucket)),
        [],
    );
}

function getMeasuresInBucket(bucket: IBucket): IMeasureContent[] {
    return get(bucket, "items").reduce((list: IMeasureContent[], bucketItem: BucketItem) => {
        if (isMeasure(bucketItem)) {
            list.push(get(bucketItem, "measure"));
        }
        return list;
    }, []);
}

function getDefinition(measure: IMeasureContent): IMeasureDefinitionType {
    return get(measure, ["definition", "measureDefinition"], {});
}

function getMeasures(mdObject: IVisualizationObjectContent): IMeasureContent[] {
    const buckets = getBuckets(mdObject);
    return buckets.reduce(
        (measuresList: IMeasureContent[], bucket: IBucket) =>
            measuresList.concat(getMeasuresInBucket(bucket)),
        [],
    );
}

function getMeasureFilters(measure: IMeasureContent): VisualizationObjectFilter[] {
    return get(getDefinition(measure), "filters", []);
}

function getMeasureAttributeFilters(measure: IMeasureContent): VisualizationObjectAttributeFilter[] {
    return getMeasureFilters(measure).filter(isAttributeFilter);
}

function getAttributeFilters(mdObject: IVisualizationObjectContent): VisualizationObjectAttributeFilter[] {
    return getMeasures(mdObject).reduce(
        (filters: VisualizationObjectAttributeFilter[], measure: IMeasureContent) =>
            filters.concat(getMeasureAttributeFilters(measure)),
        [],
    );
}

function getAttributeFilterDisplayForm(measureFilter: VisualizationObjectAttributeFilter): string[] {
    return (
        get(measureFilter, ["positiveAttributeFilter", "displayForm", "uri"]) ||
        get(measureFilter, ["negativeAttributeFilter", "displayForm", "uri"])
    );
}

/**
 * @internal
 */
export function getAttributesDisplayForms(mdObject: IVisualizationObjectContent): string[] {
    const attributesDfs = getAttributes(mdObject).map((attribute: IVisualizationAttributeContent) =>
        get(attribute, ["displayForm", "uri"]),
    );
    const attrMeasureFilters = getAttributeFilters(mdObject);
    const attrMeasureFiltersDfs = attrMeasureFilters.map(getAttributeFilterDisplayForm);
    return [...attrMeasureFiltersDfs, ...attributesDfs];
}
