// (C) 2019 GoodData Corporation
import * as React from "react";
import { InjectedIntl } from "react-intl";
import { render, unmountComponentAtNode } from "react-dom";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IFeatureFlags,
    IReferencePoint,
    IReferences,
    IUiConfig,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";
import { IColorConfiguration } from "../../../interfaces/Colors";
import {
    getReferencePointWithSupportedProperties,
    getSupportedProperties,
    getSupportedPropertiesControls,
    hasColorMapping,
    isEmptyObject,
} from "../../../utils/propertiesHelper";
import { DEFAULT_BASE_CHART_UICONFIG, MAX_CATEGORIES_COUNT, UICONFIG } from "../../../constants/uiConfig";
import { BASE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";

import { BUCKETS } from "../../../constants/bucket";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getFilteredMeasuresForStackedCharts,
    getMeasureItems,
    getStackItems,
    isDate,
    sanitizeUnusedFilters,
} from "../../../utils/bucketHelper";

import {
    setBaseChartUiConfig,
    setBaseChartUiConfigRecommendations,
} from "../../../utils/uiConfigHelpers/baseChartUiConfigHelper";
import { createInternalIntl } from "../../../utils/internalIntlProvider";
import { createSorts, removeSort } from "../../../utils/sort";

import { BaseChart } from "../../../../charts/_base/BaseChart";
import BaseChartConfigurationPanel from "../../configurationPanels/BaseChartConfigurationPanel";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import { getValidProperties } from "../../../utils/colors";
import { COLOR_MAPPING_CHANGED } from "../../configurationControls/colors/ColorsSection";
import { isOpenAsReportSupportedByVisualization } from "../../../utils/visualizationsHelper";
import { getTranslation } from "../../../utils/translations";
import { AxisType } from "../../../interfaces/AxisType";
import { ChartType, VisualizationTypes } from "../../../../base/constants/visualizationTypes";
import { generateDimensions } from "../../../../base/helpers/dimensions";
import * as BucketNames from "../../../../base/constants/bucketNames";
import { RuntimeError } from "../../../../base/errors/RuntimeError";
import * as VisEvents from "../../../../base/interfaces/Events";
import { DEFAULT_LOCALE } from "../../../../base/constants/localization";
import {
    bucketsIsEmpty,
    IColorMappingItem,
    IDimension,
    IInsight,
    insightBuckets,
    insightHasDataDefined,
    insightProperties,
} from "@gooddata/sdk-model";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { IChartConfig, ColorUtils } from "../../../../highcharts";
import isEmpty = require("lodash/isEmpty");
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import noop = require("lodash/noop");
import tail = require("lodash/tail");
import set = require("lodash/set");
import { ILocale } from "../../../../base/interfaces/Locale";

export class PluggableBaseChart extends AbstractPluggableVisualization {
    protected projectId: string;
    protected callbacks: IVisCallbacks;
    protected type: ChartType;
    protected intl: InjectedIntl;
    protected featureFlags: IFeatureFlags;
    protected isError: boolean;
    protected isLoading: boolean;
    protected options: IVisProps;
    protected visualizationProperties: IVisualizationProperties;
    protected defaultControlsProperties: IVisualizationProperties;
    protected customControlsProperties: IVisualizationProperties;
    protected propertiesMeta: any;
    protected insight: IInsight;
    protected supportedPropertiesList: string[];
    protected configPanelElement: string;
    protected colors: IColorConfiguration;
    protected references: IReferences;
    protected ignoreUndoRedo: boolean;
    protected axis: string;
    protected secondaryAxis: AxisType;
    protected locale: ILocale;
    private environment: string;
    private element: string;

