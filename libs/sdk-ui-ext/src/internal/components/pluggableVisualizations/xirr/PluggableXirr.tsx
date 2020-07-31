// (C) 2019 GoodData Corporation

import { IExecutionFactory, ISettings } from "@gooddata/sdk-backend-spi";
import {
    attributeLocalId,
    bucketAttributes,
    IDimension,
    IInsightDefinition,
    insightBucket,
    MeasureGroupIdentifier,
    newDimension,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { CoreXirr, updateConfigWithSettings } from "@gooddata/sdk-ui-charts";
import React from "react";
import { render } from "react-dom";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
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

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { locale, custom = {}, config } = options;
        const { drillableItems } = custom;
        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getXirrDimensions(insight));

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
        const attribute = insightBucket(insight, BucketNames.ATTRIBUTE);

        if (attribute && attribute.items.length) {
            return [
                newDimension([MeasureGroupIdentifier, ...bucketAttributes(attribute).map(attributeLocalId)]),
            ];
        }

        return [newDimension([MeasureGroupIdentifier])];
    }
}
