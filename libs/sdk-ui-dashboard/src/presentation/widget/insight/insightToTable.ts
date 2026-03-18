// (C) 2025-2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type ArithmeticMeasureOperator,
    type GeoLayerType,
    GeoLayerTypes,
    type IArithmeticMeasureDefinition,
    type IAttribute,
    type IAttributeOrMeasure,
    type IBucket,
    type ICatalogAttribute,
    type IInsight,
    type IMeasure,
    type ISettings,
    type ObjRef,
    areObjRefsEqual,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    bucketMeasure,
    bucketsFind,
    geoLayerTypeFromVisualizationType,
    idRef,
    insightBuckets,
    insightLayers,
    insightMeasures,
    insightProperties,
    insightSorts,
    insightVisualizationType,
    isGeoLayerType,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isUriRef,
    newAttribute,
    newVirtualArithmeticMeasure,
    serializeObjRef,
    uriRef,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    VisualizationTypes,
    convertGeoInsightToTableDefinition as convertGeoInsightToTableDefinitionShared,
    isGeoVisualizationUsingNewEngine,
} from "@gooddata/sdk-ui";

import { resolveGeoDefaultDisplayFormRefs } from "./geoDefaultDisplayFormRefs.js";

/**
 * Determines if a visualization type supports the "Show as Table" UI button.
 * This controls whether users can manually toggle table view in the UI.
 *
 * @param insightType - The visualization type to check
 * @returns true if the visualization supports the Show as Table UI feature
 * @public
 */
export function supportsShowAsTable(insightType?: string): boolean {
    return (
        insightType !== "table" &&
        insightType !== "repeater" &&
        insightType !== "headline" &&
        insightType !== "xirr"
    );
}

/**
 * Determines if a visualization type can be converted to table format.
 * This is used for accessibility and export purposes, separate from UI controls.
 *
 * @param insightType - The visualization type to check
 * @returns true if the visualization can be converted to table format
 * @public
 */
export function canConvertToTable(insightType?: string): boolean {
    return insightType !== "table" && insightType !== "repeater" && insightType !== "xirr";
}

/**
 * Comparison configuration interface matching sdk-ui-charts comparison types
 * @see {@link @gooddata/sdk-ui-charts#IComparison}
 */
interface IComparison {
    enabled?: boolean;
    calculationType?: "change" | "ratio" | "difference" | "change_difference";
}

/**
 * Default format strings for comparison calculations
 * These match the defaults from sdk-ui-charts/headlineHelper.ts CALCULATION_VALUES_DEFAULT
 *
 * @remarks
 * - CHANGE: Percentage change between primary and secondary
 * - RATIO: Ratio of primary to secondary as percentage
 * - DIFFERENCE: Absolute difference (null means inherit from primary measure)
 * - CHANGE_DIFFERENCE: Both percentage and absolute (sub-value uses null to inherit)
 */
const COMPARISON_FORMATS = {
    change: "#,##0%",
    ratio: "#,##0%",
    difference: null, // null means inherit format from primary measure
    change_difference: {
        main: "#,##0%",
        sub: null, // Absolute difference (inherit)
    },
} as const;

/**
 * Extracts comparison configuration from insight properties
 */
function getComparisonConfig(insight: IInsight): IComparison | undefined {
    const properties = insightProperties(insight);
    return properties["controls"]?.comparison;
}

/**
 * Checks if a headline insight has comparison enabled and exactly one secondary measure
 * Matches the logic from HeadlineProviderFactory.isComparisonType in sdk-ui-charts
 *
 * @param insight - The insight to check
 * @returns true if the insight is a headline with comparison enabled
 *
 * @remarks
 * A headline qualifies for comparison if:
 * 1. It's a "headline" visualization type
 * 2. It has both a primary and secondary measure
 * 3. Comparison is enabled in config (defaults to true)
 *
 */
