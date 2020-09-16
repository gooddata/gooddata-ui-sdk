// (C) 2019 GoodData Corporation
import { IExecutionFactory, ISettings, SettingCatalog } from "@gooddata/sdk-backend-spi";
import {
    bucketsIsEmpty,
    IColorMappingItem,
    IDimension,
    IInsight,
    IInsightDefinition,
    insightBuckets,
    insightHasMeasures,
    insightMeasures,
} from "@gooddata/sdk-model";
import { BucketNames, ChartType, GoodDataSdkError, VisualizationTypes } from "@gooddata/sdk-ui";
import { BaseChart, ColorUtils, IAxisConfig, IChartConfig } from "@gooddata/sdk-ui-charts";
import React from "react";
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
    IReferencePoint,
    IReferences,
    IUiConfig,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    PluggableVisualizationErrorCodes,
    IDrillDownContext,
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
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import set from "lodash/set";
import tail from "lodash/tail";
import { modifyBucketsAttributesForDrillDown, addIntersectionFiltersToInsight } from "../drillDownUtil";

export class PluggableBaseChart extends AbstractPluggableVisualization {
    protected projectId: string;
    protected type: ChartType;
    protected featureFlags: ISettings;
    protected defaultControlsProperties: IVisualizationProperties;
    protected customControlsProperties: IVisualizationProperties;
    protected colors: IColorConfiguration;
    protected references: IReferences;
    protected ignoreUndoRedo: boolean;
    protected axis: string;
    protected secondaryAxis: AxisType;
    protected environment: string;
    protected readonly renderFun: (component: any, target: Element) => void;

    constructor(props: IVisConstruct) {
        super(props);

        this.projectId = props.projectId;
        this.environment = props.environment;
        this.type = VisualizationTypes.COLUMN;
        this.featureFlags = props.featureFlags ? props.featureFlags : {};
        this.ignoreUndoRedo = false;
        this.defaultControlsProperties = {};
        this.setCustomControlsProperties({});
        this.renderFun = props.renderFun;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public unmount(): void {
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
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags[SettingCatalog.enableWeekFilters],
        );
        newReferencePoint = setBaseChartUiConfigRecommendations(
            newReferencePoint,
            this.type,
            !!this.featureFlags[SettingCatalog.enableWeekFilters],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = setBaseChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const intersection = drillDownContext.event.drillContext.intersection;
        const withFilters = addIntersectionFiltersToInsight(source, intersection);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public isOpenAsReportSupported(): boolean {
        return isOpenAsReportSupportedByVisualization(this.type);
    }

    public setCustomControlsProperties(customControlsProperties: IVisualizationProperties): void {
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
            const nonDate = attributesWithoutFirst.filter((attribute) => !isDateBucketItem(attribute));
            stacks = nonDate.slice(0, 1);
        }

        return stacks;
    }

    protected checkBeforeRender(insight: IInsightDefinition): boolean {
        super.checkBeforeRender(insight);

        if (!insightHasMeasures(insight)) {
            throw new GoodDataSdkError(PluggableVisualizationErrorCodes.INVALID_BUCKETS);
        }

        return true;
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { dimensions = { height: undefined }, custom = {}, locale } = options;
        const { height } = dimensions;

        // keep height undef for AD; causes indigo-visualizations to pick default 100%
        const resultingHeight = this.environment === DASHBOARDS_ENVIRONMENT ? height : undefined;
        const { drillableItems } = custom;
        const supportedControls: IVisualizationProperties = this.getSupportedControls(insight, options);
        const configSupportedControls = isEmpty(supportedControls) ? null : supportedControls;
        const fullConfig = this.buildVisualizationConfig(options, configSupportedControls);

        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(
                ...createSorts(this.type, insight, canSortStackTotalValue(insight, supportedControls)),
            );

        this.renderFun(
            <BaseChart
                execution={execution}
                afterRender={this.afterRender}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
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

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            render(
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
                />,
                document.querySelector(this.configPanelElement),
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

        this.renderConfigurationPanel(this.currentInsight);

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
        const resultingData = data;
        if (data.colors) {
            this.handleConfirmedColorMapping(data);
        } else {
            this.pushData({
                ...resultingData,
                references: this.references,
            });
        }
    };

    protected buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IChartConfig {
        const { config = {}, customVisualizationConfig = {} } = options;
        const colorMapping: IColorMappingItem[] = get(supportedControls, "colorMapping");

        const validColorMapping =
            colorMapping &&
            colorMapping
                .filter((mapping) => mapping != null)
                .map((mapItem) => ({
                    predicate: ColorUtils.getColorMappingPredicate(mapItem.id),
                    color: mapItem.color,
                }));

        return {
            separators: config.separators,
            colorPalette: config.colorPalette,
            forceDisableDrillOnAxes: config.forceDisableDrillOnAxes,
            ...supportedControls,
            colorMapping: validColorMapping && validColorMapping.length > 0 ? validColorMapping : null,
            ...customVisualizationConfig,
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

    private getSupportedControls(insight: IInsightDefinition, options: IVisProps) {
        let supportedControls = cloneDeep(get(this.visualizationProperties, "controls", {}));
        const defaultControls = getSupportedPropertiesControls(
            this.defaultControlsProperties,
            this.supportedPropertiesList,
        );
        const customControls = getSupportedPropertiesControls(
            this.customControlsProperties,
            this.supportedPropertiesList,
        );

        const legendPosition = this.getLegendPosition(supportedControls, insight, options);

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

    private getLegendPosition(
        controlProperties: IVisualizationProperties,
        insight: IInsightDefinition,
        options: IVisProps,
    ) {
        const legendPosition = get(controlProperties, "legend.position", "auto");

        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            const width = options.dimensions?.width ?? 0;
            return width <= getMaxWidthForCollapsedLegend(legendPosition) ? "top" : legendPosition;
        }

        return legendPosition === "auto" && isStacked(insight) ? "right" : legendPosition;
    }
}

function isStacked(insight: IInsightDefinition): boolean {
    return !bucketsIsEmpty(insightBuckets(insight, BucketNames.STACK, BucketNames.SEGMENT));
}

function areAllMeasuresOnSingleAxis(insight: IInsightDefinition, secondaryYAxis: IAxisConfig): boolean {
    const measureCount = insightMeasures(insight).length;
    const numberOfMeasureOnSecondaryAxis = secondaryYAxis.measures?.length ?? 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

function canSortStackTotalValue(
    insight: IInsightDefinition,
    supportedControls: IVisualizationProperties,
): boolean {
    const stackMeasures = get(supportedControls, "stackMeasures", false);
    const secondaryAxis: IAxisConfig = get(supportedControls, "secondary_yaxis", { measures: [] });
    const allMeasuresOnSingleAxis = areAllMeasuresOnSingleAxis(insight, secondaryAxis);

    return stackMeasures && allMeasuresOnSingleAxis;
}

const MAX_WIDTH_FOR_COLLAPSED_LEGEND = 440;
const MAX_WIDTH_FOR_COLLAPSED_AUTO_LEGEND = 610;

function getMaxWidthForCollapsedLegend(legendPosition: string): number {
    return legendPosition === "auto" ? MAX_WIDTH_FOR_COLLAPSED_AUTO_LEGEND : MAX_WIDTH_FOR_COLLAPSED_LEGEND;
}
