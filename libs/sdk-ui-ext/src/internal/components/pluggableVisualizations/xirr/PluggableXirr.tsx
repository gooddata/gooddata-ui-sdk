// (C) 2019-2022 GoodData Corporation

import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    bucketAttributes,
    IDimension,
    IInsightDefinition,
    insightBucket,
    MeasureGroupIdentifier,
    newDimension,
    ISettings,
} from "@gooddata/sdk-model";
import { BucketNames, IPushData } from "@gooddata/sdk-ui";

import { CoreXirr, updateConfigWithSettings } from "@gooddata/sdk-ui-charts";
import React from "react";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationOptions,
    RenderFunction,
} from "../../../interfaces/Visualization.js";
import {
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
    getDefaultXirrUiConfig,
    getXirrUiConfig,
} from "../../../utils/uiConfigHelpers/xirrUiConfigHelper.js";

import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";
import { getXirrBuckets } from "./xirrBucketHelper.js";
import cloneDeep from "lodash/cloneDeep.js";

/**
 * PluggableXirr
 *
 * ## Buckets
 *
 * | Name           | Id        | Accepts       |
 * |----------------|-----------|---------------|
 * | Measure        | measures  | measures only |
 * | Date Attribute | attribute | dates only    |
 *
 * ### Bucket axioms
 *
 * - |Measure| = 1
 * - |DateAttribute| = 1
 *
 * ## Dimensions
 *
 * The PluggableXirr always creates one dimensional execution.
 *
 * - ⊤ ⇒ [[MeasureGroupIdentifier, DateAttribute]]
 *
 * ## Sorts
 *
 * The PluggableXirr does not use any sorts.
 */
export class PluggableXirr extends AbstractPluggableVisualization {
    private settings?: ISettings;
    private renderFun: RenderFunction;

    constructor(props: IVisConstruct) {
        super(props);

        this.settings = props.featureFlags;
        this.renderFun = props.renderFun;
    }

    public unmount(): void {
        unmountComponentsAtNodes([this.getElement(), this.getConfigPanelElement()]);
    }

    public getExtendedReferencePoint = async (
        referencePoint: Readonly<IReferencePoint>,
    ): Promise<IExtendedReferencePoint> => {
        const referencePointCloned = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...referencePointCloned,
            uiConfig: getDefaultXirrUiConfig(),
        };

        if (!hasGlobalDateFilter(referencePoint.filters)) {
            newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
            newReferencePoint = removeAllDerivedMeasures(newReferencePoint);
        }

        const buckets = getXirrBuckets(referencePoint);
        newReferencePoint.buckets = buckets;

        newReferencePoint.uiConfig = getXirrUiConfig(newReferencePoint, this.intl);

        newReferencePoint = removeSort(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );

        return sanitizeFilters(newReferencePoint);
    };

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat } = options;

        return executionFactory
            .forInsight(insight)
            .withDimensions(...this.getXirrDimensions(insight))
            .withDateFormat(dateFormat);
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { locale, custom = {}, config } = options;
        const { drillableItems } = custom;
        const execution = this.getExecution(options, insight, executionFactory);

        this.renderFun(
            <CoreXirr
                execution={execution}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                locale={locale}
                config={updateConfigWithSettings(config, this.settings)}
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

    private getXirrDimensions(insight: IInsightDefinition): IDimension[] {
        const attributeBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
        const attributes = attributeBucket ? bucketAttributes(attributeBucket) : [];

        return [newDimension([MeasureGroupIdentifier, ...attributes])];
    }

    private withEmptyAttributeTargets(data: IPushData): IPushData {
        return {
            ...data,
            availableDrillTargets: {
                ...data?.availableDrillTargets,
                attributes: [],
            },
        };
    }

    // This is effectively calling super.pushData()
    // https://stackoverflow.com/questions/31088947/inheritance-method-call-triggers-typescript-compiler-error
    // https://github.com/basarat/typescript-book/blob/master/docs/arrow-functions.md#tip-arrow-functions-and-inheritance
    private superPushData = this.pushData;

    protected pushData = (data: IPushData, options?: IVisualizationOptions): void => {
        // For xirr chart we do not support drilling from attributes.
        const filterAttributes = this.withEmptyAttributeTargets(data);
        this.superPushData(filterAttributes, options);
    };
}
