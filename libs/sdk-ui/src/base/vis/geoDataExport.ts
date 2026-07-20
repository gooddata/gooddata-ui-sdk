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
    type IFilter,
    type IInsightDefinition,
    type ISettings,
    type ISortItem,
    type ObjRef,
    areObjRefsEqual,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    bucketsFind,
    geoLayerTypeFromVisualizationType,
    insightBuckets,
    insightFilters,
    insightLayers,
    insightSorts,
    insightTitle,
    insightVisualizationType,
    isGeoLayerType,
    isMeasure,
    mergeFilters,
    newAttribute,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { BucketNames } from "../constants/bucketNames.js";

import { isGeoVisualizationUsingNewEngine } from "./isGeoVisualizationUsingNewEngine.js";
import { VisualizationTypes } from "./visualizationTypes.js";

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

/**
 * Finds the bucket carrying the layer's primary geo attribute. Persisted pushpin layers may
 * store explicit LATITUDE/LONGITUDE buckets instead of LOCATION (see `geoLayerToInsightLayer`
 * in sdk-ui-geo) — in that case the latitude attribute is the effective location attribute.
 */
function findGeoPrimaryBucket(layerType: GeoLayerType, buckets: IBucket[]): IBucket | undefined {
    if (layerType === GeoLayerTypes.AREA) {
        return bucketsFind(buckets, BucketNames.AREA);
    }

    return bucketsFind(buckets, BucketNames.LOCATION) ?? bucketsFind(buckets, BucketNames.LATITUDE);
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
    return transformGeoBucketAttributeUsingDefaultDisplayForm(
        findGeoPrimaryBucket(layerType, buckets),
        options.defaultDisplayFormRefs,
        "table_default_label",
    );
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

function resolveLayerDefaultDisplayFormRefs(
    layerType: GeoLayerType,
    buckets: IBucket[],
    catalogAttributes: ICatalogAttribute[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Map<string, ObjRef> | undefined {
    const geoBucket = findGeoPrimaryBucket(layerType, buckets);
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

    return resolveLayerDefaultDisplayFormRefs(
        exportSource.layerType,
        exportSource.buckets,
        catalogAttributes,
        preloadedAttributesWithReferences,
    );
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
 * A single geo layer prepared as a table insight for a multi-layer data export.
 *
 * @internal
 */
export interface IGeoLayerExportInsight {
    /** Stable id — "root" for the root layer, layer.id for additional layers. */
    layerId: string;
    /** Human-readable name used for the exported sheet or file. */
    layerName: string;
    /** The layer converted to a `local:table` insight definition. */
    tableInsight: IInsightDefinition;
    /**
     * Maps original attribute local ids to their replacements in the table insight (the geo
     * label is swapped for its default display form under a new local id). Callers use it to
     * remap local-id filter references when building the layer's execution definition.
     */
    attributeLocalIdMapping?: Record<string, string>;
}

/**
 * Decomposes a multi-layer geo insight into one table insight per layer for data export.
 *
 * @remarks
 * Returns `undefined` when the insight is not a new-geo insight (flags off, non-geo, etc.).
 * The returned array starts with the root layer, followed by the additional layers in their
 * original order. Callers execute each layer and pass the results as export layers so the export
 * ends up with one sheet (XLSX) or file (CSV zip) per layer.
 *
 * @internal
 */
export function prepareGeoLayerInsightsForDataExport(
    insight: IInsightDefinition,
    options: IGeoDataExportPreparationOptions,
): IGeoLayerExportInsight[] | undefined {
    // Per-layer export has its own rollout flag on top of the geo a11y improvements rollout
    // (which gates the multi-layer geo features, e.g. the layered table view).
    if (!options.settings?.enableGeoLayersExport) {
        return undefined;
    }

    if (!options.settings?.enableGeoChartA11yImprovements) {
        return undefined;
    }

    if (!canPrepareGeoInsightForDataExport(insight, options.settings)) {
        return undefined;
    }

    const rootLayerType = geoLayerTypeFromVisualizationType(insightVisualizationType(insight));
    if (!rootLayerType) {
        return undefined;
    }

    const buildEntry = (
        layerId: string,
        layerName: string,
        layerType: GeoLayerType,
        buckets: IBucket[],
        layerOverrides?: IGeoLayerTableOverrides,
    ): IGeoLayerExportInsight | undefined => {
        const defaultDisplayFormRefs = resolveLayerDefaultDisplayFormRefs(
            layerType,
            buckets,
            options.catalogAttributes,
            options.preloadedAttributesWithReferences,
        );
        const conversionOptions = { settings: options.settings, defaultDisplayFormRefs };
        const tableInsight = buildGeoLayerTableInsight(
            insight,
            buckets,
            layerType,
            conversionOptions,
            layerOverrides,
        );
        if (!tableInsight) {
            return undefined;
        }

        const geoBucket = findGeoPrimaryBucket(layerType, buckets);
        const originalAttribute = geoBucket ? bucketAttribute(geoBucket) : undefined;
        const transformedAttribute = resolveGeoPrimaryAttribute(layerType, buckets, conversionOptions);
        const originalLocalId = originalAttribute ? attributeLocalId(originalAttribute) : undefined;
        const transformedLocalId = transformedAttribute ? attributeLocalId(transformedAttribute) : undefined;
        const attributeLocalIdMapping =
            originalLocalId && transformedLocalId && originalLocalId !== transformedLocalId
                ? { [originalLocalId]: transformedLocalId }
                : undefined;

        return {
            layerId,
            layerName,
            tableInsight,
            ...(attributeLocalIdMapping ? { attributeLocalIdMapping } : {}),
        };
    };

    const rootEntry = buildEntry("root", insightTitle(insight), rootLayerType, insightBuckets(insight));
    if (!rootEntry) {
        return undefined;
    }

    const layerEntries = insightLayers(insight).flatMap((layer): IGeoLayerExportInsight[] => {
        if (!isGeoLayerType(layer.type)) {
            return [];
        }
        const entry = buildEntry(layer.id, layer.name ?? layer.id, layer.type, layer.buckets, {
            // Mirrors the render path: a layer combines its own filters with the root insight's
            // (root wins date conflicts, same as global filters at render). Root measure/ranking
            // filters bound to other layers' local ids are dropped later, when the layer's
            // execution definition is created.
            filters: mergeFilters(layer.filters ?? [], insightFilters(insight)),
            sorts: layer.sorts,
        });
        return entry ? [entry] : [];
    });

    return [rootEntry, ...layerEntries];
}

/**
 * Layer-specific overrides applied to the converted table insight. Filters are the layer's
 * effective filter set (its own combined with the root insight's, as at render); sorts replace
 * the root insight's when set and are inherited from it when not.
 */
interface IGeoLayerTableOverrides {
    filters?: IFilter[];
    sorts?: ISortItem[];
}

function buildGeoLayerTableInsight(
    insight: IInsightDefinition,
    buckets: IBucket[],
    layerType: GeoLayerType,
    options: GeoTableConversionOptions,
    layerOverrides?: IGeoLayerTableOverrides,
): IInsightDefinition | undefined {
    const measureBucketIdentifiers: Set<string> = new Set([
        BucketNames.MEASURES,
        BucketNames.SIZE,
        BucketNames.COLOR,
        BucketNames.SECONDARY_MEASURES,
    ]);
    const measures = buckets
        .filter((bucket) => measureBucketIdentifiers.has(bucket.localIdentifier ?? ""))
        .flatMap((bucket) => bucket.items.filter(isMeasure));

    const geoAttributes = getGeoTableAttributes(layerType, buckets, options);
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
                ...(measures.length ? [{ localIdentifier: BucketNames.MEASURES, items: measures }] : []),
                { localIdentifier: BucketNames.ATTRIBUTE, items: geoAttributes.rowAttributes },
                { localIdentifier: BucketNames.COLUMNS, items: geoAttributes.columnAttributes },
            ],
            ...(layerOverrides?.filters ? { filters: layerOverrides.filters } : {}),
            ...(layerOverrides?.sorts ? { sorts: layerOverrides.sorts } : {}),
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

    return buildGeoLayerTableInsight(insight, exportSource.buckets, exportSource.layerType, options);
}
