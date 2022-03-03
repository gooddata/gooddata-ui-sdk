// (C) 2019-2022 GoodData Corporation

import { IExecutionFactory, ISettings } from "@gooddata/sdk-backend-spi";
import {
    bucketAttributes,
    IDimension,
    IInsightDefinition,
    insightBucket,
    MeasureGroupIdentifier,
    newDimension,
} from "@gooddata/sdk-model";
import { BucketNames, IPushData } from "@gooddata/sdk-ui";

import { CoreXirr, updateConfigWithSettings } from "@gooddata/sdk-ui-charts";
import React from "react";
import { render } from "react-dom";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationOptions,
    RenderFunction,
} from "../../../interfaces/Visualization";
import {
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper";

import { hasGlobalDateFilter } from "../../../utils/bucketRules";
import { unmountComponentsAtNodes } from "../../../utils/domHelper";
import {
    getReferencePointWithSupportedProperties,
    getSupportedProperties,
} from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";
import { getDefaultXirrUiConfig, getXirrUiConfig } from "../../../utils/uiConfigHelpers/xirrUiConfigHelper";

import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import { getXirrBuckets } from "./xirrBucketHelper";
import cloneDeep from "lodash/cloneDeep";

export class PluggableXirr extends AbstractPluggableVisualization {
    private settings?: ISettings;
    private renderFun: RenderFunction;

    constructor(props: IVisConstruct) {
        super(props);

        this.settings = props.featureFlags;
        this.renderFun = props.renderFun;
    }

    public unmount(): void {
        unmountComponentsAtNodes([this.element, this.configPanelElement]);
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
            document.querySelector(this.element),
        );
    }

    protected renderConfigurationPanel(): void {
        if (document.querySelector(this.configPanelElement)) {
            const properties = this.visualizationProperties ?? {};

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={getSupportedProperties(properties, this.supportedPropertiesList)}
                />,
                document.querySelector(this.configPanelElement),
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
        const filterAtrributes = this.withEmptyAttributeTargets(data);
        this.superPushData(filterAtrributes, options);
    };
}
