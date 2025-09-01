// (C) 2019-2025 GoodData Corporation
import React from "react";

import cloneDeep from "lodash/cloneDeep.js";
import compact from "lodash/compact.js";
import isEmpty from "lodash/isEmpty.js";
import omitBy from "lodash/omitBy.js";
import set from "lodash/set.js";
import tail from "lodash/tail.js";

import { IBackendCapabilities, IDataView, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    IColorMappingItem,
    IDimension,
    IInsight,
    IInsightDefinition,
    ISettings,
    ISortItem,
    insightHasMeasures,
} from "@gooddata/sdk-model";
import { BucketNames, ChartType, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    BaseChart,
    ColorUtils,
    IChartConfig,
    IColorMapping,
    updateConfigWithSettings,
    updateForecastWithSettings,
} from "@gooddata/sdk-ui-charts";

import { messages } from "../../../../locales.js";
import { BUCKETS } from "../../../constants/bucket.js";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { DEFAULT_CLUSTERING_THRESHOLD, DEFAULT_NUMBER_OF_CLUSTERS } from "../../../constants/scatter.js";
import { BASE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_BASE_CHART_UICONFIG, MAX_CATEGORIES_COUNT } from "../../../constants/uiConfig.js";
import { AxisType } from "../../../interfaces/AxisType.js";
import { IColorConfiguration } from "../../../interfaces/Colors.js";
import { IAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import {
    IBucketItem,
    IBucketOfFun,
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IReferences,
    IUiConfig,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    InvalidBucketsSdkError,
    RenderFunction,
    UnmountFunction,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getFilteredMeasuresForStackedCharts,
    getMeasureItems,
    getStackItems,
    isNotDateBucketItem,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { getValidProperties } from "../../../utils/colors.js";
import { generateDimensions } from "../../../utils/dimensions.js";
import { isForecastEnabled } from "../../../utils/forecastHelper.js";
import {
    getChartSupportedControls,
    getChartSupportedControlsDashboardsEnv,
    getReferencePointWithSupportedProperties,
    getSupportedPropertiesControls,
    hasColorMapping,
    isEmptyObject,
} from "../../../utils/propertiesHelper.js";
import { createSorts, removeSort, validateCurrentSort } from "../../../utils/sort.js";
import { getTranslation } from "../../../utils/translations.js";
import {
    setBaseChartUiConfig,
    setBaseChartUiConfigRecommendations,
} from "../../../utils/uiConfigHelpers/baseChartUiConfigHelper.js";
import { isOpenAsReportSupportedByVisualization } from "../../../utils/visualizationsHelper.js";
import BaseChartConfigurationPanel from "../../configurationPanels/BaseChartConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil.js";

export class PluggableBaseChart extends AbstractPluggableVisualization {
    protected projectId: string;
    protected type: ChartType;
    protected featureFlags: ISettings;
    protected defaultControlsProperties: IVisualizationProperties;
    protected customControlsProperties: IVisualizationProperties;
    protected colors: IColorConfiguration;
    protected references: IReferences;
    protected referencePoint: IReferencePoint | undefined;
    protected ignoreUndoRedo: boolean;
    protected axis: string;
    protected secondaryAxis: AxisType;
    protected environment: string;
    protected readonly renderFun: RenderFunction;
    protected readonly unmountFun: UnmountFunction;
    protected backendCapabilities: IBackendCapabilities;

    constructor(props: IVisConstruct) {
        super(props);

        this.projectId = props.projectId;
        this.environment = props.environment;
        this.type = VisualizationTypes.COLUMN;
        this.featureFlags = props.featureFlags ? props.featureFlags : {};
        this.ignoreUndoRedo = false;
        this.defaultControlsProperties = {};
        this.backendCapabilities = props.backend.capabilities;
        this.setCustomControlsProperties({});
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public unmount(): void {
        this.unmountFun([this.getElement(), this.getConfigPanelElement()].filter(Boolean));
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep(DEFAULT_BASE_CHART_UICONFIG);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const uiConfig = this.getUiConfig();
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig,
        };

        this.configureBuckets(newReferencePoint);

        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = setBaseChartUiConfigRecommendations(
            newReferencePoint,
            this.type,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = setBaseChartUiConfig(newReferencePoint, this.intl, this.type);
        if (!this.featureFlags.enableChartsSorting) {
            newReferencePoint = removeSort(newReferencePoint);
        }

        this.referencePoint = newReferencePoint;

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public getInsightWithDrillDownApplied(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const intersection = drillDownContext.event.drillContext.intersection;
        const withFilters = addIntersectionFiltersToInsight(
            source,
            intersection,
            backendSupportsElementUris,
            this.featureFlags.enableDuplicatedLabelValuesInAttributeFilter,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public isOpenAsReportSupported(): boolean {
        return isOpenAsReportSupportedByVisualization(this.type);
    }

    public setCustomControlsProperties(customControlsProperties: IVisualizationProperties): void {
        this.customControlsProperties = customControlsProperties;
    }

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat, executionConfig } = options;
        const supportedControls: IVisualizationProperties = this.getSupportedControls(insight, options);

        return executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(...createSorts(this.type, insight, supportedControls, this.featureFlags))
            .withDateFormat(dateFormat)
            .withExecConfig(executionConfig);
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const buckets = extendedReferencePoint?.buckets ?? [];
        const categoriesCount =
            extendedReferencePoint?.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT;

        set(extendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: getFilteredMeasuresForStackedCharts(buckets),
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: getAttributeItemsWithoutStacks(buckets).slice(0, categoriesCount),
            },
            {
                localIdentifier: BucketNames.STACK,
                items: this.getStackItems(buckets),
            },
        ]);
    }

    protected getSupportedPropertiesList(): string[] {
        return BASE_CHART_SUPPORTED_PROPERTIES;
    }

    protected getStackItems(buckets: IBucketOfFun[]): IBucketItem[] {
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);

        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.LOCATION,
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.STACK,
            BucketNames.SEGMENT,
        ]);
        let stacks = getStackItems(buckets);

        if (masterMeasures.length <= 1 && allAttributes.length > 1) {
            // first attribute is taken, find next available non-date attribute
            const attributesWithoutFirst = tail(allAttributes);
            const nonDate = attributesWithoutFirst.filter(isNotDateBucketItem);
            stacks = nonDate.slice(0, 1);
        }

        return stacks;
    }

    protected checkBeforeRender(insight: IInsightDefinition): boolean {
        super.checkBeforeRender(insight);

        if (!insightHasMeasures(insight)) {
            throw new InvalidBucketsSdkError();
        }

        return true;
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { dimensions = { height: undefined }, custom = {}, locale, theme } = options;
        const { height } = dimensions;

        // keep height undef for AD; causes indigo-visualizations to pick default 100%
        const resultingHeight = this.environment === DASHBOARDS_ENVIRONMENT ? height : undefined;
        const { drillableItems } = custom;
        const supportedControls: IVisualizationProperties = this.getSupportedControls(insight, options);
        const configSupportedControls = isEmpty(supportedControls) ? null : supportedControls;
        const fullConfig = this.buildVisualizationConfig(options, configSupportedControls);
        const execution = this.getExecution(options, insight, executionFactory);

        this.renderFun(
            <BaseChart
                enableExecutionCancelling={
                    fullConfig.enableExecutionCancelling ??
                    this.featureFlags.enableExecutionCancelling ??
                    false
                }
                execution={execution}
                afterRender={this.afterRender}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                onError={this.onError}
                onExportReady={this.onExportReady}
                onLoadingChanged={this.onLoadingChanged}
                pushData={this.handlePushData}
                onDataView={this.onDataView}
                height={resultingHeight}
                type={this.type}
                locale={locale}
                forecastConfig={updateForecastWithSettings(
                    fullConfig,
                    this.featureFlags,
                    isForecastEnabled(this.referencePoint, insight, this.type),
                )}
                config={updateConfigWithSettings(fullConfig, this.featureFlags)}
                LoadingComponent={null}
                ErrorComponent={null}
                theme={theme}
                {...enhanceBaseChartWithClusteringConfiguration(fullConfig)}
            />,
            this.getElement(),
        );
    }

    protected initializeProperties(visualizationProperties: IVisualizationProperties): void {
        const controls = visualizationProperties?.controls;

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: { controls: supportedProperties },
        };

        this.pushData({
            initialProperties,
        });
    }

    protected renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
                supportsChartFill: options.supportsChartFill,
            };
            this.renderFun(
                <BaseChartConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    protected getDimensions(insight: IInsightDefinition): IDimension[] {
        return generateDimensions(insight, this.type);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected handleConfirmedColorMapping(data: any): void {
        const resultingData = data;
        this.colors = data.colors;

        if (isEmptyObject(this.references)) {
            resultingData.references = {};
        } else if (this.references) {
            resultingData.references = this.references;
        }

        if (this.visualizationProperties) {
            resultingData.properties = getValidProperties(
                this.visualizationProperties,
                data.colors.colorAssignments,
            );

            this.visualizationProperties = resultingData.properties;
        }

        this.renderConfigurationPanel(this.currentInsight, this.currentOptions);

        const openAsReportConfig = this.getOpenAsReportConfig(resultingData.properties);

        if (this.ignoreUndoRedo) {
            this.ignoreUndoRedo = false;
            this.pushData(resultingData);
        } else {
            this.pushData({
                openAsReport: openAsReportConfig,
                ignoreUndoRedo: true,
                ...resultingData,
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected handlePushData = (data: any): void => {
        if (data.colors) {
            this.handleConfirmedColorMapping(data);
        } else {
            const updatedData = enhancePropertiesMetaWithPartialClusteringInfo(data, this.type);

            this.pushData({
                ...updatedData,
                references: this.references,
            });
        }
    };

    protected buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IChartConfig {
        const { config = {}, customVisualizationConfig = {}, a11yTitle, a11yDescription } = options;
        const colorMapping: IColorMappingItem[] = supportedControls?.colorMapping;

        const validColorMapping = compact(colorMapping).map(
            (mapItem): IColorMapping => ({
                predicate: ColorUtils.getColorMappingPredicate(mapItem.id),
                color: mapItem.color,
            }),
        );

        return {
            separators: config.separators,
            colorPalette: config.colorPalette,
            forceDisableDrillOnAxes: config.forceDisableDrillOnAxes,
            enableExecutionCancelling: config.enableExecutionCancelling,
            a11yTitle,
            a11yDescription,
            ...supportedControls,
            colorMapping: validColorMapping?.length > 0 ? validColorMapping : null,
            supportsChartFill: options.supportsChartFill,
            ...customVisualizationConfig,
        };
    }

    private getOpenAsReportConfig(properties: IVisualizationProperties) {
        const hasMapping = hasColorMapping(properties);
        const isSupported = this.isOpenAsReportSupported();

        const warningMessage = hasMapping
            ? getTranslation(messages.exportUnsupportedColors.id, this.intl)
            : "";

        return {
            supported: isSupported && !hasMapping,
            warningMessage,
        };
    }

    private getSupportedControls(insight: IInsightDefinition, options: IVisProps) {
        const defaultControls = getSupportedPropertiesControls(
            this.defaultControlsProperties,
            this.supportedPropertiesList,
        );
        const customControls = getSupportedPropertiesControls(
            this.customControlsProperties,
            this.supportedPropertiesList,
        );
        const supportedControls =
            this.environment === DASHBOARDS_ENVIRONMENT
                ? getChartSupportedControlsDashboardsEnv(
                      this.visualizationProperties?.controls,
                      options,
                      this.featureFlags,
                  )
                : getChartSupportedControls(
                      this.visualizationProperties?.controls,
                      insight,
                      this.featureFlags,
                  );

        return {
            ...defaultControls,
            ...supportedControls,
            ...customControls,
        };
    }

    protected isMultipleDatesEnabled(): boolean {
        //this is development FF and will be removed in the end of dev cycle
        return !!this.featureFlags["enableMultipleDates"];
    }

    protected reuseCurrentSort(
        previousAvailableSorts: IAvailableSortsGroup[],
        properties: IVisualizationProperties,
        availableSorts: IAvailableSortsGroup[],
        defaultSort: ISortItem[],
    ) {
        const previousSort = properties?.sortItems;
        return validateCurrentSort(previousAvailableSorts, previousSort, availableSorts, defaultSort);
    }
}

function enhancePropertiesMetaWithPartialClusteringInfo(data: any, type: ChartType) {
    let dataPropertiesMeta: { propertiesMeta?: any } = { propertiesMeta: data.propertiesMeta };

    if (data.dataView && type === "scatter") {
        const dataView = data.dataView as IDataView;
        const numberOfDataPoints = dataView.count[0];
        const numberOfClusters = dataView.clusteringConfig?.numberOfClusters;
        const showingPartialClusters = !!numberOfClusters && numberOfDataPoints < numberOfClusters;

        dataPropertiesMeta = {
            propertiesMeta: {
                ...dataPropertiesMeta.propertiesMeta,
                showingPartialClusters,
            },
        };
    }

    return {
        ...data,
        ...omitBy(dataPropertiesMeta, isEmpty),
    };
}

function enhanceBaseChartWithClusteringConfiguration(fullConfig: IChartConfig) {
    const threshold = fullConfig?.clustering?.threshold
        ? {
              threshold:
                  typeof fullConfig?.clustering?.threshold === "string"
                      ? parseFloat(fullConfig.clustering.threshold)
                      : (fullConfig?.clustering?.threshold ?? DEFAULT_CLUSTERING_THRESHOLD),
          }
        : {};

    return !isEmpty(fullConfig.clustering) && fullConfig.clustering.enabled
        ? {
              clusteringConfig: {
                  ...(fullConfig.clustering ?? {}),
                  numberOfClusters:
                      typeof fullConfig?.clustering?.numberOfClusters === "string"
                          ? parseInt(fullConfig.clustering.numberOfClusters, 10)
                          : (fullConfig?.clustering?.numberOfClusters ?? DEFAULT_NUMBER_OF_CLUSTERS),
                  ...threshold,
              },
          }
        : {};
}
