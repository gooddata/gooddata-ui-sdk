// (C) 2025-2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDisplayFormMetadataObject,
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

    const buckets = insightBuckets(insight);
    const geoBucket = bucketsFind(buckets, isNewGeoArea ? BucketNames.AREA : BucketNames.LOCATION);
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
