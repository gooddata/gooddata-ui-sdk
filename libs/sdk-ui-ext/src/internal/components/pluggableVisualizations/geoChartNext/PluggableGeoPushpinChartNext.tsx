// (C) 2025-2026 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import {
    type IAnalyticalBackend,
    type IExecutionFactory,
    type IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IFilter,
    type IInsightDefinition,
    attributeLocalId,
    bucketAttribute,
    bucketItems,
    insightBucket,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    insightLayers,
    insightTitle,
    newAttribute,
} from "@gooddata/sdk-model";
import { BucketNames, GeoLocationMissingSdkError, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    GeoChartNextInternal,
    type IGeoLayer,
    type IGeoPushpinChartNextConfig,
    buildLayerExecution,
    createPushpinLayer,
    insightLayersToGeoLayers,
    isGeoLayerPushpin,
} from "@gooddata/sdk-ui-geo/next";

import {
    createAttributeRef,
    extractControls,
    getLatitudeAttribute,
    getLocationProperties,
    getPrimaryLayerControls,
} from "./geoAttributeHelper.js";
import { buildGeoVisualizationConfig } from "./geoConfigBuilder.js";
import {
    createConfiguredBuckets,
    createSortForSegment,
    distributeMeasures,
    getLocationItems,
    sanitizeMeasures,
} from "./geoPushpinBucketHelper.js";
import { BUCKETS } from "../../../constants/bucket.js";
import { GEOPUSHPIN_NEXT_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { GEO_PUSHPIN_CHART_UICONFIG } from "../../../constants/uiConfig.js";
import {
    EmptyAfmSdkError,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IUiConfig,
    type IVisConstruct,
    type IVisProps,
    type IVisualizationProperties,
} from "../../../interfaces/Visualization.js";
import { configurePercent } from "../../../utils/bucketConfig.js";
import { limitNumberOfMeasuresInBuckets } from "../../../utils/bucketHelper.js";
import { routeLocalIdRefFiltersToLayers } from "../../../utils/filters/routeLocalIdRefFiltersToLayers.js";
import { sanitizeGeoReferencePointFilters } from "../../../utils/filters/sanitizeGeoReferencePointFilters.js";
import { removeSort } from "../../../utils/sort.js";
import { setGeoPushpinUiConfig } from "../../../utils/uiConfigHelpers/geoPushpinChartUiConfigHelper.js";
import { GeoPushpinConfigurationPanel } from "../../configurationPanels/GeoPushpinConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

type GeoChartNextExecutionProps = Parameters<typeof GeoChartNextInternal>[0];

/**
 * Geo pushpin charts support max 2 measures: one for size and one for color
 */
const NUMBER_MEASURES_IN_BUCKETS_LIMIT = 2;

/**
 * PluggableGeoPushpinChartNext
 *
 * Next-generation geo pushpin chart implementation.
 * Supports multi-layer geo charts through the insight layers property.
 * Additional layers configured externally are preserved but not editable in AD.
 *
 * @alpha
 */
export class PluggableGeoPushpinChartNext extends PluggableBaseChart {
    private backend: IAnalyticalBackend;
    private workspace: string;

    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.PUSHPIN;
        this.backend = props.backend;
        this.workspace = props.projectId;
        this.initializeProperties(props.visualizationProperties);
    }

    /**
     * Extends reference point with geo pushpin-specific configuration.
     * Configures UI config, removes sorting, enables percent formatting, and updates clustering properties.
     *
     * @param referencePoint - The reference point to extend
     * @returns Promise resolving to the extended reference point
     */
    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        // IMPORTANT:
        // GeoChartNext is multi-layer, but AD's reference point contains a single buckets model.
        // The generic sanitizeFilters() (in PluggableBaseChart) does not know about additional layers and can
        // incorrectly drop MVFs that are meant for non-root layers. We keep the original filter bucket intact
        // and rely on per-layer execution sanitization instead.
        const originalFilters = cloneDeep(referencePoint.filters);

        return super
            .getExtendedReferencePoint(referencePoint)
            .then((extendedReferencePoint: IExtendedReferencePoint) => {
                let newReferencePoint: IExtendedReferencePoint = setGeoPushpinUiConfig(
                    extendedReferencePoint,
                    this.intl,
                    this.type,
                );
                newReferencePoint = configurePercent(newReferencePoint, true);
                newReferencePoint = removeSort(newReferencePoint);
                const updated = this.updateSupportedProperties(newReferencePoint);
                const enableImprovedAdFilters = this.featureFlags?.enableImprovedAdFilters ?? true;
                const sanitizedFilters = sanitizeGeoReferencePointFilters(
                    originalFilters,
                    referencePoint.buckets,
                    updated.buckets,
                    enableImprovedAdFilters,
                );
                return { ...updated, filters: sanitizedFilters };
            });
    }

    public override getUiConfig(): IUiConfig {
        const config = cloneDeep(GEO_PUSHPIN_CHART_UICONFIG);
        this.addMetricToFiltersIfEnabled(config);
        return config;
    }

    protected override getSupportedPropertiesList(): string[] {
        return GEOPUSHPIN_NEXT_SUPPORTED_PROPERTIES;
    }

    /**
     * Configures buckets for geo pushpin chart by distributing measures between SIZE and COLOR buckets.
     * Ensures proper measure distribution and applies bucket item limits.
     */
    protected override configureBuckets(
        extendedReferencePoint: IExtendedReferencePoint,
    ): IExtendedReferencePoint {
        const sanitized = sanitizeMeasures(extendedReferencePoint);
        const buckets = limitNumberOfMeasuresInBuckets(sanitized.buckets, NUMBER_MEASURES_IN_BUCKETS_LIMIT);

        const uiConfig = this.getUiConfig();
        const { sizeMeasures, colorMeasures } = distributeMeasures(buckets, uiConfig);
        const configuredBuckets = createConfiguredBuckets(buckets, sizeMeasures, colorMeasures, uiConfig);

        set(sanitized, BUCKETS, configuredBuckets);
        return sanitized;
    }

    /**
     * Updates properties in the reference point including clustering and location-based properties.
     */
    private updateSupportedProperties(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
        const buckets = referencePoint?.buckets ?? [];
        const uiConfig = this.getUiConfig();
        const locationItem = getLocationItems(buckets, uiConfig)[0];

        if (!locationItem) {
            return referencePoint;
        }

        const referencePointConfigured = cloneDeep(referencePoint);
        const visualizationProperties = this.visualizationProperties || {};
        const { controls = {} } = visualizationProperties;
        const locationProperties = getLocationProperties(locationItem);

        // Don't add groupNearbyPoints if it wasn't already in the properties.
        // This prevents marking the insight as "dirty" when just opening it.
        // The rendering code handles the default value (true when clustering is allowed).
        set(referencePointConfigured, "properties", {
            controls: {
                ...controls,
                ...locationProperties,
            },
        });

        if (this.references) {
            set(referencePointConfigured, "references", this.references);
        }
        return referencePointConfigured;
    }

    /**
     * Validates insight has data defined before rendering.
     * Throws EmptyAfmSdkError if no data is defined.
     *
     * @param insight - The insight definition to validate
     * @returns true if validation passes
     * @throws EmptyAfmSdkError if no data is defined
     * @throws GeoLocationMissingSdkError if latitude attribute is not defined
     */
    protected override checkBeforeRender(insight: IInsightDefinition): boolean {
        if (!insightHasDataDefined(insight)) {
            throw new EmptyAfmSdkError();
        }

        const latitudeFromBucket = getLatitudeAttribute(insight);
        if (!latitudeFromBucket) {
            throw new GeoLocationMissingSdkError();
        }

        const supportedControls = this.visualizationProperties.controls || {};
        const controlsWithFallback: Record<string, unknown> = {
            ...this.getInsightControlsWithFallback(insight),
            ...supportedControls,
        };
        const latitudeCandidate = controlsWithFallback?.["latitude"];
        const longitudeCandidate = controlsWithFallback?.["longitude"];
        const latitudeId = typeof latitudeCandidate === "string" ? latitudeCandidate : undefined;
        const longitudeId = typeof longitudeCandidate === "string" ? longitudeCandidate : undefined;

        if (!latitudeId || !longitudeId) {
            throw new GeoLocationMissingSdkError();
        }

        return true;
    }

    /**
     * Creates execution for geo pushpin chart with virtual buckets for latitude/longitude.
     * For backends supporting separate lat/long labels, creates virtual LATITUDE and LONGITUDE buckets
     * and excludes the original LOCATION bucket to avoid duplicate attributes.
     *
     * @param options - Visualization options
     * @param insight - Insight definition containing buckets and filters
     * @param executionFactory - Factory for creating executions
     * @returns Configured execution with proper dimensions and sorting
     */
    public override getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): IPreparedExecution {
        const ctx = this.buildPrimaryLayerContext(options, insight);
        if (!ctx) {
            // Never throw outside checkBeforeRender(). This fallback execution should be unreachable
            // when called from update()-driven rendering (validation happens in checkBeforeRender).
            return executionFactory.forInsight(insight).withExecConfig(options.executionConfig!);
        }
        const { primaryLayer, config, filters } = ctx;
        const { globalFilters, routedByLayerId } = routeLocalIdRefFiltersToLayers(filters, [
            { id: primaryLayer.id, buckets: insightBuckets(insight) },
            ...insightLayers(insight).map((l) => ({ id: l.id, buckets: l.buckets })),
        ]);
        const effectiveFilters = [...globalFilters, ...(routedByLayerId.get(primaryLayer.id) ?? [])];

        return buildLayerExecution(primaryLayer, {
            backend: this.backend,
            workspace: this.workspace,
            config,
            execConfig: options.executionConfig,
            globalFilters: effectiveFilters,
            executionFactory,
        });
    }

    public override getExecutions(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): IPreparedExecution[] {
        const ctx = this.buildPrimaryLayerContext(options, insight);
        if (!ctx) {
            return [];
        }
        const { primaryLayer, config, filters } = ctx;
        const { globalFilters, routedByLayerId } = routeLocalIdRefFiltersToLayers(filters, [
            { id: primaryLayer.id, buckets: insightBuckets(insight) },
            ...insightLayers(insight).map((l) => ({ id: l.id, buckets: l.buckets })),
        ]);
        const insightLayerDefs = insightLayers(insight);
        const additionalLayers = insightLayersToGeoLayers(insightLayerDefs);
        const resolvedAdditionalLayers = additionalLayers.filter((layer) => !this.shouldSkipLayer(layer));

        return this.buildAdditionalLayerExecutions(
            resolvedAdditionalLayers,
            options,
            config,
            globalFilters,
            routedByLayerId,
            executionFactory,
        );
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            this.renderFun(
                <GeoPushpinConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={this.visualizationProperties}
                    references={this.references}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    permissions={this.permissions}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    /**
     * Builds geo-specific visualization configuration.
     * Extends base chart config with geo-specific properties like map tiles and tooltips.
     *
     * @param options - Visualization options
     * @param supportedControls - Supported visualization properties
     * @returns Next-gen geo chart configuration
     */
    protected override buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IGeoPushpinChartNextConfig {
        const { colorMapping } = super.buildVisualizationConfig(options, supportedControls);

        return buildGeoVisualizationConfig({
            options,
            supportedControls,
            colorMapping,
            environment: this.environment,
        });
    }

    protected override renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { custom = {}, locale, theme } = options;
        const { drillableItems } = custom;
        const ctx = this.buildPrimaryLayerContext(options, insight);
        if (!ctx) {
            return;
        }
        const { config: configWithResolvedTooltip } = ctx;
        const primaryExecution = this.getExecution(options, insight, executionFactory);
        const additionalLayerExecutions = this.getExecutions(options, insight, executionFactory) ?? [];
        const geoChartProps: GeoChartNextExecutionProps = {
            backend: this.backend,
            workspace: this.workspace,
            type: "pushpin",
            execution: primaryExecution,
            executions: additionalLayerExecutions,
            execConfig: options.executionConfig,
            drillableItems,
            config: configWithResolvedTooltip,
            locale,
            theme,
            pushData: this.handlePushData,
            afterRender: this.afterRender,
            onError: this.onError,
            onExportReady: this.onExportReady,
            onLoadingChanged: this.onLoadingChanged,
            onDrill: this.onDrill,
        };

        this.renderFun(<GeoChartNextInternal {...geoChartProps} />, this.getElement());
    }

    private buildPrimaryLayerContext(
        options: IVisProps,
        insight: IInsightDefinition,
    ): { primaryLayer: IGeoLayer; config: IGeoPushpinChartNextConfig; filters: IFilter[] } | undefined {
        const supportedControls = this.visualizationProperties.controls || {};
        const fullConfig = this.buildVisualizationConfig(options, supportedControls);
        const controlsWithFallback: Record<string, unknown> = {
            ...this.getInsightControlsWithFallback(insight),
            ...supportedControls,
        };
        const filters = insightFilters(insight);
        const sortBy = createSortForSegment(insight);
        const locationBucket = insightBucket(insight, BucketNames.LOCATION);
        const sizeBucket = insightBucket(insight, BucketNames.SIZE);
        const colorBucket = insightBucket(insight, BucketNames.COLOR);
        const segmentBucket = insightBucket(insight, BucketNames.SEGMENT);

        const latitudeFromBucket = locationBucket ? bucketAttribute(locationBucket) : undefined;
        const size = sizeBucket ? bucketItems(sizeBucket)[0] : undefined;
        const color = colorBucket ? bucketItems(colorBucket)[0] : undefined;
        const segmentBy = segmentBucket ? bucketAttribute(segmentBucket) : undefined;

        const latitudeCandidate = controlsWithFallback?.["latitude"];
        const longitudeCandidate = controlsWithFallback?.["longitude"];
        const latitudeId = typeof latitudeCandidate === "string" ? latitudeCandidate : undefined;
        const longitudeId = typeof longitudeCandidate === "string" ? longitudeCandidate : undefined;

        // IMPORTANT: keep localId of the original LOCATION attribute so MVF/ranking filters that reference it
        // (via localIdRef in dimensionality) do not become dangling when LOCATION bucket is replaced by LAT/LNG.
        const latitudeLocalId = latitudeFromBucket ? attributeLocalId(latitudeFromBucket) : "latitude_df";
        const latitudeAttribute = this.createAttributeFromId(latitudeFromBucket, latitudeId, latitudeLocalId);
        const longitudeAttribute = this.createAttributeFromId(
            latitudeFromBucket,
            longitudeId,
            "longitude_df",
        );

        if (!latitudeAttribute || !longitudeAttribute) {
            // Invalid or incomplete geo config; validation is handled in checkBeforeRender().
            return undefined;
        }

        const configWithResolvedTooltip = fullConfig;

        // Set primary layer name to the insight title so legend/title logic is consistent for all layers.
        const title = insightTitle(insight);
        const primaryLayer = createPushpinLayer({
            ...(title ? { name: title } : {}),
            latitude: latitudeAttribute,
            longitude: longitudeAttribute,
            sortBy,
            ...(size ? { size } : {}),
            ...(color ? { color } : {}),
            ...(segmentBy ? { segmentBy } : {}),
        });

        return {
            primaryLayer,
            config: configWithResolvedTooltip,
            filters,
        };
    }

    private buildAdditionalLayerExecutions(
        layers: IGeoLayer[],
        options: IVisProps,
        config: IGeoPushpinChartNextConfig,
        globalFilters: IFilter[],
        routedByLayerId: Map<string, IFilter[]>,
        executionFactory: IExecutionFactory,
    ): IPreparedExecution[] {
        if (!layers.length) {
            return [];
        }

        return layers.map((layer) => {
            const effectiveFilters = [...globalFilters, ...(routedByLayerId.get(layer.id) ?? [])];
            return buildLayerExecution(layer, {
                backend: this.backend,
                workspace: this.workspace,
                config,
                execConfig: options.executionConfig,
                globalFilters: effectiveFilters,
                executionFactory,
            });
        });
    }

    private createAttributeFromId(
        baseAttribute: IAttribute | undefined,
        attributeId: string | undefined,
        localId: string,
    ): IAttribute | undefined {
        if (!baseAttribute || !attributeId) {
            return undefined;
        }

        const ref = createAttributeRef(baseAttribute, attributeId);
        return newAttribute(ref, (attribute) => attribute.localId(localId));
    }

    private shouldSkipLayer(layer: IGeoLayer): boolean {
        if (!isGeoLayerPushpin(layer)) {
            return false;
        }

        // Skip layers when latitude or longitude is missing
        return !layer.latitude || !layer.longitude;
    }

    private getInsightControlsWithFallback(insight: IInsightDefinition): IVisualizationProperties {
        const insightControls = extractControls(insight) || {};
        const layerControls = getPrimaryLayerControls(insight);

        return {
            ...layerControls,
            ...insightControls,
        };
    }
}
