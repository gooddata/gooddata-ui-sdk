// (C) 2007-2022 GoodData Corporation
import {
    IVisualizationObjectContent,
    IBucket,
    BucketItem,
    IVisualizationAttributeContent,
    IMeasureContent,
    IVisualizationObjectMeasureDefinition,
    isVisualizationObjectMeasureDefinition,
    VisualizationObjectFilter,
    VisualizationObjectAttributeFilter,
    isVisualizationObjectAttribute,
    isVisualizationObjectMeasure,
    isVisualizationObjectAttributeFilter,
    isVisualizationObjectPositiveAttributeFilter,
} from "./GdcVisualizationObject.js";
import { IObjUriQualifier } from "../base/GdcTypes.js";

function getAttributesInBucket(bucket: IBucket): IVisualizationAttributeContent[] {
    return bucket.items.reduce((list: IVisualizationAttributeContent[], bucketItem: BucketItem) => {
        if (isVisualizationObjectAttribute(bucketItem)) {
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
        if (isVisualizationObjectMeasure(bucketItem)) {
            list.push(bucketItem.measure);
        }
        return list;
    }, []);
}

function getDefinition(
    measure: IMeasureContent,
): IVisualizationObjectMeasureDefinition["measureDefinition"] | undefined {
    return isVisualizationObjectMeasureDefinition(measure.definition)
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

function getMeasureFilters(measure: IMeasureContent): VisualizationObjectFilter[] {
    return getDefinition(measure)?.filters ?? [];
}

function getMeasureAttributeFilters(measure: IMeasureContent): VisualizationObjectAttributeFilter[] {
    return getMeasureFilters(measure).filter(isVisualizationObjectAttributeFilter);
}

function getAttributeFilters(mdObject: IVisualizationObjectContent): VisualizationObjectAttributeFilter[] {
    return getMeasures(mdObject).reduce(
        (filters: VisualizationObjectAttributeFilter[], measure: IMeasureContent) => {
            filters.push(...getMeasureAttributeFilters(measure));
            return filters;
        },
        [],
    );
}

function getAttributeFilterDisplayForm(measureFilter: VisualizationObjectAttributeFilter): string {
    return isVisualizationObjectPositiveAttributeFilter(measureFilter)
        ? (measureFilter.positiveAttributeFilter.displayForm as IObjUriQualifier).uri
        : (measureFilter.negativeAttributeFilter.displayForm as IObjUriQualifier).uri;
}

/**
 * @public
 */
export function getAttributesDisplayForms(mdObject: IVisualizationObjectContent): string[] {
    const attributesDfs = getAttributes(mdObject).map(
        (attribute: IVisualizationAttributeContent) => (attribute.displayForm as IObjUriQualifier).uri,
    );
    const attrMeasureFilters = getAttributeFilters(mdObject);
    const attrMeasureFiltersDfs = attrMeasureFilters.map(getAttributeFilterDisplayForm);
    return [...attrMeasureFiltersDfs, ...attributesDfs];
}
