// (C) 2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type GeoLayerType,
    GeoLayerTypes,
    type IAttribute,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeOrMeasure,
    type IBucket,
    type ICatalogAttribute,
    type IInsightDefinition,
    type ISettings,
    type ObjRef,
    areObjRefsEqual,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    bucketsFind,
    geoLayerTypeFromVisualizationType,
    insightBuckets,
    insightLayers,
    insightSorts,
    insightVisualizationType,
    isGeoLayerType,
    isMeasure,
    newAttribute,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { isGeoVisualizationUsingNewEngine } from "./isGeoVisualizationUsingNewEngine.js";
import { VisualizationTypes } from "./visualizationTypes.js";
import { BucketNames } from "../constants/bucketNames.js";

/**
 * @internal
 */
export type GeoTableConversionOptions = {
    settings?: ISettings;
    defaultDisplayFormRefs?: Map<string, ObjRef>;
};

/**
 * @internal
 */
export type IGeoDataExportPreparationOptions = {
    settings?: ISettings;
    catalogAttributes: ICatalogAttribute[];
    preloadedAttributesWithReferences?: IAttributeWithReferences[];
};

type GeoInsightExportSource = {
    buckets: IBucket[];
    layerType: GeoLayerType;
};

function getGeoVisualizationType(layerType: GeoLayerType): string {
    return layerType === GeoLayerTypes.AREA ? VisualizationTypes.CHOROPLETH : VisualizationTypes.PUSHPIN;
}

function parseGeoLayerType(layerType: string): GeoLayerType | undefined {
    return isGeoLayerType(layerType) ? layerType : undefined;
}

function getGeoInsightExportSource(insight: IInsightDefinition): GeoInsightExportSource | undefined {
    const rootLayerType = geoLayerTypeFromVisualizationType(insightVisualizationType(insight));
    if (rootLayerType) {
        return {
            buckets: insightBuckets(insight),
            layerType: rootLayerType,
        };
    }

    const [firstLayer] = insightLayers(insight);
    if (firstLayer) {
        const layerType = parseGeoLayerType(firstLayer.type);
        if (!layerType) {
            return undefined;
        }

        return {
            buckets: firstLayer.buckets,
            layerType,
        };
    }

    return undefined;
}

