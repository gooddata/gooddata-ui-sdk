// (C) 2025-2026 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import {
    type IAnalyticalBackend,
    type IExecutionFactory,
    type IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import {
    type IFilter,
    type IInsightDefinition,
    bucketAttribute,
    bucketItems,
    insightBucket,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    insightLayers,
    insightTitle,
} from "@gooddata/sdk-model";
import { BucketNames, GeoAreaMissingSdkError, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    type IGeoAreaChartConfig,
    type IGeoLayer,
    createAreaLayer,
    isGeoLayerPushpin,
} from "@gooddata/sdk-ui-geo";
import {
    GeoChartInternal,
    buildLayerExecution,
    insightLayersToGeoLayers,
} from "@gooddata/sdk-ui-geo/internal";

import {
    createAreaConfiguredBuckets,
    createAreaSortForSegment,
    getAreaItems,
    getColorMeasures,
    getSegmentItems,
    hasAreaMinimumData,
    sanitizeAreaMeasures,
} from "./geoAreaBucketHelper.js";
import { buildAreaVisualizationConfig } from "./geoAreaConfigBuilder.js";
import { BUCKETS } from "../../../constants/bucket.js";
import { GEOAREA_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { GEO_AREA_CHART_UICONFIG } from "../../../constants/uiConfig.js";
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
import { setGeoAreaUiConfig } from "../../../utils/uiConfigHelpers/geoAreaChartUiConfigHelper.js";
import { GeoAreaConfigurationPanel } from "../../configurationPanels/GeoAreaConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

type GeoChartNextExecutionProps = Parameters<typeof GeoChartInternal>[0];

/**
 * Geo area charts support max 1 measure for color
 */
const NUMBER_MEASURES_IN_BUCKETS_LIMIT = 1;

/**
 * PluggableGeoAreaChart
 *
 * Next-generation geo area chart implementation
 *
 * @alpha
 */
export class PluggableGeoAreaChart extends PluggableBaseChart {
    private backend: IAnalyticalBackend;
    private workspace: string;

    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.CHOROPLETH;
        this.backend = props.backend;
        this.workspace = props.projectId;
        this.initializeProperties(props.visualizationProperties);
    }

    /**
     * Extends reference point with geo area-specific configuration.
     */
    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        // IMPORTANT:
        // GeoChartNext is multi-layer, but AD's reference point contains a single buckets model.
        // The generic sanitizeFilters() (in PluggableBaseChart) does not know about additional layers and can
        // incorrectly drop MVFs that are meant for non-root layers (e.g., pushpin layer MVFs).
        // We keep the original filter bucket intact here and rely on per-layer execution sanitization instead.
        const originalFilters = cloneDeep(referencePoint.filters);

        return super
            .getExtendedReferencePoint(referencePoint)
            .then((extendedReferencePoint: IExtendedReferencePoint) => {
                let newReferencePoint: IExtendedReferencePoint = setGeoAreaUiConfig(
                    extendedReferencePoint,
                    this.intl,
                );
                newReferencePoint = configurePercent(newReferencePoint, true);
                newReferencePoint = removeSort(newReferencePoint);
                const enableImprovedAdFilters = this.featureFlags?.enableImprovedAdFilters ?? true;
                const sanitizedFilters = sanitizeGeoReferencePointFilters(
                    originalFilters,
                    referencePoint.buckets,
                    newReferencePoint.buckets,
                    enableImprovedAdFilters,
                );
                return { ...newReferencePoint, filters: sanitizedFilters };
            });
    }

    public override getUiConfig(): IUiConfig {
        return cloneDeep(GEO_AREA_CHART_UICONFIG);
    }

    protected override getSupportedPropertiesList(): string[] {
        return GEOAREA_SUPPORTED_PROPERTIES;
    }

    /**
     * Configures buckets for geo area chart.
     */
    protected override configureBuckets(
        extendedReferencePoint: IExtendedReferencePoint,
    ): IExtendedReferencePoint {
        const sanitized = sanitizeAreaMeasures(extendedReferencePoint);
        const buckets = limitNumberOfMeasuresInBuckets(sanitized.buckets, NUMBER_MEASURES_IN_BUCKETS_LIMIT);

        const uiConfig = this.getUiConfig();
        const segmentItems = getSegmentItems(buckets);
        const colorMeasures = getColorMeasures(buckets);
        const areaItems = getAreaItems(buckets, uiConfig);
        const configuredBuckets = createAreaConfiguredBuckets(
            buckets,
            areaItems,
            segmentItems,
            colorMeasures,
            uiConfig,
        );

        set(sanitized, BUCKETS, configuredBuckets);
        return sanitized;
    }

    /**
     * Validates insight has data defined before rendering.
     */
    protected override checkBeforeRender(insight: IInsightDefinition): boolean {
        if (!insightHasDataDefined(insight)) {
            throw new EmptyAfmSdkError();
        }

        const buckets = insightBuckets(insight);
        if (!hasAreaMinimumData(buckets)) {
            throw new GeoAreaMissingSdkError();
        }

        return true;
    }

    /**
     * Creates execution for geo area chart.
     *
     * @remarks
     * This method is called by the base visualization infrastructure for exports
     * and other external consumers. The internal rendering uses `buildLayerExecution()`
     * which works with the layer-based architecture.
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
                <GeoAreaConfigurationPanel
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
     * Builds geo area-specific visualization configuration.
     */
    protected override buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IGeoAreaChartConfig {
        const { colorMapping } = super.buildVisualizationConfig(options, supportedControls);

        return buildAreaVisualizationConfig({
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
        const { config } = ctx;
        const primaryExecution = this.getExecution(options, insight, executionFactory);
        const additionalLayerExecutions = this.getExecutions(options, insight, executionFactory) ?? [];

        const geoChartProps: GeoChartNextExecutionProps = {
            backend: this.backend,
            workspace: this.workspace,
            type: "area",
            execution: primaryExecution,
            executions: additionalLayerExecutions,
            execConfig: options.executionConfig,
            drillableItems,
            config,
            locale,
            theme,
            pushData: this.handlePushData,
            afterRender: this.afterRender,
            onError: this.onError,
            onExportReady: this.onExportReady,
            onLoadingChanged: this.onLoadingChanged,
            onDrill: this.onDrill,
        };

        this.renderFun(<GeoChartInternal {...geoChartProps} />, this.getElement());
    }

    private buildPrimaryLayerContext(
        options: IVisProps,
        insight: IInsightDefinition,
    ): { primaryLayer: IGeoLayer; config: IGeoAreaChartConfig; filters: IFilter[] } | undefined {
        const supportedControls = this.visualizationProperties.controls || {};
        const fullConfig = this.buildVisualizationConfig(options, supportedControls);
        const filters = insightFilters(insight);
        const sortBy = createAreaSortForSegment(insight);

        const areaBucket = insightBucket(insight, BucketNames.AREA);
        const area = areaBucket ? bucketAttribute(areaBucket) : undefined;
        if (!area) {
            // Invalid or incomplete geo config; validation is handled in checkBeforeRender().
            return undefined;
        }
        const colorBucket = insightBucket(insight, BucketNames.COLOR);
        const color = colorBucket ? bucketItems(colorBucket)[0] : undefined;
        const segmentBucket = insightBucket(insight, BucketNames.SEGMENT);
        const segmentBy = segmentBucket ? bucketAttribute(segmentBucket) : undefined;

        // Set primary layer name to the insight title so legend/title logic is consistent for all layers.
        const title = insightTitle(insight);
        const primaryLayer = createAreaLayer({
            ...(title ? { name: title } : {}),
            area,
            ...(color ? { color } : {}),
            ...(segmentBy ? { segmentBy } : {}),
            sortBy,
            // Colors are ALWAYS per-layer.
            // AD's "root" color config is just the primary (root insight) layer config.
            ...(fullConfig.colorPalette || fullConfig.colorMapping
                ? {
                      config: {
                          ...(fullConfig.colorPalette ? { colorPalette: fullConfig.colorPalette } : {}),
                          ...(fullConfig.colorMapping ? { colorMapping: fullConfig.colorMapping } : {}),
                      },
                  }
                : {}),
        });

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
        config: IGeoAreaChartConfig,
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
}