    constructor(props: IVisConstruct) {
        super();
        this.projectId = props.projectId;
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
        this.environment = props.environment;
        this.callbacks = props.callbacks;
        this.type = VisualizationTypes.COLUMN;
        this.locale = props.locale ? props.locale : DEFAULT_LOCALE;
        this.intl = createInternalIntl(this.locale);
        this.featureFlags = props.featureFlags ? props.featureFlags : {};
        this.onError = props.callbacks.onError && this.onError.bind(this);
        this.onExportReady = props.callbacks.onExportReady && this.onExportReady.bind(this);
        this.onLoadingChanged = props.callbacks.onLoadingChanged && this.onLoadingChanged.bind(this);
        this.isError = false;
        this.isLoading = false;
        this.ignoreUndoRedo = false;
        this.defaultControlsProperties = {};
        this.setCustomControlsProperties({});

        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public unmount() {
        unmountComponentAtNode(document.querySelector(this.element));
        if (document.querySelector(this.configPanelElement)) {
            unmountComponentAtNode(document.querySelector(this.configPanelElement));
        }
    }

    public update(options: IVisProps, insight: IInsight, executionFactory: IExecutionFactory) {
        const visualizationProperties = insightProperties(insight);
        this.options = options;
        this.visualizationProperties = getSupportedProperties(
            visualizationProperties,
            this.supportedPropertiesList,
        );
        this.propertiesMeta = get(visualizationProperties, "propertiesMeta", null);
        this.insight = insight;

        this.renderVisualization(this.options, this.insight, executionFactory);
        this.renderConfigurationPanel();
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

        return Promise.resolve(sanitizeUnusedFilters(newReferencePoint, clonedReferencePoint));
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
            const nonDate = attributesWithoutFirst.filter(attribute => !isDate(attribute));
            stacks = nonDate.slice(0, 1);
        }

        return stacks;
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

        const { dimensions, custom, locale, config } = options;
        const { height } = dimensions;

        // keep height undef for AD; causes indigo-visualizations to pick default 100%
        const resultingHeight = this.environment === "dashboards" ? height : undefined;
        const afterRender = get(this.callbacks, "afterRender", noop);
        const onDrill = get(this.callbacks, "onDrill", noop);
        const { drillableItems } = custom;
        const supportedControls = this.getSupportedControls(insight);
        const configSupportedControls = isEmpty(supportedControls) ? null : supportedControls;
        const fullConfig = this.buildVisualizationConfig(config, configSupportedControls);

        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getDimensions(insight))
            .withSorting(...createSorts(this.type, insight));

        render(
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

    protected colorMappingChanged(data: any) {
        this.visualizationProperties = {
            ...this.visualizationProperties,
            ...data.properties,
        };
        this.references = isEmptyObject(data.references)
            ? {}
            : {
                  ...this.references,
                  ...data.references,
              };
        this.ignoreUndoRedo = true;

        // TODO: SDK8: this is weird; push data callback triggers this call;
        //  why should plug viz bother with this? seems more like responsibility of the PV client
        /*
        this.update(
            this.options,
            {
                properties: this.visualizationProperties,
                propertiesMeta: this.propertiesMeta,
            },
            this.insight,
            __execution__factory__ WTF?
        );*/
    }

    protected handleConfirmedColorMapping(data: any) {
        const pushData: any = get(this.callbacks, "pushData", noop);
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
        const pushData = get(this.callbacks, "pushData", noop) as any;

        const resultingData = data;
        if (data.messageId === COLOR_MAPPING_CHANGED) {
            this.colorMappingChanged(data);
        } else if (data.colors) {
            this.handleConfirmedColorMapping(data);
        } else {
            pushData({
                ...resultingData,
                references: this.references,
            });
        }
    };

    private getOpenAsReportConfig(properties: IVisualizationProperties) {
        const hasMapping = hasColorMapping(properties);
        const isSupported = this.isOpenAsReportSupported();

        const warningMessage = hasMapping ? getTranslation("export_unsupported.colors", this.intl) : "";

        return {
            supported: isSupported && !hasMapping,
            warningMessage,
        };
    }

    private onError(error: RuntimeError) {
        const onError = get(this.callbacks, "onError");

        if (onError) {
            onError(error);
            this.isError = true;
            this.renderConfigurationPanel();
        }
    }

    private getSupportedControls(insight: IInsight) {
        const supportedControls = cloneDeep(get(this.visualizationProperties, "controls", {}));
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
        if (this.environment === "dashboards") {
            set(supportedControls, "legend.responsive", true);
        }

        return {
            ...defaultControls,
            ...supportedControls,
            ...customControls,
        };
    }

    private onExportReady(exportResult: VisEvents.IExportFunction) {
        const { onExportReady } = this.callbacks;
        if (onExportReady) {
            onExportReady(exportResult);
        }
    }

    private onLoadingChanged(loadingState: VisEvents.ILoadingState) {
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
                return this.environment === "dashboards" ? "right" : "top";
            }
            return isStacked(insight) || this.environment === "dashboards" ? "right" : "auto";
        }

        return legendPosition;
    }

    private buildVisualizationConfig(config: any, supportedControls: any): IChartConfig {
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
}

function isStacked(insight: IInsight): boolean {
    return !bucketsIsEmpty(insightBuckets(insight, BucketNames.STACK, BucketNames.SEGMENT));
}
