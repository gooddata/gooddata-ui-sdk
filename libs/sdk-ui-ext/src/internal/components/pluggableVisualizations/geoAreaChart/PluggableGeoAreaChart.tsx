// (C) 2025 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import { IAnalyticalBackend, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    IBucket,
    IInsightDefinition,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
} from "@gooddata/sdk-model";
import { BucketNames, IAvailableDrillTargets, IPushData, VisualizationTypes } from "@gooddata/sdk-ui";
import { getGeoChartDimensions } from "@gooddata/sdk-ui-geo";
import {
    GeoAreaChartImplementation,
    ICoreGeoAreaChartProps,
    IGeoAreaChartConfig,
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
    IBucketItem,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
} from "../../../interfaces/Visualization.js";
import { configurePercent } from "../../../utils/bucketConfig.js";
import { limitNumberOfMeasuresInBuckets } from "../../../utils/bucketHelper.js";
import { removeSort } from "../../../utils/sort.js";
import { setGeoAreaUiConfig } from "../../../utils/uiConfigHelpers/geoAreaChartUiConfigHelper.js";
import { GeoAreaConfigurationPanel } from "../../configurationPanels/GeoAreaConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import { extractControls } from "../geoChartNext/geoAttributeHelper.js";
import { tryCreateVirtualBucket } from "../geoChartNext/geoVirtualBucketFactory.js";

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
     */
    public override getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const buckets = this.prepareExecutionData(insight);
        return this.buildExecution(buckets, options, insight, executionFactory);
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
        const supportedControls = this.visualizationProperties.controls || {};
        const fullConfig = this.buildVisualizationConfig(options, supportedControls);
        const buckets = this.prepareExecutionData(insight);
        const execution = this.buildExecution(buckets, options, insight, executionFactory);

        const props: ICoreGeoAreaChartProps = {
            backend: this.backend,
            workspace: this.workspace,
            execution,
            drillableItems,
            config: fullConfig,
            locale,
            theme,
            pushData: this.handlePushData,
            afterRender: this.afterRender,
            onError: this.onError,
            onExportReady: this.onExportReady,
            onLoadingChanged: this.onLoadingChanged,
            onDrill: this.onDrill,
        };

        this.renderFun(<GeoAreaChartImplementation {...props} />, this.getElement());
    }

    private buildExecution(
        buckets: IBucket[],
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { executionConfig } = options;

        return executionFactory
            .forBuckets(buckets, insightFilters(insight))
            .withDimensions(getGeoChartDimensions)
            .withSorting(...createAreaSortForSegment(insight))
            .withExecConfig(executionConfig);
    }

    private prepareExecutionData(insight: IInsightDefinition): IBucket[] {
        const buckets = cloneDeep(insightBuckets(insight));
        const tooltipBucket = this.createTooltipBucket(insight);
        if (tooltipBucket) {
            buckets.push(tooltipBucket);
        }
        return buckets;
    }

    private createTooltipBucket(insight: IInsightDefinition): IBucket | undefined {
        const controls = extractControls(insight);
        return tryCreateVirtualBucket(
            insight,
            controls["tooltipText"],
            BucketNames.TOOLTIP_TEXT,
            "tooltipText_df",
        );
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