function isHeadlineWithComparison(insight: IInsight): boolean {
    const type = insightVisualizationType(insight);
    if (type !== "headline") {
        return false;
    }

    const buckets = insightBuckets(insight);
    const primaryBucket = bucketsFind(buckets, BucketNames.MEASURES);
    const secondaryBucket = bucketsFind(buckets, BucketNames.SECONDARY_MEASURES);

    const primaryMeasure = primaryBucket && bucketMeasure(primaryBucket);
    const secondaryMeasure = secondaryBucket && bucketMeasure(secondaryBucket);

    if (!primaryMeasure || !secondaryMeasure) {
        return false;
    }

    const comparison = getComparisonConfig(insight);
    return comparison?.enabled ?? true;
}

/**
 * Determines the calculation type for headline comparison
 * Matches the logic from ComparisonProvider in sdk-ui-charts
 *
 * @param secondaryMeasure - The secondary measure to compare against
 * @param comparison - Optional comparison configuration from insight properties
 * @returns The calculation type to use
 *
 * @remarks
 * Default logic (when no calculationType is configured):
 * - If secondary measure is derived (PoP, Previous Period) → use "change" (percentage change)
 * - If secondary measure is regular → use "ratio" (proportion)
 *
 */
function getCalculationType(
    secondaryMeasure: IMeasure,
    comparison: IComparison | undefined,
): "change" | "ratio" | "difference" | "change_difference" {
    if (comparison?.calculationType) {
        return comparison.calculationType;
    }

    if (isPoPMeasure(secondaryMeasure) || isPreviousPeriodMeasure(secondaryMeasure)) {
        return "change";
    }

    return "ratio";
}

/**
 * Creates virtual arithmetic measures for headline comparison
 * Replicates the logic from ComparisonProvider in sdk-ui-charts
 *
 * @param primaryMeasure - The primary measure
 * @param secondaryMeasure - The secondary measure to compare against
 * @param calculationType - The type of calculation to perform
 * @returns Array of virtual arithmetic measures (1 or 2 depending on calculation type)
 *
 * @remarks
 * Virtual arithmetic measures are calculated by the backend:
 * - "change": ((primary - secondary) / secondary) * 100
 * - "ratio": (primary / secondary)
 * - "difference": (primary - secondary)
 * - "change_difference": Both change AND difference as separate measures
 *
 * The backend performs all calculations; we just create the measure definitions.
 * Format strings are applied so values display correctly (e.g., "25%" instead of "0.25").
 *
 * @see {@link sdk-backend-tiger/MeasureConverter.ts#convertArithmeticMeasureDefinition}
 */
function createHeadlineComparisonMeasures(
    primaryMeasure: IMeasure,
    secondaryMeasure: IMeasure,
    calculationType: "change" | "ratio" | "difference" | "change_difference",
): IMeasure<IArithmeticMeasureDefinition>[] {
    const createVirtualArithmeticMeasure = (
        operator: ArithmeticMeasureOperator,
        format: string | null,
        shouldCombineLocalIdAndOperator?: boolean,
    ): IMeasure<IArithmeticMeasureDefinition> => {
        return newVirtualArithmeticMeasure([primaryMeasure, secondaryMeasure], operator, (builder) => {
            if (shouldCombineLocalIdAndOperator) {
                builder.combineLocalIdWithOperator();
            }
            // Apply format: null means inherit from primary measure, string means use explicit format
            if (format !== null) {
                builder.format(format);
            }
            return builder;
        });
    };

    switch (calculationType) {
        case "difference":
            return [createVirtualArithmeticMeasure("difference", COMPARISON_FORMATS.difference)];

        case "ratio":
            return [createVirtualArithmeticMeasure("ratio", COMPARISON_FORMATS.ratio)];

        case "change":
            return [createVirtualArithmeticMeasure("change", COMPARISON_FORMATS.change)];

        case "change_difference":
            return [
                createVirtualArithmeticMeasure("change", COMPARISON_FORMATS.change_difference.main, true),
                createVirtualArithmeticMeasure("difference", COMPARISON_FORMATS.change_difference.sub, true),
            ];

        default:
            return [];
    }
}

/**
 * Transforms a geo bucket attribute to use tooltipText display form (legacy pushpin only).
 *
 * @remarks
 * This is used only when legacy pushpin behavior is active (new geo flags disabled).
 */
