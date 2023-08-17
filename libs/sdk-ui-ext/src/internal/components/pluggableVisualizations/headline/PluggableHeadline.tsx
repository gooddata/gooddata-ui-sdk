// (C) 2019-2022 GoodData Corporation
import React from "react";
import cloneDeep from "lodash/cloneDeep.js";

import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    bucketIsEmpty,
    IInsightDefinition,
    insightBucket,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    insightSorts,
    ISettings,
    MeasureGroupIdentifier,
    newDimension,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { CoreHeadline, createHeadlineProvider } from "@gooddata/sdk-ui-charts";

import { METRIC } from "../../../constants/bucket.js";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    InvalidBucketsSdkError,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    RenderFunction,
    UnmountFunction,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    findDerivedBucketItem,
    getAllItemsByType,
    hasDerivedBucketItems,
    isDerivedBucketItem,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { hasGlobalDateFilter } from "../../../utils/bucketRules.js";
import {
    getReferencePointWithSupportedProperties,
    getSupportedPropertiesControls,
} from "../../../utils/propertiesHelper.js";
import { removeSort } from "../../../utils/sort.js";
import {
    buildHeadlineVisualizationConfig,
    getDefaultComparisonProperties,
    getDefaultHeadlineUiConfig,
    getHeadlineSupportedProperties,
    getHeadlineUiConfig,
} from "../../../utils/uiConfigHelpers/headlineUiConfigHelper.js";
import HeadlineConfigurationPanel from "../../configurationPanels/HeadlineConfigurationPanel.js";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";
import { setHeadlineRefPointBuckets, tryToMapForeignBuckets } from "./headlineBucketHelper.js";
import { HEADLINE_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";

/**
 * PluggableHeadline
 *
 * ## Buckets
 *
 * | Name             | Id                 | Accepts       |
 * |------------------|--------------------|---------------|
 * | MeasurePrimary   | measures           | measures only |
 * | MeasureSecondary | secondary_measures | measures only |
 *
 * ### Bucket axioms
 *
 * - |MeasurePrimary| = 1
 * - |MeasureSecondary| ≤ 2
 *
 * ## Dimensions
 *
 * The PluggableHeadline always creates one dimensional execution.
 *
 * - ⊤ ⇒ [[MeasureGroupIdentifier]]
 *
 * ## Sorts
 *
 * The PluggableHeadline does not use any sorts.
 */
export class PluggableHeadline extends AbstractPluggableVisualization {
    private readonly settings?: ISettings;
    private readonly renderFun: RenderFunction;
    private readonly unmountFun: UnmountFunction;

    constructor(props: IVisConstruct) {
        super(props);

        this.settings = props.featureFlags;
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;

        this.supportedPropertiesList = HEADLINE_SUPPORTED_PROPERTIES;
        if (props.featureFlags?.enableNewHeadline) {
            this.initializeProperties(props.visualizationProperties);
        }
    }

    public unmount(): void {
        this.unmountFun([this.getElement(), this.getConfigPanelElement()]);
    }

    public getExtendedReferencePoint(
        referencePoint: Readonly<IReferencePoint>,
    ): Promise<IExtendedReferencePoint> {
        const referencePointCloned = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...referencePointCloned,
            uiConfig: getDefaultHeadlineUiConfig(this.settings),
        };

        if (!hasGlobalDateFilter(referencePoint.filters)) {
            newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
            newReferencePoint = removeAllDerivedMeasures(newReferencePoint);
        }

        const mappedReferencePoint = tryToMapForeignBuckets(newReferencePoint);

        if (mappedReferencePoint) {
            newReferencePoint = mappedReferencePoint;
        } else {
            const numberOfSecondaryMeasure =
                newReferencePoint.uiConfig.buckets[BucketNames.SECONDARY_MEASURES].itemsLimit;
            const limitedBuckets = limitNumberOfMeasuresInBuckets(
                newReferencePoint.buckets,
                numberOfSecondaryMeasure + 1,
                true,
            );
            const allMeasures = getAllItemsByType(limitedBuckets, [METRIC]);
            const primaryMeasure = allMeasures.length > 0 ? allMeasures[0] : null;
            const secondaryMeasure =
                allMeasures.length > 1 ? allMeasures.slice(1, numberOfSecondaryMeasure + 1) : null;

            newReferencePoint = setHeadlineRefPointBuckets(
                newReferencePoint,
                primaryMeasure,
                secondaryMeasure,
            );
        }

        configurePercent(newReferencePoint, true);

        configureOverTimeComparison(newReferencePoint, !!this.settings?.["enableWeekFilters"]);

        newReferencePoint.uiConfig = getHeadlineUiConfig(newReferencePoint, this.intl, this.settings);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat, executionConfig } = options;

        return executionFactory
            .forInsight(insight)
            .withDimensions(newDimension([MeasureGroupIdentifier]))
            .withDateFormat(dateFormat)
            .withExecConfig(executionConfig);
    }

    protected checkBeforeRender(insight: IInsightDefinition): boolean {
        super.checkBeforeRender(insight);

        const measureBucket = insightBucket(insight, BucketNames.MEASURES);

        if (!measureBucket || bucketIsEmpty(measureBucket)) {
            // unmount on error because currently AD cannot recover in certain cases (RAIL-2625)
            this.unmount();

            throw new InvalidBucketsSdkError();
        }

        return true;
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        if (!insightHasDataDefined(insight)) {
            return;
        }

        const { visualizationProperties, settings } = this;
        const { locale, custom = {} } = options;
        const { drillableItems } = custom;

        const buckets = [...(insightBuckets(insight) || [])];
        const headlineConfig = buildHeadlineVisualizationConfig(
            insight,
            visualizationProperties,
            settings,
            options,
        );

        const provider = createHeadlineProvider(buckets, headlineConfig, settings?.enableNewHeadline);
        const headlineTransformation = provider.getHeadlineTransformationComponent();
        const execution = provider.createExecution(executionFactory, {
            buckets,
            filters: [...(insightFilters(insight) || [])],
            sortItems: [...(insightSorts(insight) || [])],
            executionConfig: options.executionConfig,
            dateFormat: options.dateFormat,
        });

        this.renderFun(
            <CoreHeadline
                headlineTransformation={headlineTransformation}
                execution={execution}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                locale={locale}
                config={headlineConfig}
                afterRender={this.afterRender}
                onLoadingChanged={this.onLoadingChanged}
                pushData={this.pushData}
                onError={this.onError}
                LoadingComponent={null}
                ErrorComponent={null}
            />,
            this.getElement(),
        );
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        const configPanelElement = this.getConfigPanelElement();
        if (configPanelElement) {
            const ConfigurationPanel = this.settings?.enableNewHeadline
                ? HeadlineConfigurationPanel
                : UnsupportedConfigurationPanel;

            this.renderFun(
                <ConfigurationPanel
                    locale={this.locale}
                    insight={insight}
                    pushData={this.pushData}
                    properties={getHeadlineSupportedProperties(insight, this.visualizationProperties)}
                    propertiesMeta={this.propertiesMeta}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                />,
                configPanelElement,
            );
        }
    }

    protected mergeDerivedBucketItems(
        referencePoint: IReferencePoint,
        bucket: IBucketOfFun,
        newDerivedBucketItems: IBucketItem[],
    ): IBucketItem[] {
        return bucket.items.reduce((resultItems: IBucketItem[], bucketItem: IBucketItem) => {
            const newDerivedBucketItem = findDerivedBucketItem(bucketItem, newDerivedBucketItems);
            const shouldAddItem =
                newDerivedBucketItem &&
                !isDerivedBucketItem(bucketItem) &&
                !hasDerivedBucketItems(bucketItem, referencePoint.buckets);
            const shouldAddAfterMasterItem = bucket.localIdentifier === BucketNames.MEASURES;

            if (shouldAddItem && !shouldAddAfterMasterItem) {
                resultItems.push(newDerivedBucketItem);
            }

            resultItems.push(bucketItem);

            if (shouldAddItem && shouldAddAfterMasterItem) {
                resultItems.push(newDerivedBucketItem);
            }

            return resultItems;
        }, []);
    }

    private initializeProperties(visualizationProperties: IVisualizationProperties): void {
        const controls = visualizationProperties?.controls;

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: {
                controls: {
                    ...supportedProperties,
                    comparison: getDefaultComparisonProperties(),
                },
            },
        };

        this.pushData({
            initialProperties,
        });
    }
}
