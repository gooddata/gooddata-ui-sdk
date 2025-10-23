// (C) 2025 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import { IAnalyticalBackend, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    IInsightDefinition,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
} from "@gooddata/sdk-model";
import { BucketNames, IAvailableDrillTargets, IPushData, VisualizationTypes } from "@gooddata/sdk-ui";
import { getGeoChartDimensions } from "@gooddata/sdk-ui-geo";
import {
    GeoPushpinChartNextImplementation,
    ICoreGeoPushpinChartNextProps,
    IGeoPushpinChartNextConfig,
} from "@gooddata/sdk-ui-geo/next";

import { extractControls, getLocationProperties } from "./geoAttributeHelper.js";
import { buildGeoVisualizationConfig } from "./geoConfigBuilder.js";
import {
    createConfiguredBuckets,
    createSortForSegment,
    distributeMeasures,
    getLocationItems,
    sanitizeMeasures,
    shouldEnableClustering,
} from "./geoPushpinBucketHelper.js";
import { createVirtualBuckets } from "./geoVirtualBucketFactory.js";
import { BUCKETS } from "../../../constants/bucket.js";
import { GEOPUSHPIN_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { GEO_PUSHPIN_CHART_UICONFIG } from "../../../constants/uiConfig.js";
import {
    EmptyAfmSdkError,
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
import { setGeoPushpinUiConfig } from "../../../utils/uiConfigHelpers/geoPushpinChartUiConfigHelper.js";
import GeoPushpinConfigurationPanel from "../../configurationPanels/GeoPushpinConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

/**
 * Geo pushpin charts support max 2 measures: one for size and one for color
 */
const NUMBER_MEASURES_IN_BUCKETS_LIMIT = 2;

/**
 * PluggableGeoPushpinChartNext
 *
 * Next-generation geo pushpin chart implementation
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
     * Removes attribute drill targets since geo pushpin charts don't support drilling from attributes.
     */
    private withEmptyAttributeTargets(drillTargets: IAvailableDrillTargets): IAvailableDrillTargets {
        return {
            ...drillTargets,
            attributes: [],
        };
    }

    /**
     * Store reference to parent's handlePushData to call it from our override.
     * This is needed to properly handle color mapping while still filtering drill targets.
     * See: https://github.com/basarat/typescript-book/blob/master/docs/arrow-functions.md#tip-arrow-functions-and-inheritance
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private superHandlePushData = this.handlePushData;

    /**
     * Override push data handler to filter out attribute drill targets.
     * Geo pushpin charts only support drilling from measures.
     *
     * @param data - Push data from the visualization containing drill targets and other metadata
     */
    protected override handlePushData = (data: IPushData): void => {
        // Call parent's handlePushData to properly handle colors and other data
        this.superHandlePushData({
            ...data,
            ...(data?.availableDrillTargets && {
                availableDrillTargets: this.withEmptyAttributeTargets(data.availableDrillTargets),
            }),
        });
    };

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
                return this.updateSupportedProperties(newReferencePoint);
            });
    }

    public override getUiConfig(): IUiConfig {
        return cloneDeep(GEO_PUSHPIN_CHART_UICONFIG);
    }

    protected override getSupportedPropertiesList(): string[] {
        return GEOPUSHPIN_SUPPORTED_PROPERTIES;
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
        const groupNearbyPoints = shouldEnableClustering(buckets);
        const locationProperties = getLocationProperties(
            locationItem,
            this.backendCapabilities.supportsSeparateLatitudeLongitudeLabels,
        );

        set(referencePointConfigured, "properties", {
            controls: {
                points: {
                    groupNearbyPoints,
                },
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
     */
    protected override checkBeforeRender(insight: IInsightDefinition): boolean {
        if (!insightHasDataDefined(insight)) {
            throw new EmptyAfmSdkError();
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
    ) {
        const { executionConfig } = options;
        const controls = extractControls(insight);
        const baseBuckets = [...insightBuckets(insight)];

        const supportsSeparateLatLong = this.backendCapabilities.supportsSeparateLatitudeLongitudeLabels;
        const virtualBuckets = createVirtualBuckets(insight, controls, supportsSeparateLatLong);
        const allBuckets = [...baseBuckets, ...virtualBuckets];

        // Exclude original LOCATION bucket to avoid duplicate latitude attributes
        const buckets = supportsSeparateLatLong
            ? allBuckets.filter((bucket) => bucket.localIdentifier !== BucketNames.LOCATION)
            : allBuckets;

        return executionFactory
            .forBuckets(buckets, insightFilters(insight))
            .withDimensions(getGeoChartDimensions)
            .withSorting(...createSortForSegment(insight))
            .withExecConfig(executionConfig);
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
        const supportedControls = this.visualizationProperties.controls || {};
        const fullConfig = this.buildVisualizationConfig(options, supportedControls);
        const execution = this.getExecution(options, insight, executionFactory);

        const props: ICoreGeoPushpinChartNextProps = {
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

        this.renderFun(<GeoPushpinChartNextImplementation {...props} />, this.getElement());
    }
}