function transformGeoBucketAttributeUsingTooltipText(
    bucket: IBucket | undefined,
    insight: IInsight,
    uniqueLocalIdSuffix: string,
): IAttribute | undefined {
    if (!bucket) {
        return undefined;
    }

    const geoAttr = bucketAttribute(bucket);
    if (!geoAttr) {
        return undefined;
    }

    const properties = insightProperties(insight);
    const tooltipTextId = properties?.["controls"]?.["tooltipText"];

    if (!tooltipTextId) {
        return geoAttr;
    }

    const ref = isUriRef(attributeDisplayFormRef(geoAttr))
        ? uriRef(tooltipTextId)
        : idRef(tooltipTextId, "displayForm");

    // Generate a unique localId to avoid conflicts with existing attributes
    const uniqueLocalId = `${attributeLocalId(geoAttr)}_${uniqueLocalIdSuffix}`;

    const alias = attributeAlias(geoAttr);
    return newAttribute(ref, (m) => {
        m.localId(uniqueLocalId);
        if (alias) {
            m.alias(alias);
        }
        return m;
    });
}

/**
 * Transforms a geo bucket attribute to use the default display form.
 *
 * @remarks
 * Used for new GeoChartNext variants when feature flags are enabled.
 */
function transformGeoBucketAttributeUsingDefaultDisplayForm(
    bucket: IBucket | undefined,
    defaultDisplayFormRefs: Map<string, ObjRef> | undefined,
    uniqueLocalIdSuffix: string,
): IAttribute | undefined {
    if (!bucket) {
        return undefined;
    }

    const geoAttr = bucketAttribute(bucket);
    if (!geoAttr) {
        return undefined;
    }

    const geoDisplayFormRef = attributeDisplayFormRef(geoAttr);
    const defaultDisplayFormRef = defaultDisplayFormRefs?.get(serializeObjRef(geoDisplayFormRef));
    if (!defaultDisplayFormRef || areObjRefsEqual(defaultDisplayFormRef, geoDisplayFormRef)) {
        return geoAttr;
    }

    const uniqueLocalId = `${attributeLocalId(geoAttr)}_${uniqueLocalIdSuffix}`;
    const alias = attributeAlias(geoAttr);
    return newAttribute(defaultDisplayFormRef, (m) => {
        m.localId(uniqueLocalId);
        if (alias) {
            m.alias(alias);
        }
        return m;
    });
}

function transformGeoLocationAttribute(
    locationBucket: IBucket | undefined,
    insight: IInsight,
): IAttribute | undefined {
    return transformGeoBucketAttributeUsingTooltipText(locationBucket, insight, "table_name");
}

type GeoTableConversionOptions = {
    settings?: ISettings;
    defaultDisplayFormRefs?: Map<string, ObjRef>;
};

function resolveGeoPrimaryAttribute(
    options: GeoTableConversionOptions,
    insight: IInsight,
    buckets: IBucket[],
    layerType?: GeoLayerType,
): IAttribute | undefined {
    if (layerType) {
        return resolveGeoPrimaryAttributeByLayerType(layerType, buckets, options.defaultDisplayFormRefs);
    }

    const type = insightVisualizationType(insight);
    const isLegacyGeoPushpin = type === VisualizationTypes.PUSHPIN && !options.settings?.enableNewGeoPushpin;
    const isNewGeoVisualization = isGeoVisualizationUsingNewEngine(type, options.settings);

    if (isLegacyGeoPushpin) {
        return transformGeoLocationAttribute(bucketsFind(buckets, BucketNames.LOCATION), insight);
    }

    if (isNewGeoVisualization) {
        const rootLayerType = geoLayerTypeFromVisualizationType(type);
        if (rootLayerType) {
            return resolveGeoPrimaryAttributeByLayerType(
                rootLayerType,
                buckets,
                options.defaultDisplayFormRefs,
            );
        }
    }

    return undefined;
}

