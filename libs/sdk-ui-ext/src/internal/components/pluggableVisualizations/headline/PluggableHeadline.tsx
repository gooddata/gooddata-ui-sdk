// (C) 2019-2022 GoodData Corporation

import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    bucketIsEmpty,
    IInsightDefinition,
    insightBucket,
    insightHasDataDefined,
    MeasureGroupIdentifier,
    newDimension,
    ISettings,
} from "@gooddata/sdk-model";

import { BucketNames } from "@gooddata/sdk-ui";
import { CoreHeadline, updateConfigWithSettings } from "@gooddata/sdk-ui-charts";
import React from "react";
import { METRIC } from "../../../constants/bucket.js";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    InvalidBucketsSdkError,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    RenderFunction,
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
import { unmountComponentsAtNodes } from "../../../utils/domHelper.js";
import {
    getReferencePointWithSupportedProperties,
    getSupportedProperties,
} from "../../../utils/propertiesHelper.js";
import { removeSort } from "../../../utils/sort.js";
import {
    getDefaultHeadlineUiConfig,
    getHeadlineUiConfig,
} from "../../../utils/uiConfigHelpers/headlineUiConfigHelper.js";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";
import {
    findComplementaryOverTimeComparisonMeasure,
    findSecondMasterMeasure,
    setHeadlineRefPointBuckets,
    tryToMapForeignBuckets,
} from "./headlineBucketHelper.js";
import cloneDeep from "lodash/cloneDeep.js";

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
 * - |MeasureSecondary| ≤ 1
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

    constructor(props: IVisConstruct) {
        super(props);

        this.settings = props.featureFlags;
        this.renderFun = props.renderFun;
    }

    public unmount(): void {
        unmountComponentsAtNodes([this.getElement(), this.getConfigPanelElement()]);
    }

    public getExtendedReferencePoint(
        referencePoint: Readonly<IReferencePoint>,
    ): Promise<IExtendedReferencePoint> {
        const referencePointCloned = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...referencePointCloned,
            uiConfig: getDefaultHeadlineUiConfig(),
        };

        if (!hasGlobalDateFilter(referencePoint.filters)) {
            newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
            newReferencePoint = removeAllDerivedMeasures(newReferencePoint);
        }

        const mappedReferencePoint = tryToMapForeignBuckets(newReferencePoint);

        if (mappedReferencePoint) {
            newReferencePoint = mappedReferencePoint;
        } else {
            const limitedBuckets = limitNumberOfMeasuresInBuckets(newReferencePoint.buckets, 2, true);
            const allMeasures = getAllItemsByType(limitedBuckets, [METRIC]);
            const primaryMeasure = allMeasures.length > 0 ? allMeasures[0] : null;
            const secondaryMeasure =
                findComplementaryOverTimeComparisonMeasure(primaryMeasure, allMeasures) ||
                findSecondMasterMeasure(allMeasures);

            newReferencePoint = setHeadlineRefPointBuckets(
                newReferencePoint,
                primaryMeasure,
                secondaryMeasure,
            );
        }

        configurePercent(newReferencePoint, true);

        configureOverTimeComparison(newReferencePoint, !!this.settings?.["enableWeekFilters"]);

        newReferencePoint.uiConfig = getHeadlineUiConfig(newReferencePoint, this.intl);
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

        const { locale, custom = {}, config, customVisualizationConfig } = options;
        const { drillableItems } = custom;
        const execution = this.getExecution(options, insight, executionFactory);

        this.renderFun(
            <CoreHeadline
                execution={execution}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                locale={locale}
                config={updateConfigWithSettings({ ...config, ...customVisualizationConfig }, this.settings)}
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

    protected renderConfigurationPanel(): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const properties = this.visualizationProperties ?? {};

            this.renderFun(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={getSupportedProperties(properties, this.supportedPropertiesList)}
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
}