function canPrepareGeoInsightForDataExport(
    insight: IInsightDefinition,
    settings: ISettings | undefined,
): boolean {
    const exportSource = getGeoInsightExportSource(insight);
    if (!exportSource) {
        return false;
    }

    return isGeoVisualizationUsingNewEngine(getGeoVisualizationType(exportSource.layerType), settings);
}

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
    const preloadedMatch = preloadedAttributesWithReferences?.find((attributeWithReferences) =>
        attributeWithReferences.attribute.displayForms.some((displayForm) =>
            areObjRefsEqual(displayForm.ref, displayFormRef),
        ),
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

function transformGeoBucketAttributeUsingDefaultDisplayForm(
    bucket: IBucket | undefined,
    defaultDisplayFormRefs: Map<string, ObjRef> | undefined,
    uniqueLocalIdSuffix: string,
): IAttribute | undefined {
    if (!bucket) {
        return undefined;
    }

    const geoAttribute = bucketAttribute(bucket);
    if (!geoAttribute) {
        return undefined;
    }

    const geoDisplayFormRef = attributeDisplayFormRef(geoAttribute);
    const defaultDisplayFormRef = defaultDisplayFormRefs?.get(serializeObjRef(geoDisplayFormRef));
    if (!defaultDisplayFormRef || areObjRefsEqual(defaultDisplayFormRef, geoDisplayFormRef)) {
        return geoAttribute;
    }

    const uniqueLocalId = `${attributeLocalId(geoAttribute)}_${uniqueLocalIdSuffix}`;
    const alias = attributeAlias(geoAttribute);

    return newAttribute(defaultDisplayFormRef, (builder) => {
        builder.localId(uniqueLocalId);
        if (alias) {
            builder.alias(alias);
        }
        return builder;
    });
}

function resolveGeoPrimaryAttribute(
    layerType: GeoLayerType,
    buckets: IBucket[],
    options: GeoTableConversionOptions,
): IAttribute | undefined {
    if (layerType === GeoLayerTypes.PUSHPIN) {
        return transformGeoBucketAttributeUsingDefaultDisplayForm(
            bucketsFind(buckets, BucketNames.LOCATION),
            options.defaultDisplayFormRefs,
            "table_default_label",
        );
    }

    if (layerType === GeoLayerTypes.AREA) {
        return transformGeoBucketAttributeUsingDefaultDisplayForm(
            bucketsFind(buckets, BucketNames.AREA),
            options.defaultDisplayFormRefs,
            "table_default_label",
        );
    }

    return undefined;
}

function getGeoTableAttributes(
    layerType: GeoLayerType,
    buckets: IBucket[],
    options: GeoTableConversionOptions,
): { rowAttributes: IAttributeOrMeasure[]; columnAttributes: IAttributeOrMeasure[] } | undefined {
    const primaryAttribute = resolveGeoPrimaryAttribute(layerType, buckets, options);
    const segmentBucket = bucketsFind(buckets, BucketNames.SEGMENT);
    const segmentAttribute = segmentBucket ? bucketAttribute(segmentBucket) : undefined;
    const rowAttributes: IAttributeOrMeasure[] = [];

    if (segmentAttribute) {
        rowAttributes.push(segmentAttribute);
    }
    if (primaryAttribute) {
        rowAttributes.push(primaryAttribute);
    }

    return {
        rowAttributes,
        columnAttributes: [],
    };
}

/**
 * @internal
 */
export function resolveDefaultDisplayFormRefForDisplayForm(
    displayFormRef: ObjRef,
    catalogAttributes: ICatalogAttribute[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): ObjRef | undefined {
    const attribute = findAttributeByDisplayFormRef(
        displayFormRef,
        preloadedAttributesWithReferences,
        catalogAttributes,
    );
    if (!attribute) {
        return undefined;
    }

    return getDefaultDisplayFormRef(attribute.displayForms ?? []);
}

/**
 * @internal
 */
export function getGeoDefaultDisplayFormRefs(
    insight: IInsightDefinition,
    settings: ISettings | undefined,
    catalogAttributes: ICatalogAttribute[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Map<string, ObjRef> | undefined {
    if (!canPrepareGeoInsightForDataExport(insight, settings)) {
        return undefined;
    }

    const exportSource = getGeoInsightExportSource(insight);
    if (!exportSource) {
        return undefined;
    }

    const bucketName =
        exportSource.layerType === GeoLayerTypes.AREA ? BucketNames.AREA : BucketNames.LOCATION;
    const geoBucket = bucketsFind(exportSource.buckets, bucketName);
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

/**
 * @internal
 */
export function prepareGeoInsightForDataExport(
    insight: IInsightDefinition,
    options: IGeoDataExportPreparationOptions,
): IInsightDefinition | undefined {
    if (!canPrepareGeoInsightForDataExport(insight, options.settings)) {
        return undefined;
    }

    const defaultDisplayFormRefs = getGeoDefaultDisplayFormRefs(
        insight,
        options.settings,
        options.catalogAttributes,
        options.preloadedAttributesWithReferences,
    );

    return convertGeoInsightToTableDefinition(insight, {
        settings: options.settings,
        defaultDisplayFormRefs,
    });
}

/**
 * @internal
 */
export function convertGeoInsightToTableDefinition(
    insight: IInsightDefinition,
    options: GeoTableConversionOptions = {},
): IInsightDefinition | undefined {
    const exportSource = getGeoInsightExportSource(insight);
    if (
        !exportSource ||
        !isGeoVisualizationUsingNewEngine(getGeoVisualizationType(exportSource.layerType), options.settings)
    ) {
        return undefined;
    }

    const buckets = exportSource.buckets;
    const measureBucketIdentifiers: Set<string> = new Set([
        BucketNames.MEASURES,
        BucketNames.SIZE,
        BucketNames.COLOR,
        BucketNames.SECONDARY_MEASURES,
    ]);
    const measures = buckets
        .filter((bucket) => measureBucketIdentifiers.has(bucket.localIdentifier ?? ""))
        .flatMap((bucket) => bucket.items.filter(isMeasure));

    const geoAttributes = getGeoTableAttributes(exportSource.layerType, buckets, options);
    if (!geoAttributes) {
        return undefined;
    }

    const onlyMeasures =
        geoAttributes.rowAttributes.length === 0 && geoAttributes.columnAttributes.length === 0;
    const { layers: _layers, ...insightDefinitionWithoutLayers } = insight.insight;
    const tableInsight: IInsightDefinition = {
        ...insight,
        insight: {
            ...insightDefinitionWithoutLayers,
            visualizationUrl: "local:table",
            buckets: [
                { localIdentifier: BucketNames.MEASURES, items: measures },
                { localIdentifier: BucketNames.ATTRIBUTE, items: geoAttributes.rowAttributes },
                { localIdentifier: BucketNames.COLUMNS, items: geoAttributes.columnAttributes },
            ],
            properties: onlyMeasures
                ? {
                      controls: {
                          measureGroupDimension: "rows",
                      },
                  }
                : {},
        },
    };

    return {
        ...tableInsight,
        insight: {
            ...tableInsight.insight,
            sorts: insightSorts(tableInsight),
        },
    };
}