function getGeoTableAttributesWithSegmentAndPrimary(
    buckets: IBucket[],
    primaryAttribute: IAttributeOrMeasure | undefined,
): { rowAttributes: IAttributeOrMeasure[]; columnAttributes: IAttributeOrMeasure[] } {
    const segmentBucket = bucketsFind(buckets, BucketNames.SEGMENT);
    const rowAttributes: IAttributeOrMeasure[] = [];

    const segmentAttr = segmentBucket ? bucketAttribute(segmentBucket) : undefined;
    if (segmentAttr) {
        rowAttributes.push(segmentAttr);
    }
    if (primaryAttribute) {
        rowAttributes.push(primaryAttribute);
    }

    return { rowAttributes, columnAttributes: [] };
}

function getGeoTableAttributes(
    insight: IInsight,
    buckets: IBucket[],
    options: GeoTableConversionOptions,
    layerType?: GeoLayerType,
): { rowAttributes: IAttributeOrMeasure[]; columnAttributes: IAttributeOrMeasure[] } | null {
    const type = insightVisualizationType(insight);
    const isLegacyGeoPushpin = type === VisualizationTypes.PUSHPIN && !options.settings?.enableNewGeoPushpin;
    const isNewGeoVisualization = isGeoVisualizationUsingNewEngine(type, options.settings);

    if (!layerType && !isLegacyGeoPushpin && !isNewGeoVisualization) {
        return null;
    }

    const primaryAttribute = resolveGeoPrimaryAttribute(options, insight, buckets, layerType);
    return getGeoTableAttributesWithSegmentAndPrimary(buckets, primaryAttribute);
}

function resolveGeoPrimaryAttributeByLayerType(
    layerType: GeoLayerType,
    buckets: IBucket[],
    defaultDisplayFormRefs: Map<string, ObjRef> | undefined,
): IAttribute | undefined {
    const bucketName = layerType === GeoLayerTypes.AREA ? BucketNames.AREA : BucketNames.LOCATION;
    return transformGeoBucketAttributeUsingDefaultDisplayForm(
        bucketsFind(buckets, bucketName),
        defaultDisplayFormRefs,
        "table_default_label",
    );
}

function buildTableInsightFromBuckets(
    insight: IInsight,
    buckets: IBucket[],
    layerType: GeoLayerType,
    defaultDisplayFormRefs: Map<string, ObjRef> | undefined,
): IInsight {
    const measureBucketIdentifiers: Set<string> = new Set([
        BucketNames.MEASURES,
        BucketNames.SIZE,
        BucketNames.COLOR,
        BucketNames.SECONDARY_MEASURES,
    ]);
    const measures = buckets
        .filter((b) => measureBucketIdentifiers.has(b.localIdentifier ?? ""))
        .flatMap((b) => b.items);

    const { rowAttributes, columnAttributes } = getGeoTableAttributes(
        insight,
        buckets,
        { defaultDisplayFormRefs },
        layerType,
    ) ?? { rowAttributes: [], columnAttributes: [] };

    const tableBuckets = [
        { localIdentifier: BucketNames.MEASURES, items: measures },
        { localIdentifier: BucketNames.ATTRIBUTE, items: rowAttributes },
        { localIdentifier: BucketNames.COLUMNS, items: columnAttributes },
    ];

    const onlyMeasures = !rowAttributes.length && !columnAttributes.length;
    const propertiesProp = onlyMeasures
        ? { properties: { controls: { measureGroupDimension: "rows" } } }
        : {};

    const tableInsight: IInsight = {
        ...insight,
        insight: {
            ...insight.insight,
            visualizationUrl: "local:table",
            buckets: tableBuckets,
            ...propertiesProp,
        },
    };

    return {
        ...tableInsight,
        insight: {
            ...tableInsight.insight,
            // Keep only sorts that reference attributes/measures present in this layer table.
            sorts: insightSorts(tableInsight),
        },
    };
}

/**
 * Defines a single layer's table conversion result for multi-layer geo charts.
 *
 * @alpha
 */
