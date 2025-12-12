// (C) 2025 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import {
    type IAnalyticalBackend,
    type IExecutionFactory,
    type IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IInsightDefinition,
    bucketAttribute,
    bucketItems,
    insightBucket,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    insightLayers,
    newAttribute,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    type IAvailableDrillTargets,
    type IPushData,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import {
    GeoChartNextInternal,
    type IGeoAreaChartConfig,
    type IGeoLayer,
    buildLayerExecution,
    createAreaLayer,
    insightLayersToGeoLayers,
    isGeoLayerPushpin,
} from "@gooddata/sdk-ui-geo/next";

import {
    createAreaConfiguredBuckets,
    createAreaSortForSegment,
    getAreaItems,
    getAreaTooltipText,
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
    type IBucketItem,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IUiConfig,
    type IVisConstruct,
    type IVisProps,
    type IVisualizationProperties,
} from "../../../interfaces/Visualization.js";
import { configurePercent } from "../../../utils/bucketConfig.js";
import { limitNumberOfMeasuresInBuckets } from "../../../utils/bucketHelper.js";
import { removeSort } from "../../../utils/sort.js";
import { setGeoAreaUiConfig } from "../../../utils/uiConfigHelpers/geoAreaChartUiConfigHelper.js";
import { GeoAreaConfigurationPanel } from "../../configurationPanels/GeoAreaConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import { createAttributeRef } from "../geoChartNext/geoAttributeHelper.js";

