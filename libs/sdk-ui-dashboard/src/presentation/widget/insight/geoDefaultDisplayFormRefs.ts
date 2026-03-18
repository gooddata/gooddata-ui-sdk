// (C) 2025-2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type GeoLayerType,
    GeoLayerTypes,
    type IBucket,
    type ICatalogAttribute,
    type IInsight,
    type ISettings,
    type ObjRef,
    attributeDisplayFormRef,
    bucketAttribute,
    bucketsFind,
    geoLayerTypeFromVisualizationType,
    insightBuckets,
    insightVisualizationType,
    serializeObjRef,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    isGeoVisualizationUsingNewEngine,
    resolveDefaultDisplayFormRefForDisplayForm,
} from "@gooddata/sdk-ui";

export function getGeoDefaultDisplayFormRefs(
    insight: IInsight,
    settings: ISettings | undefined,
    catalogAttributes: ICatalogAttribute[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Map<string, ObjRef> | undefined {
    const type = insightVisualizationType(insight);
    if (!isGeoVisualizationUsingNewEngine(type, settings)) {
        return undefined;
    }

    const layerType = geoLayerTypeFromVisualizationType(type);
    if (!layerType) {
        return undefined;
    }

    return resolveGeoDefaultDisplayFormRefs(
        layerType,
        insightBuckets(insight),
        catalogAttributes,
        preloadedAttributesWithReferences,
    );
}

export function resolveGeoDefaultDisplayFormRefs(
    layerType: GeoLayerType,
    buckets: IBucket[],
    catalogAttributes: ICatalogAttribute[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Map<string, ObjRef> | undefined {
    const bucketName = layerType === GeoLayerTypes.AREA ? BucketNames.AREA : BucketNames.LOCATION;
    const geoBucket = bucketsFind(buckets, bucketName);
    const geoAttribute = geoBucket ? bucketAttribute(geoBucket) : undefined;
    if (!geoAttribute) {
        return undefined;
    }

    const geoDisplayFormRef = attributeDisplayFormRef(geoAttribute);
    const defaultDisplayFormRef = resolveDefaultDisplayFormRefForDisplayForm(
        geoDisplayFormRef,
        catalogAttributes,
        preloadedAttributesWithReferences,
    );
    if (!defaultDisplayFormRef) {
        return undefined;
    }

    return new Map([[serializeObjRef(geoDisplayFormRef), defaultDisplayFormRef]]);
}