export interface ILayerTableDefinition {
    /** Stable id — "root" for root layer, layer.id for additional layers */
    layerId: string;
    /** Human-readable name for the tab label */
    layerName: string;
    /** Normalized layer type */
    layerType: string;
    /** Converted table insight for this layer */
    tableInsight: IInsight;
}

interface ILayerTableConversionOptions {
    settings?: ISettings;
    catalogAttributes?: ICatalogAttribute[];
    preloadedAttributesWithReferences?: IAttributeWithReferences[];
}

/**
 * Converts a multi-layer geo insight into per-layer table definitions.
 *
 * Returns `undefined` when the insight is not a new-geo type (flags off, non-geo, etc.).
 * Returns an array of {@link ILayerTableDefinition} with root layer first, then
 * additional layers in their original order.
 *
 * @internal
 */
export function convertGeoInsightToLayerTables(
    insight: IInsight,
    options: ILayerTableConversionOptions,
): ILayerTableDefinition[] | undefined {
    if (!options.settings?.["enableGeoChartA11yImprovements"]) {
        return undefined;
    }

    const type = insightVisualizationType(insight);
    if (!isGeoVisualizationUsingNewEngine(type, options.settings)) {
        return undefined;
    }

    const rootLayerType = geoLayerTypeFromVisualizationType(type);
    if (!rootLayerType) {
        return undefined;
    }
    const rootBuckets = insightBuckets(insight);
    const rootDisplayFormRefs = resolveGeoDefaultDisplayFormRefs(
        rootLayerType,
        rootBuckets,
        options.catalogAttributes ?? [],
        options.preloadedAttributesWithReferences,
    );

    const rootTable = buildTableInsightFromBuckets(insight, rootBuckets, rootLayerType, rootDisplayFormRefs);
    const rootDef: ILayerTableDefinition = {
        layerId: "root",
        layerName: insight.insight.title,
        layerType: rootLayerType,
        tableInsight: rootTable,
    };

    const layers = insightLayers(insight);
    const layerDefs = layers.flatMap((layer): ILayerTableDefinition[] => {
        if (!isGeoLayerType(layer.type)) {
            return [];
        }
        const layerType = layer.type;
        const displayFormRefs = resolveGeoDefaultDisplayFormRefs(
            layerType,
            layer.buckets,
            options.catalogAttributes ?? [],
            options.preloadedAttributesWithReferences,
        );
        const tableInsight = buildTableInsightFromBuckets(insight, layer.buckets, layerType, displayFormRefs);
        return [
            {
                layerId: layer.id,
                layerName: layer.name ?? layer.id,
                layerType,
                tableInsight,
            },
        ];
    });

    return [rootDef, ...layerDefs];
}

/**
 * Converts an insight to layered table definitions.
 *
 * @remarks
 * Currently supports geo insights only and is gated by `enableGeoChartA11yImprovements`.
 *
 * @internal
 */
export function convertInsightToLayerTables(
    insight: IInsight,
    options: ILayerTableConversionOptions,
): ILayerTableDefinition[] | undefined {
    return convertGeoInsightToLayerTables(insight, options);
}

/**
 * Converts any insight (except of type "table", "repeater", or "xirr") to a table insight definition.
 * For table, repeater, or xirr insights, returns the original insight.
 *
 * @param insight - The input insight to convert.
 * @returns IInsight with table visualization or the original insight if conversion is not supported.
 * @public
 */
