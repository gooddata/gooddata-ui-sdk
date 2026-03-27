// (C) 2025-2026 GoodData Corporation

import { cloneDeep, isEqual, set } from "lodash-es";

import {
    type IAnalyticalBackend,
    type IExecutionFactory,
    type IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import {
    type IFilter,
    type IInsightDefinition,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    insightLayers,
    insightSorts,
    insightTitle,
} from "@gooddata/sdk-model";
import { BucketNames, GeoLocationMissingSdkError, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    type GeoChartShapeType,
    type IGeoChartConfig,
    type IGeoLayer,
    isGeoLayerPushpin,
} from "@gooddata/sdk-ui-geo";
import {
    GeoChartInternal,
    PUSHPIN_LAYER_ID,
    buildLayerExecution,
    insightLayerToGeoLayer,
    insightLayersToGeoLayers,
} from "@gooddata/sdk-ui-geo/internal";

import {
    extractControls,
    getLatitudeAttribute,
    getLocationProperties,
    getPrimaryLayerControls,
    hasGeoIconDisplayForm,
} from "./geoAttributeHelper.js";
import { buildGeoVisualizationConfig } from "./geoConfigBuilder.js";
import {
    createConfiguredBuckets,
    distributeMeasures,
    getLocationItems,
    sanitizeMeasures,
} from "./geoPushpinBucketHelper.js";
import { BUCKETS } from "../../../constants/bucket.js";
import {
    isGeoChartsViewportConfigEnabled,
    isGeoPushpinIconEnabled,
} from "../../../constants/featureFlags.js";
import { GEOPUSHPIN_NEXT_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { GEO_PUSHPIN_CHART_UICONFIG } from "../../../constants/uiConfig.js";
import { type IDropdownItem } from "../../../interfaces/Dropdown.js";
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
import {
    isPushpinClusteringEditable,
    isPushpinClusteringEditableForBuckets,
} from "../../../utils/geoPushpinCompatibility.js";
import { removeSort } from "../../../utils/sort.js";
import { setGeoPushpinUiConfig } from "../../../utils/uiConfigHelpers/geoPushpinChartUiConfigHelper.js";
import { GeoPushpinConfigurationPanel } from "../../configurationPanels/GeoPushpinConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import {
    getGeoControlsWithFallback,
    getGeoVisualizationPropertiesWithFallback,
} from "../geoCommon/geoVisualizationPropertiesWithFallback.js";
import { LiveMapViewTracker, createSyncedViewportHandlers } from "../geoCommon/liveMapViewTracking.js";

type GeoChartNextExecutionProps = Parameters<typeof GeoChartInternal>[0];

/**
 * Geo pushpin charts support max 2 measures: size + color, or icon metric alone.
 * Tooltip metric is independent and doesn't count toward this limit.
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
    private liveMapView = new LiveMapViewTracker();
    private spriteIcons: IDropdownItem[] = [];
    private loadedSpriteIconsKey?: string;
    private loadingSpriteIconsKey?: string;
    private cachedHasGeoIconLabel = false;
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.PUSHPIN;
        this.backend = props.backend;
        this.workspace = props.projectId;
        this.initializeProperties(props.visualizationProperties);
        this.initializePropertiesMeta();
    }

    public override haveSomePropertiesRelevantForReferencePointChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ): boolean {
        return (
            getPushpinShapeType(currentReferencePoint) !== getPushpinShapeType(nextReferencePoint) ||
            !isEqual(
                currentReferencePoint?.properties?.sortItems ?? [],
                nextReferencePoint?.properties?.sortItems ?? [],
            )
        );
    }

    // Clear stale propertiesMeta synchronously. useGeoPushData will push the
    // computed value once async data loading completes.
    private initializePropertiesMeta(): void {
        this.pushData({
            propertiesMeta: { isGeoSegmentConflictRecommended: false },
        });
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
                let newReferencePoint: IExtendedReferencePoint =
                    this.getResolvedReferencePointWithFallback(extendedReferencePoint);
                newReferencePoint = disableClusteringIfNotEditable(newReferencePoint);
                newReferencePoint = setGeoPushpinUiConfig(
                    newReferencePoint,
                    this.intl,
                    this.type,
                    this.featureFlags,
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
                // Cache geo icon label availability for renderConfigurationPanel.
                // The reference point carries displayForms metadata that the insight does not.
                if (isGeoPushpinIconEnabled(this.featureFlags)) {
                    const uiConfig = this.getUiConfig();
                    const locItem = getLocationItems(updated.buckets, uiConfig)[0];
                    this.cachedHasGeoIconLabel = locItem ? hasGeoIconDisplayForm(locItem) : false;
                }

                return { ...updated, filters: sanitizedFilters };
            });
    }

    public override getUiConfig(): IUiConfig {
        const config = cloneDeep(GEO_PUSHPIN_CHART_UICONFIG);
        if (!isGeoPushpinIconEnabled(this.featureFlags)) {
            delete config.buckets[BucketNames.MEASURES];
        }
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

        // Separate the MEASURES bucket (tooltip metrics) before limiting —
        // the 2-measure limit applies only to size + color, not to tooltip metrics.
        const measuresBucket = sanitized.buckets.find((b) => b.localIdentifier === BucketNames.MEASURES);
        const bucketsWithoutMeasures = sanitized.buckets.filter(
            (b) => b.localIdentifier !== BucketNames.MEASURES,
        );
        const limitedBuckets = limitNumberOfMeasuresInBuckets(
            bucketsWithoutMeasures,
            NUMBER_MEASURES_IN_BUCKETS_LIMIT,
        );
        const buckets = measuresBucket ? [...limitedBuckets, measuresBucket] : limitedBuckets;

        const uiConfig = this.getUiConfig();
        const { sizeMeasures, colorMeasures, metricMeasures } = distributeMeasures(buckets, uiConfig);
        const configuredBuckets = createConfiguredBuckets(
            buckets,
            sizeMeasures,
            colorMeasures,
            metricMeasures,
            uiConfig,
        );

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
        const controls = referencePointConfigured.properties?.controls ?? {};
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

        const controlsWithFallback = getGeoControlsWithFallback(
            this.visualizationProperties,
            this.getInsightControlsWithFallback(insight),
        );
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

    private clearSpriteIcons(): void {
        this.spriteIcons = [];
        this.loadedSpriteIconsKey = undefined;
        this.loadingSpriteIconsKey = undefined;
    }

    private async loadSpriteIcons(spriteIconsKey: string): Promise<void> {
        this.spriteIcons = [];
        this.loadedSpriteIconsKey = undefined;
        this.loadingSpriteIconsKey = spriteIconsKey;

        try {
            const iconNames = await this.backend.geo().getDefaultStyleSpriteIcons();

            if (this.loadingSpriteIconsKey !== spriteIconsKey) {
                return;
            }

            this.spriteIcons = iconNames.map((name): IDropdownItem => ({ title: name, value: name }));
            this.loadedSpriteIconsKey = spriteIconsKey;
            this.loadingSpriteIconsKey = undefined;
            // Sprite metadata arrives asynchronously, so the already-rendered panel
            // must be rerendered to expose the updated icon choices.
            this.renderConfigurationPanel(this.currentInsight, this.currentOptions);
        } catch {
            if (this.loadingSpriteIconsKey !== spriteIconsKey) {
                return;
            }

            this.spriteIcons = [];
            this.loadedSpriteIconsKey = spriteIconsKey;
            this.loadingSpriteIconsKey = undefined;
            this.renderConfigurationPanel(this.currentInsight, this.currentOptions);
        }
    }

    private syncSpriteIcons(): void {
        const spriteIconsKey = this.featureFlags?.["geoIconSheet"];
        if (typeof spriteIconsKey !== "string" || !spriteIconsKey) {
            this.clearSpriteIcons();
            return;
        }

        if (this.loadedSpriteIconsKey === spriteIconsKey || this.loadingSpriteIconsKey === spriteIconsKey) {
            return;
        }

        void this.loadSpriteIcons(spriteIconsKey);
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();
        const isViewportConfigEnabled = isGeoChartsViewportConfigEnabled(this.featureFlags);
        const iconEnabled = isGeoPushpinIconEnabled(this.featureFlags);
        this.liveMapView.resetIfInsightChanged(insight);

        if (iconEnabled) {
            this.syncSpriteIcons();
        } else {
            this.clearSpriteIcons();
        }

        // Use cached value from getExtendedReferencePoint — the reference point
        // carries displayForms metadata that the insight parameter does not.
        const hasGeoIconLabel = iconEnabled && this.cachedHasGeoIconLabel;

        if (configPanelElement) {
            const resolvedProperties = this.getResolvedVisualizationPropertiesWithFallback(insight);

            this.renderFun(
                <GeoPushpinConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={resolvedProperties}
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
                    getCurrentMapView={isViewportConfigEnabled ? this.getCurrentMapView : undefined}
                    spriteIcons={this.spriteIcons}
                    hasGeoIconLabel={hasGeoIconLabel}
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
    private buildGeoVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IGeoChartConfig {
        const { colorMapping } = super.buildVisualizationConfig(options, supportedControls);

        return buildGeoVisualizationConfig({
            options,
            supportedControls,
            colorMapping,
            environment: this.environment,
            featureFlags: this.featureFlags,
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
        this.liveMapView.resetIfInsightChanged(insight);
        const isViewportConfigEnabled = isGeoChartsViewportConfigEnabled(this.featureFlags);
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
            onCenterPositionChanged: isViewportConfigEnabled ? this.handleCenterPositionChanged : undefined,
            onZoomChanged: isViewportConfigEnabled ? this.handleZoomChanged : undefined,
            onBoundsChanged: isViewportConfigEnabled ? this.handleBoundsChanged : undefined,
            onViewportInteractionEnd: isViewportConfigEnabled
                ? this.handleViewportInteractionEnded
                : undefined,
        };

        this.renderFun(<GeoChartInternal {...geoChartProps} />, this.getElement());
    }

    private buildPrimaryLayerContext(
        options: IVisProps,
        insight: IInsightDefinition,
    ): { primaryLayer: IGeoLayer; config: IGeoChartConfig; filters: IFilter[] } | undefined {
        const controlsWithFallback =
            this.getResolvedVisualizationPropertiesWithFallback(insight).controls ?? {};
        const fullConfig = this.buildGeoVisualizationConfig(options, controlsWithFallback);
        const filters = insightFilters(insight);
        const sortBy = insightSorts(insight);
        const title = insightTitle(insight);
        const controlsForPrimaryLayer = {
            ...controlsWithFallback,
            ...(fullConfig.colorPalette ? { colorPalette: fullConfig.colorPalette } : {}),
        };

        const primaryLayer = insightLayerToGeoLayer({
            id: PUSHPIN_LAYER_ID,
            type: "pushpin",
            buckets: insightBuckets(insight),
            sorts: sortBy,
            properties: { controls: controlsForPrimaryLayer },
            ...(title ? { name: title } : {}),
        });

        if (!primaryLayer || !isGeoLayerPushpin(primaryLayer)) {
            // Invalid or incomplete geo config; validation is handled in checkBeforeRender().
            return undefined;
        }

        return {
            primaryLayer,
            // Prevent treating chart-level colors as global. They are stored on the primary layer above.
            config: { ...fullConfig, colorPalette: undefined, colorMapping: undefined },
            filters,
        };
    }

    private buildAdditionalLayerExecutions(
        layers: IGeoLayer[],
        options: IVisProps,
        config: IGeoChartConfig,
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

    private getResolvedVisualizationPropertiesWithFallback(
        insight: IInsightDefinition,
    ): IVisualizationProperties {
        const visualizationPropertiesWithFallback = getGeoVisualizationPropertiesWithFallback(
            this.visualizationProperties,
            this.getInsightControlsWithFallback(insight),
        );

        return disableClusteringInVisualizationPropertiesWhenNotEditable(
            visualizationPropertiesWithFallback,
            insight,
        );
    }

    private getResolvedReferencePointWithFallback(
        referencePoint: IExtendedReferencePoint,
    ): IExtendedReferencePoint {
        return set(
            cloneDeep(referencePoint),
            "properties",
            getGeoVisualizationPropertiesWithFallback(
                this.visualizationProperties ?? {},
                referencePoint.properties?.controls ?? {},
            ),
        );
    }

    private syncedHandlers = createSyncedViewportHandlers(this.liveMapView, {
        getEnvironment: () => this.environment,
        getVisualizationProperties: () => this.visualizationProperties,
        setVisualizationProperties: (props) => {
            this.visualizationProperties = props;
        },
        pushData: (data) => this.pushData(data),
    });

    private handleCenterPositionChanged = this.syncedHandlers.handleCenterPositionChanged;
    private handleZoomChanged = this.syncedHandlers.handleZoomChanged;
    private handleBoundsChanged = this.syncedHandlers.handleBoundsChanged;
    private handleViewportInteractionEnded = this.syncedHandlers.handleViewportInteractionEnded;
    private getCurrentMapView = () => this.liveMapView.getCurrentMapView(this.visualizationProperties);
}

function disableClusteringIfNotEditable(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    let updatedReferencePoint = referencePoint;
    const shapeType = getPushpinShapeType(referencePoint);
    const clusteringEnabled = referencePoint.properties?.controls?.["points"]?.groupNearbyPoints === true;

    if (clusteringEnabled && !isPushpinClusteringEditableForBuckets(referencePoint.buckets, shapeType)) {
        updatedReferencePoint = set(referencePoint, "properties.controls.points.groupNearbyPoints", false);
    }

    return updatedReferencePoint;
}

function disableClusteringInVisualizationPropertiesWhenNotEditable(
    visualizationProperties: IVisualizationProperties,
    insight: IInsightDefinition,
): IVisualizationProperties {
    const shapeType = getPushpinShapeType({ properties: visualizationProperties });

    if (isPushpinClusteringEditable(insight, shapeType)) {
        return visualizationProperties;
    }

    return set(cloneDeep(visualizationProperties), "controls.points.groupNearbyPoints", false);
}

function getPushpinShapeType(referencePoint: Pick<IReferencePoint, "properties">): GeoChartShapeType {
    return referencePoint.properties?.controls?.["points"]?.shapeType ?? "circle";
}
