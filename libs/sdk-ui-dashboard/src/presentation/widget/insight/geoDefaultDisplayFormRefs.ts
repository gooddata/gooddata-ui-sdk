// (C) 2025-2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDisplayFormMetadataObject,
    type IBucket,
    type ICatalogAttribute,
    type IInsight,
    type ISettings,
    type ObjRef,
    areObjRefsEqual,
    attributeDisplayFormRef,
    bucketAttribute,
    bucketsFind,
    insightBuckets,
    insightVisualizationType,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

function getDefaultDisplayFormRef(displayForms: IAttributeDisplayFormMetadataObject[]): ObjRef | undefined {
    const defaultDisplayForm =
        displayForms.find((displayForm) => displayForm.isDefault) ??
        displayForms.find((displayForm) => displayForm.isPrimary) ??
        displayForms[0];

    return defaultDisplayForm?.ref;
}

function findAttributeByDisplayFormRef(
    displayFormRef: ObjRef,
    preloadedAttributesWithReferences: IAttributeWithReferences[] | undefined,
    catalogAttributes: ICatalogAttribute[],
) {
    const preloadedMatch = preloadedAttributesWithReferences?.find((attr) =>
        attr.attribute.displayForms.some((displayForm) => areObjRefsEqual(displayForm.ref, displayFormRef)),
    )?.attribute;

    if (preloadedMatch) {
        return preloadedMatch;
    }

    return catalogAttributes.find((catalogAttribute) =>
        [
            ...catalogAttribute.attribute.displayForms,
            ...catalogAttribute.displayForms,
            ...catalogAttribute.geoPinDisplayForms,
        ].some((displayForm) => areObjRefsEqual(displayForm.ref, displayFormRef)),
    )?.attribute;
}

/**
 * Resolves geo display form → default display form mappings for a given layer type and buckets.
 *
 * @internal
 */
export function resolveGeoDefaultDisplayFormRefs(
    layerType: "pushpin" | "area",
    buckets: IBucket[],
    catalogAttributes: ICatalogAttribute[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Map<string, ObjRef> | undefined {
    const bucketName = layerType === "area" ? BucketNames.AREA : BucketNames.LOCATION;
    const geoBucket = bucketsFind(buckets, bucketName);
    const geoAttr = geoBucket ? bucketAttribute(geoBucket) : undefined;
    if (!geoAttr) {
        return undefined;
    }

    const geoDisplayFormRef = attributeDisplayFormRef(geoAttr);
    const attribute = findAttributeByDisplayFormRef(
        geoDisplayFormRef,
        preloadedAttributesWithReferences,
        catalogAttributes,
    );
    if (!attribute) {
        return undefined;
    }

    const defaultDisplayFormRef = getDefaultDisplayFormRef(attribute.displayForms ?? []);
    if (!defaultDisplayFormRef) {
        return undefined;
    }

    return new Map([[serializeObjRef(geoDisplayFormRef), defaultDisplayFormRef]]);
}

export function getGeoDefaultDisplayFormRefs(
    insight: IInsight,
    settings: ISettings | undefined,
    catalogAttributes: ICatalogAttribute[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Map<string, ObjRef> | undefined {
    const type = insightVisualizationType(insight);
    const isNewGeoPushpin = type === VisualizationTypes.PUSHPIN && settings?.enableNewGeoPushpin;
    const isNewGeoArea = type === VisualizationTypes.CHOROPLETH && settings?.enableGeoArea;

    if (!isNewGeoPushpin && !isNewGeoArea) {
        return undefined;
    }

    const layerType = isNewGeoArea ? "area" : "pushpin";
    return resolveGeoDefaultDisplayFormRefs(
        layerType,
        insightBuckets(insight),
        catalogAttributes,
        preloadedAttributesWithReferences,
    );
}