type GeoChartNextExecutionProps = Parameters<typeof GeoChartNextInternal>[0];

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
     * Removes attribute drill targets since geo area charts don't support drilling from attributes.
     */
    private withEmptyAttributeTargets(drillTargets: IAvailableDrillTargets): IAvailableDrillTargets {
        return {
            ...drillTargets,
            attributes: [],
        };
    }

    /**
     * Store reference to parent's handlePushData to call it from our override.
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private superHandlePushData = this.handlePushData;

    /**
     * Override push data handler to filter out attribute drill targets.
     * Geo area charts only support drilling from measures.
     */
    protected override handlePushData = (data: IPushData): void => {
        this.superHandlePushData({
            ...data,
            ...(data?.availableDrillTargets && {
                availableDrillTargets: this.withEmptyAttributeTargets(data.availableDrillTargets),
            }),
        });
    };

    /**
     * Extends reference point with geo area-specific configuration.
     */
    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        return super
            .getExtendedReferencePoint(referencePoint)
            .then((extendedReferencePoint: IExtendedReferencePoint) => {
                let newReferencePoint: IExtendedReferencePoint = setGeoAreaUiConfig(
                    extendedReferencePoint,
                    this.intl,
                );
                newReferencePoint = configurePercent(newReferencePoint, true);
                newReferencePoint = removeSort(newReferencePoint);
                const tooltipText = this.visualizationProperties?.controls?.["tooltipText"] as
                    | string
                    | undefined;
                return this.applyTooltipProperty(newReferencePoint, tooltipText);
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
        const areaItems = getAreaItems(buckets, uiConfig);
        const tooltipText = this.resolveTooltipText(areaItems[0]);
        const segmentItems = getSegmentItems(buckets);
        const colorMeasures = getColorMeasures(buckets);
        const configuredBuckets = createAreaConfiguredBuckets(
            buckets,
            areaItems,
            segmentItems,
            colorMeasures,
            uiConfig,
        );

        set(sanitized, BUCKETS, configuredBuckets);

        this.updateTooltipVisualizationProperties(tooltipText);

        return this.applyTooltipProperty(sanitized, tooltipText);
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
            throw new EmptyAfmSdkError();
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
        _executionFactory: IExecutionFactory,
    ) {
        const { primaryLayer, config } = this.buildPrimaryLayerContext(options, insight);

        return buildLayerExecution(primaryLayer, {
            backend: this.backend,
            workspace: this.workspace,
            config,
            execConfig: options.executionConfig,
        });
    }

    public override getExecutions(
        options: IVisProps,
        insight: IInsightDefinition,
        _executionFactory: IExecutionFactory,
    ): IPreparedExecution[] {
        const { config } = this.buildPrimaryLayerContext(options, insight);
        const insightLayerDefs = insightLayers(insight);
        const additionalLayers = insightLayersToGeoLayers(insightLayerDefs);
        const resolvedAdditionalLayers = additionalLayers.filter((layer) => !this.shouldSkipLayer(layer));

        return this.buildAdditionalLayerExecutions(resolvedAdditionalLayers, options, config);
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
        const { config: configWithTooltip } = this.buildPrimaryLayerContext(options, insight);
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
            config: configWithTooltip,
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
    ): { primaryLayer: IGeoLayer; config: IGeoAreaChartConfig } {
        const supportedControls = this.visualizationProperties.controls || {};
        const fullConfig = this.buildVisualizationConfig(options, supportedControls);
        const filters = insightFilters(insight);
        const sortBy = createAreaSortForSegment(insight);

        const areaBucket = insightBucket(insight, BucketNames.AREA);
        const area = areaBucket ? bucketAttribute(areaBucket) : undefined;
        const colorBucket = insightBucket(insight, BucketNames.COLOR);
        const color = colorBucket ? bucketItems(colorBucket)[0] : undefined;
        const segmentBucket = insightBucket(insight, BucketNames.SEGMENT);
        const segmentBy = segmentBucket ? bucketAttribute(segmentBucket) : undefined;

        const tooltipTextId = supportedControls?.["tooltipText"] as string | undefined;
        const tooltipTextAttribute = this.createTooltipTextAttribute(area, tooltipTextId);
        const configWithTooltip = tooltipTextAttribute
            ? { ...fullConfig, tooltipText: tooltipTextAttribute }
            : fullConfig;

        const primaryLayer = createAreaLayer({
            area: area as IAttribute,
            ...(color ? { color } : {}),
            ...(segmentBy ? { segmentBy } : {}),
            filters,
            sortBy,
        });

        return {
            primaryLayer,
            config: configWithTooltip,
        };
    }

    private buildAdditionalLayerExecutions(
        layers: IGeoLayer[],
        options: IVisProps,
        config: IGeoAreaChartConfig,
    ): IPreparedExecution[] {
        if (!layers.length) {
            return [];
        }

        return layers.map((layer) =>
            buildLayerExecution(layer, {
                backend: this.backend,
                workspace: this.workspace,
                config,
                execConfig: options.executionConfig,
            }),
        );
    }

    private shouldSkipLayer(layer: IGeoLayer): boolean {
        if (!isGeoLayerPushpin(layer)) {
            return false;
        }

        // Skip layers when latitude or longitude is missing
        return !layer.latitude || !layer.longitude;
    }

    private createTooltipTextAttribute(
        area: IAttribute | undefined,
        tooltipTextId?: string,
    ): IAttribute | undefined {
        if (!area || !tooltipTextId) {
            return undefined;
        }

        const tooltipRef = createAttributeRef(area, tooltipTextId);
        return newAttribute(tooltipRef, (attribute) => attribute.localId("tooltipText_df"));
    }

    private resolveTooltipText(areaItem?: IBucketItem): string | undefined {
        if (!areaItem) {
            return undefined;
        }

        return getAreaTooltipText(areaItem);
    }

    private updateTooltipVisualizationProperties(tooltipText?: string): void {
        if (!tooltipText) {
            return;
        }

        const currentProperties = this.visualizationProperties ?? {};
        const currentControls = currentProperties.controls ?? {};

        this.visualizationProperties = {
            ...currentProperties,
            controls: {
                ...currentControls,
                tooltipText,
            },
        };
    }

    private applyTooltipProperty(
        referencePoint: IExtendedReferencePoint,
        tooltipText?: string,
    ): IExtendedReferencePoint {
        if (!tooltipText) {
            return referencePoint;
        }

        const updated = cloneDeep(referencePoint);
        const properties = (updated.properties as IVisualizationProperties | undefined) ?? {};
        const controls = properties.controls ?? {};

        set(updated, "properties.controls", {
            ...controls,
            tooltipText,
        });

        return updated;
    }
}
