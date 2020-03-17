// (C) 2019 GoodData Corporation
import { IExecutionFactory, ISettings, SettingCatalog } from "@gooddata/sdk-backend-spi";
import {
    bucketsIsEmpty,
    IColorMappingItem,
    IDimension,
    IInsight,
    insightBuckets,
    insightHasDataDefined,
    insightHasMeasures,
    insightMeasures,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    ChartType,
    GoodDataSdkError,
    IExportFunction,
    ILoadingState,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { BaseChart, ColorUtils, IAxisConfig, IChartConfig } from "@gooddata/sdk-ui-charts";
import * as React from "react";
import { render } from "react-dom";

import { BUCKETS } from "../../../constants/bucket";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties";
import { BASE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { DEFAULT_BASE_CHART_UICONFIG, MAX_CATEGORIES_COUNT, UICONFIG } from "../../../constants/uiConfig";
import { AxisType } from "../../../interfaces/AxisType";
import { IColorConfiguration } from "../../../interfaces/Colors";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IGdcConfig,
    IReferencePoint,
    IReferences,
    IUiConfig,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    PluggableVisualizationErrorCodes,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getFilteredMeasuresForStackedCharts,
    getMeasureItems,
    getStackItems,
    isDateBucketItem,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import { getValidProperties } from "../../../utils/colors";
import { generateDimensions } from "../../../utils/dimensions";
import { unmountComponentsAtNodes } from "../../../utils/domHelper";
import {
    getHighchartsAxisNameConfiguration,
    getReferencePointWithSupportedProperties,
    getSupportedPropertiesControls,
    hasColorMapping,
    isEmptyObject,
} from "../../../utils/propertiesHelper";
import { createSorts, removeSort } from "../../../utils/sort";
import { getTranslation } from "../../../utils/translations";

import {
    setBaseChartUiConfig,
    setBaseChartUiConfigRecommendations,
} from "../../../utils/uiConfigHelpers/baseChartUiConfigHelper";
import { isOpenAsReportSupportedByVisualization } from "../../../utils/visualizationsHelper";

import BaseChartConfigurationPanel from "../../configurationPanels/BaseChartConfigurationPanel";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import isEmpty = require("lodash/isEmpty");
import noop = require("lodash/noop");
import set = require("lodash/set");
import tail = require("lodash/tail");

export class PluggableBaseChart extends AbstractPluggableVisualization {
    protected projectId: string;
    protected type: ChartType;
    protected featureFlags: ISettings;
    protected isError: boolean;
    protected isLoading: boolean;
    protected defaultControlsProperties: IVisualizationProperties;
    protected customControlsProperties: IVisualizationProperties;
    protected insight: IInsight;
    protected colors: IColorConfiguration;
    protected references: IReferences;
    protected ignoreUndoRedo: boolean;
    protected axis: string;
    protected secondaryAxis: AxisType;
    protected environment: string;
    private readonly renderFun: (component: any, target: Element) => void;

    constructor(props: IVisConstruct) {
        super(props);

        this.projectId = props.projectId;
        this.environment = props.environment;
        this.type = VisualizationTypes.COLUMN;
        this.featureFlags = props.featureFlags ? props.featureFlags : {};
        this.onError = props.callbacks.onError && this.onError.bind(this);
        this.onExportReady = props.callbacks.onExportReady && this.onExportReady.bind(this);
        this.onLoadingChanged = props.callbacks.onLoadingChanged && this.onLoadingChanged.bind(this);
        this.isError = false;
        this.isLoading = false;
        this.ignoreUndoRedo = false;
        this.defaultControlsProperties = {};
        this.setCustomControlsProperties({});
        this.renderFun = props.renderFun;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public unmount() {
        unmountComponentsAtNodes([this.element, this.configPanelElement]);
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
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = setBaseChartUiConfigRecommendations(newReferencePoint, this.type);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = setBaseChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public isOpenAsReportSupported() {
        return isOpenAsReportSupportedByVisualization(this.type);
    }

    public setCustomControlsProperties(customControlsProperties: IVisualizationProperties) {
        this.customControlsProperties = customControlsProperties;
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const buckets: IBucketOfFun[] = get(extendedReferencePoint, BUCKETS, []);
        const categoriesCount: number = get(
            extendedReferencePoint,
            [UICONFIG, BUCKETS, BucketNames.VIEW, "itemsLimit"],
            MAX_CATEGORIES_COUNT,
        );
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

    protected getSupportedPropertiesList() {
        return BASE_CHART_SUPPORTED_PROPERTIES;
    }

    protected getStackItems(buckets: IBucketOfFun[]): IBucketItem[] {
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);

        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.STACK,
            BucketNames.SEGMENT,
        ]);
        let stacks = getStackItems(buckets);

        if (masterMeasures.length <= 1 && allAttributes.length > 1) {
            // first attribute is taken, find next available non-date attribute
            const attributesWithoutFirst = tail(allAttributes);
            const nonDate = attributesWithoutFirst.filter(attribute => !isDateBucketItem(attribute));
            stacks = nonDate.slice(0, 1);
        }

        return stacks;
    }

    protected updateInstanceProperties(options: IVisProps, insight: IInsight) {
        super.updateInstanceProperties(options, insight);

        this.insight = insight;
    }

    protected checkBeforeRender(insight: IInsight): boolean {
        super.checkBeforeRender(insight);

        if (!insightHasMeasures(insight)) {
            throw new GoodDataSdkError(PluggableVisualizationErrorCodes.INVALID_BUCKETS);
        }

        return true;
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsight,
        executionFactory: IExecutionFactory,
    ) {
        if (!insightHasDataDefined(insight)) {
            // there is nothing in the insight's bucket that can be visualized
            // bail out
            return;
        }

        const { dimensions = { height: undefined }, custom = {}, locale, config } = options;
        const { height } = dimensions;

        // keep height undef for AD; causes indigo-visualizations to pick default 100%
        const resultingHeight = this.environment === DASHBOARDS_ENVIRONMENT ? height : undefined;
        const afterRender = get(this.callbacks, "afterRender", noop);
        const onDrill = get(this.callbacks, "onDrill", noop);
        const { drillableItems } = custom;
        const supportedControls: IVisualizationProperties = this.getSupportedControls(insight);
        const configSupportedControls = isEmpty(supportedControls) ? null : supportedControls;
        const fullConfig = this.buildVisualizationConfig(config, configSupportedControls);

        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(
                ...createSorts(this.type, insight, canSortStackTotalValue(insight, supportedControls)),
            );

        this.renderFun(
            <BaseChart
                execution={execution}
                afterRender={afterRender}
                drillableItems={drillableItems}
                onDrill={onDrill}
                onError={this.onError}
                onExportReady={this.onExportReady}
                onLoadingChanged={this.onLoadingChanged}
                pushData={this.handlePushData}
                height={resultingHeight}
                type={this.type}
                locale={locale}
                config={fullConfig}
                LoadingComponent={null}
                ErrorComponent={null}
            />,
            document.querySelector(this.element),
        );
    }

    protected initializeProperties(visualizationProperties: IVisualizationProperties) {
        const controls = get(visualizationProperties, "properties.controls");

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: { controls: supportedProperties },
        };

        this.callbacks.pushData({
            initialProperties,
        });
    }

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <BaseChartConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={this.insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.isError}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    protected getDimensions(insight: IInsight): IDimension[] {
        return generateDimensions(insight, this.type);
    }

    protected handleConfirmedColorMapping(data: any) {
        const { pushData = noop } = this.callbacks;
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

        this.renderConfigurationPanel();

        const openAsReportConfig = this.getOpenAsReportConfig(resultingData.properties);

        if (this.ignoreUndoRedo) {
            this.ignoreUndoRedo = false;
            pushData(resultingData);
        } else {
            pushData({
                openAsReport: openAsReportConfig,
                ignoreUndoRedo: true,
                ...resultingData,
            });
        }
    }

    protected handlePushData = (data: any) => {
        const { pushData = noop } = this.callbacks;

        const resultingData = data;
        if (data.colors) {
            this.handleConfirmedColorMapping(data);
        } else {
            pushData({
                ...resultingData,
                references: this.references,
            });
        }
    };

    protected buildVisualizationConfig(
        config: IGdcConfig,
        supportedControls: IVisualizationProperties,
    ): IChartConfig {
        const colorMapping: IColorMappingItem[] = get(supportedControls, "colorMapping");

        const validColorMapping =
            colorMapping &&
            colorMapping
                .filter(mapping => mapping != null)
                .map(mapItem => ({
                    predicate: ColorUtils.getColorMappingPredicate(mapItem.id),
                    color: mapItem.color,
                }));

        return {
            ...config,
            ...supportedControls,
            colorMapping: validColorMapping && validColorMapping.length > 0 ? validColorMapping : null,
        };
    }

    private getOpenAsReportConfig(properties: IVisualizationProperties) {
        const hasMapping = hasColorMapping(properties);
        const isSupported = this.isOpenAsReportSupported();

        const warningMessage = hasMapping ? getTranslation("export_unsupported.colors", this.intl) : "";

        return {
            supported: isSupported && !hasMapping,
            warningMessage,
        };
    }

    private onError(error: GoodDataSdkError) {
        const onError = get(this.callbacks, "onError");

        if (onError) {
            onError(error);
            this.isError = true;
            this.renderConfigurationPanel();
        }
    }

    private getSupportedControls(insight: IInsight) {
        let supportedControls = cloneDeep(get(this.visualizationProperties, "controls", {}));
        const defaultControls = getSupportedPropertiesControls(
            this.defaultControlsProperties,
            this.supportedPropertiesList,
        );
        const customControls = getSupportedPropertiesControls(
            this.customControlsProperties,
            this.supportedPropertiesList,
        );

        const legendPosition = this.getLegendPosition(supportedControls, insight);

        // Set legend position by bucket items and environment
        set(supportedControls, "legend.position", legendPosition);
        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            set(supportedControls, "legend.responsive", true);
        }

        supportedControls = getHighchartsAxisNameConfiguration(
            supportedControls,
            this.featureFlags[SettingCatalog.enableAxisNameConfiguration] as boolean,
        );

        return {
            ...defaultControls,
            ...supportedControls,
            ...customControls,
        };
    }

    private onExportReady(exportResult: IExportFunction) {
        const { onExportReady } = this.callbacks;
        if (onExportReady) {
            onExportReady(exportResult);
        }
    }

    private onLoadingChanged(loadingState: ILoadingState) {
        const onLoadingChanged = get(this.callbacks, "onLoadingChanged");

        if (onLoadingChanged) {
            onLoadingChanged(loadingState);
            this.isError = false;
            this.isLoading = loadingState.isLoading;
            this.renderConfigurationPanel();
        }
    }

    private getLegendPosition(controlProperties: IVisualizationProperties, insight: IInsight) {
        const legendPosition = get(controlProperties, "legend.position", "auto");

        if (legendPosition === "auto") {
            // Legend has right position always on dashboards or if report is stacked
            if (this.type === "heatmap") {
                return this.environment === DASHBOARDS_ENVIRONMENT ? "right" : "top";
            }
            return isStacked(insight) || this.environment === DASHBOARDS_ENVIRONMENT ? "right" : "auto";
        }

        return legendPosition;
    }
}

function isStacked(insight: IInsight): boolean {
    return !bucketsIsEmpty(insightBuckets(insight, BucketNames.STACK, BucketNames.SEGMENT));
}

function areAllMeasuresOnSingleAxis(insight: IInsight, secondaryYAxis: IAxisConfig): boolean {
    const measureCount = insightMeasures(insight).length;
    const numberOfMeasureOnSecondaryAxis = secondaryYAxis.measures?.length ?? 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

function canSortStackTotalValue(insight: IInsight, supportedControls: IVisualizationProperties): boolean {
    const stackMeasures = get(supportedControls, "stackMeasures", false);
    const secondaryAxis: IAxisConfig = get(supportedControls, "secondary_yaxis", { measures: [] });
    const allMeasuresOnSingleAxis = areAllMeasuresOnSingleAxis(insight, secondaryAxis);

    return stackMeasures && allMeasuresOnSingleAxis;
}
