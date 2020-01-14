// (C) 2019 GoodData Corporation

import * as React from "react";
import { render } from "react-dom";
import { IntlShape } from "react-intl";

import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");

import { updateConfigWithSettings } from "../../../../highcharts";

import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    RenderFunction,
} from "../../../interfaces/Visualization";
import {
    sanitizeUnusedFilters,
    removeAllDerivedMeasures,
    removeAllArithmeticMeasuresFromDerived,
} from "../../../utils/bucketHelper";
import { removeSort } from "../../../utils/sort";
import { getDefaultXirrUiConfig, getXirrUiConfig } from "../../../utils/uiConfigHelpers/xirrUiConfigHelper";
import { getXirrBuckets } from "./xirrBucketHelper";

import { createInternalIntl } from "../../../utils/internalIntlProvider";

import { hasGlobalDateFilter } from "../../../utils/bucketRules";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import {
    getReferencePointWithSupportedProperties,
    getSupportedProperties,
} from "../../../utils/propertiesHelper";
import {
    IInsight,
    insightProperties,
    insightHasDataDefined,
    insightBucket,
    attributeLocalId,
    IDimension,
    newDimension,
    bucketAttributes,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { IExecutionFactory, ISettings } from "@gooddata/sdk-backend-spi";
import { unmountComponentsAtNodes } from "../../../utils/domHelper";
import { CoreXirr } from "../../../../charts/xirr/CoreXirr";
import { BucketNames, DefaultLocale, ILocale } from "../../../../base";

export class PluggableXirr extends AbstractPluggableVisualization {
    protected configPanelElement: string;
    private callbacks: IVisCallbacks;
    private intl: IntlShape;
    private locale: ILocale;
    private visualizationProperties: IVisualizationProperties;
    private element: string;
    private settings?: ISettings;
    private renderFun: RenderFunction;

    constructor(props: IVisConstruct) {
        super();
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
        this.callbacks = props.callbacks;
        this.locale = props.locale ? props.locale : DefaultLocale;
        this.intl = createInternalIntl(this.locale);
        this.settings = props.featureFlags;
        this.renderFun = props.renderFun;
    }

    public unmount() {
        unmountComponentsAtNodes([this.element, this.configPanelElement]);
    }

    public update(options: IVisProps, insight: IInsight, executionFactory: IExecutionFactory) {
        this.visualizationProperties = insightProperties(insight);
        this.renderVisualization(options, insight, executionFactory);
        this.renderConfigurationPanel();
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

        return sanitizeUnusedFilters(newReferencePoint, referencePoint);
    };

    protected renderVisualization(
        options: IVisProps,
        insight: IInsight,
        executionFactory: IExecutionFactory,
    ) {
        if (!insightHasDataDefined(insight)) {
            return;
        }

        const { locale, custom = {}, config } = options;
        const { drillableItems } = custom;
        const { afterRender, onError, onLoadingChanged, pushData, onDrill } = this.callbacks;
        const execution = executionFactory
            .forInsight(insight)
            .withDimensions(...this.getXirrDimensions(insight));

        this.renderFun(
            <CoreXirr
                execution={execution}
                drillableItems={drillableItems}
                onDrill={onDrill}
                locale={locale}
                config={updateConfigWithSettings(config, this.settings)}
                afterRender={afterRender}
                onLoadingChanged={onLoadingChanged}
                pushData={pushData}
                onError={onError}
                LoadingComponent={null}
                ErrorComponent={null}
            />,
            document.querySelector(this.element),
        );
    }

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            const properties: IVisualizationProperties = get(
                this.visualizationProperties,
                "properties",
                {},
            ) as IVisualizationProperties;

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.callbacks.pushData}
                    properties={getSupportedProperties(properties, this.supportedPropertiesList)}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    private getXirrDimensions(insight: IInsight): IDimension[] {
        const attribute = insightBucket(insight, BucketNames.ATTRIBUTE);

        if (attribute && attribute.items.length) {
            return [
                newDimension([MeasureGroupIdentifier, ...bucketAttributes(attribute).map(attributeLocalId)]),
            ];
        }

        return [newDimension([MeasureGroupIdentifier])];
    }
}