export function convertInsightToTableDefinition(
    insight: IInsight,
    options: GeoTableConversionOptions = {},
): IInsight {
    const type = insightVisualizationType(insight);
    if (!canConvertToTable(type)) {
        return insight;
    }

    const geoTableInsight = convertGeoInsightToTableDefinitionShared(insight, options);
    if (geoTableInsight) {
        return geoTableInsight as IInsight;
    }

    // Use sdk-model utils to extract all measures and attributes
    // and build table buckets according to PluggablePivotTable conventions
    // - 'measures' bucket: all measures
    // - 'attributes' bucket: all attributes
    // - 'columns' bucket: empty (can be customized if needed)
    // This is a safe default for generic conversion
    // If more advanced splitting is needed (e.g. from view/stack by), logic can be extended
    //
    // Note: IBucket type is imported from sdk-model
    //
    // The output insight will have only these three buckets

    // Import bucket utilities for splitting attributes

    // PluggablePivotTable convention: row attributes come from the first attribute bucket (view by, trend by, etc),
    // column attributes come from the second attribute bucket (columns, stack by, etc)
    // Measures always from 'measures' bucket
    // See getRowAttributes and getColumnAttributes in PluggablePivotTable

    const buckets = insightBuckets(insight);
    const baseMeasures = insightMeasures(insight);

    // Handle headline comparison: add virtual arithmetic measures for change/difference/ratio
    const comparisonMeasures: IMeasure<IArithmeticMeasureDefinition>[] = [];
    if (isHeadlineWithComparison(insight)) {
        const primaryBucket = bucketsFind(buckets, BucketNames.MEASURES);
        const secondaryBucket = bucketsFind(buckets, BucketNames.SECONDARY_MEASURES);

        const primaryMeasure = primaryBucket && bucketMeasure(primaryBucket);
        const secondaryMeasure = secondaryBucket && bucketMeasure(secondaryBucket);

        if (primaryMeasure && secondaryMeasure) {
            const comparison = getComparisonConfig(insight);
            const calculationType = getCalculationType(secondaryMeasure, comparison);
            comparisonMeasures.push(
                ...createHeadlineComparisonMeasures(primaryMeasure, secondaryMeasure, calculationType),
            );
        }
    }

    const measures = [...baseMeasures, ...comparisonMeasures];

    /**
     * Keep conversion logic aligned with `PluggablePivotTable`:
     * - row attributes: see `getRowAttributes` in `sdk-ui-ext`
     * - column attributes: see `getColumnAttributes` in `sdk-ui-ext`
     *
     * Note: using `BucketNames.*` avoids fragile magic strings.
     */
    const rowBucketIdentifiers: string[] = [
        BucketNames.ATTRIBUTE,
        BucketNames.ATTRIBUTES,
        BucketNames.ATTRIBUTE_FROM,
        BucketNames.ATTRIBUTE_TO,
        BucketNames.VIEW,
        BucketNames.TREND,
        BucketNames.LOCATION,
        BucketNames.AREA,
    ];
    const columnBucketIdentifiers: string[] = [BucketNames.COLUMNS, BucketNames.STACK, BucketNames.SEGMENT];

    const isRowBucket = (bucket: IBucket) => rowBucketIdentifiers.includes(bucket.localIdentifier ?? "");
    const isColumnBucket = (bucket: IBucket) =>
        columnBucketIdentifiers.includes(bucket.localIdentifier ?? "");

    let rowAttributes: IAttributeOrMeasure[];
    let columnAttributes: IAttributeOrMeasure[];

    const geoAttributes = getGeoTableAttributes(insight, buckets, options);
    if (geoAttributes) {
        rowAttributes = geoAttributes.rowAttributes;
        columnAttributes = geoAttributes.columnAttributes;
    } else {
        const rowBuckets = buckets.filter(isRowBucket);
        const columnBuckets = buckets.filter(isColumnBucket);

        rowAttributes = rowBuckets.map((bucket) => bucket.items).flat();
        columnAttributes = columnBuckets.map((bucket) => bucket.items).flat();
    }

    const tableBuckets = [
        {
            localIdentifier: BucketNames.MEASURES,
            items: measures,
        },
        {
            localIdentifier: BucketNames.ATTRIBUTE,
            items: rowAttributes,
        },
        {
            localIdentifier: BucketNames.COLUMNS,
            items: columnAttributes,
        },
    ];

    const onlyMeasures = !rowAttributes.length && !columnAttributes.length;
    const propertiesProp = onlyMeasures
        ? {
              properties: {
                  controls: {
                      measureGroupDimension: "rows",
                  },
              },
          }
        : {};

    const tableInsight: IInsight = {
        ...insight,
        insight: {
            ...insight.insight,
            visualizationUrl: "local:table",
            buckets: tableBuckets,
            ...propertiesProp,
        },
    };
    return tableInsight;
}
