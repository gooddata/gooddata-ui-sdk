// (C) 2007-2022 GoodData Corporation
import { GdcVisualizationObject } from "./GdcVisualizationObject";
import IVisualizationObjectContent = GdcVisualizationObject.IVisualizationObjectContent;
import IBucket = GdcVisualizationObject.IBucket;
import BucketItem = GdcVisualizationObject.BucketItem;
import IVisualizationAttributeContent = GdcVisualizationObject.IVisualizationAttributeContent;
import IMeasureContent = GdcVisualizationObject.IMeasureContent;
import IMeasureDefinition = GdcVisualizationObject.IMeasureDefinition;
import Filter = GdcVisualizationObject.Filter;
import AttributeFilter = GdcVisualizationObject.AttributeFilter;
import isAttribute = GdcVisualizationObject.isAttribute;
import isMeasure = GdcVisualizationObject.isMeasure;
import isAttributeFilter = GdcVisualizationObject.isAttributeFilter;

function getAttributesInBucket(bucket: IBucket): IVisualizationAttributeContent[] {
    return bucket.items.reduce((list: IVisualizationAttributeContent[], bucketItem: BucketItem) => {
        if (isAttribute(bucketItem)) {
            list.push(bucketItem.visualizationAttribute);
        }
        return list;
    }, []);
}

function getAttributes(mdObject: IVisualizationObjectContent): IVisualizationAttributeContent[] {
    const buckets = mdObject.buckets;
    return buckets.reduce((categoriesList: IVisualizationAttributeContent[], bucket: IBucket) => {
        categoriesList.push(...getAttributesInBucket(bucket));
        return categoriesList;
    }, []);
}

function getMeasuresInBucket(bucket: IBucket): IMeasureContent[] {
    return bucket.items.reduce((list: IMeasureContent[], bucketItem: BucketItem) => {
        if (isMeasure(bucketItem)) {
            list.push(bucketItem.measure);
        }
        return list;
    }, []);
}

function getDefinition(measure: IMeasureContent): IMeasureDefinition["measureDefinition"] | undefined {
    return GdcVisualizationObject.isMeasureDefinition(measure.definition)
        ? measure.definition.measureDefinition
        : undefined;
}

function getMeasures(mdObject: IVisualizationObjectContent): IMeasureContent[] {
    const buckets = mdObject.buckets;
    return buckets.reduce((measuresList: IMeasureContent[], bucket: IBucket) => {
        measuresList.push(...getMeasuresInBucket(bucket));
        return measuresList;
    }, []);
}

function getMeasureFilters(measure: IMeasureContent): Filter[] {
    return getDefinition(measure)?.filters ?? [];
}

function getMeasureAttributeFilters(measure: IMeasureContent): AttributeFilter[] {
    return getMeasureFilters(measure).filter(isAttributeFilter);
}

function getAttributeFilters(mdObject: IVisualizationObjectContent): AttributeFilter[] {
    return getMeasures(mdObject).reduce((filters: AttributeFilter[], measure: IMeasureContent) => {
        filters.push(...getMeasureAttributeFilters(measure));
        return filters;
    }, []);
}

function getAttributeFilterDisplayForm(measureFilter: AttributeFilter): string {
    return GdcVisualizationObject.isPositiveAttributeFilter(measureFilter)
        ? (measureFilter.positiveAttributeFilter.displayForm as GdcVisualizationObject.IObjUriQualifier).uri
        : (measureFilter.negativeAttributeFilter.displayForm as GdcVisualizationObject.IObjUriQualifier).uri;
}

/**
 * @public
 */
export function getAttributesDisplayForms(mdObject: IVisualizationObjectContent): string[] {
    const attributesDfs = getAttributes(mdObject).map(
        (attribute: IVisualizationAttributeContent) =>
            (attribute.displayForm as GdcVisualizationObject.IObjUriQualifier).uri,
    );
    const attrMeasureFilters = getAttributeFilters(mdObject);
    const attrMeasureFiltersDfs = attrMeasureFilters.map(getAttributeFilterDisplayForm);
    return [...attrMeasureFiltersDfs, ...attributesDfs];
}
