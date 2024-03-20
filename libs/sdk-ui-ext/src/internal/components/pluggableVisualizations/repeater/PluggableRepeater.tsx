// (C) 2024 GoodData Corporation

import React from "react";
import {
    IDimension,
    IInsightDefinition,
    ISettings,
    areObjRefsEqual,
    insightBucket,
    insightBuckets,
    insightProperties,
} from "@gooddata/sdk-model";
import { CoreRepeater, constructRepeaterDimensions, updateConfigWithSettings } from "@gooddata/sdk-ui-charts";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { BucketNames } from "@gooddata/sdk-ui";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    InvalidColumnsSdkError,
    RenderFunction,
    UnmountFunction,
} from "../../../interfaces/Visualization.js";
import RepeaterConfigurationPanel from "../../configurationPanels/RepeaterConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";
import {
    configRepeaterBuckets,
    getDefaultRepeaterUiConfig,
    setRepeaterUiConfig,
} from "../../../utils/uiConfigHelpers/repeaterUiConfigHelper.js";
import cloneDeep from "lodash/cloneDeep.js";
import { cloneBucketItem, getMainRowAttribute, sanitizeFilters } from "../../../utils/bucketHelper.js";
import { getSupportedPropertiesControls } from "../../../utils/propertiesHelper.js";

const REPEATER_SUPPORTER_PROPERTIES_LIST = [
    "rowHeight",
    "cellVerticalAlign",
    "cellTextWrapping",
    "cellImageSizing",
];

export class PluggableRepeater extends AbstractPluggableVisualization {
    private featureFlags?: ISettings;
    private renderFun: RenderFunction;
    private unmountFun: UnmountFunction;

    constructor(props: IVisConstruct) {
        super(props);

        this.featureFlags = props.featureFlags;
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;
        this.supportedPropertiesList = REPEATER_SUPPORTER_PROPERTIES_LIST;
        this.initializeProperties(props.visualizationProperties);
    }

    public unmount(): void {
        this.unmountFun([this.getElement(), this.getConfigPanelElement()]);
    }

    public getExtendedReferencePoint = async (
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> => {
        const referencePointCloned = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...referencePointCloned,
            uiConfig: getDefaultRepeaterUiConfig(),
        };

        newReferencePoint = configRepeaterBuckets(newReferencePoint);
        newReferencePoint = setRepeaterUiConfig(newReferencePoint, this.intl);
        return sanitizeFilters(newReferencePoint);
    };

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat } = options;
        const dimensions = this.getRepeaterDimensions(insight);

        return executionFactory
            .forInsight(insight)
            .withDimensions(...dimensions)
            .withDateFormat(dateFormat);
    }

    public getBucketsToUpdate(currentReferencePoint: IReferencePoint, nextReferencePoint: IReferencePoint) {
        const currentRefencePointClone = cloneDeep(currentReferencePoint);
        const nextReferencePointClone = cloneDeep(nextReferencePoint);

        const currentBuckets = currentRefencePointClone?.buckets ?? [];
        const currentRowAttribute = getMainRowAttribute(currentBuckets);
        const nextBuckets = nextReferencePointClone?.buckets ?? [];
        const nextRowAttribute = getMainRowAttribute(nextBuckets);

        const rowAttributeWasEmpty = !currentRowAttribute && nextRowAttribute;
        const rowAttributeWasSwapped =
            currentRowAttribute &&
            nextRowAttribute &&
            !currentRowAttribute.displayForms.some((currentDf) =>
                areObjRefsEqual(currentDf.ref, nextRowAttribute.dfRef),
            );

        if (rowAttributeWasEmpty || rowAttributeWasSwapped) {
            // clone the row attribute
            return [cloneBucketItem(nextRowAttribute)];
        }

        if (currentRowAttribute && !nextRowAttribute) {
            // empty all column attributes
            return [];
        }

        // do nothing
        return undefined;
    }

    private getRepeaterDimensions(insight: IInsightDefinition): IDimension[] {
        const buckets = insightBuckets(insight);
        return constructRepeaterDimensions(buckets);
    }

    private insightHasColumns(insight: IInsightDefinition): boolean {
        const bucket = insightBucket(insight, BucketNames.COLUMNS);
        return bucket?.items?.length > 0;
    }

    protected mergeDerivedBucketItems(
        _referencePoint: IReferencePoint,
        bucket: IBucketOfFun,
        newDerivedBucketItems: IBucketItem[],
    ): IBucketItem[] {
        if (bucket.localIdentifier === BucketNames.ATTRIBUTE) {
            return bucket.items;
        }

        if (newDerivedBucketItems.length === 0) {
            return [];
        }

        // remove all existing attributes as they should disappear when cloning the row attribute
        const itemsWithoutAttributes = bucket.items.filter((item) => item.type !== "attribute");

        return [...newDerivedBucketItems, ...itemsWithoutAttributes];
    }

    protected checkBeforeRender(insight: IInsightDefinition): boolean {
        super.checkBeforeRender(insight);

        if (!this.insightHasColumns(insight)) {
            throw new InvalidColumnsSdkError();
        }

        return true;
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

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { locale, custom = {}, config } = options;
        const { drillableItems } = custom;
        const execution = this.getExecution(options, insight, executionFactory);
        const properties = insightProperties(insight);
        const extendedConfig = {
            ...(properties?.controls ?? {}),
            ...config,
            ...properties,
        };

        this.renderFun(
            <CoreRepeater
                execution={execution}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                locale={locale}
                config={updateConfigWithSettings(extendedConfig, this.featureFlags)}
                afterRender={this.afterRender}
                onLoadingChanged={this.onLoadingChanged}
                pushData={this.pushData}
                onError={this.onError}
                intl={this.intl}
            />,
            this.getElement(),
        );
    }

    protected renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            this.renderFun(
                <RepeaterConfigurationPanel
                    locale={this.locale}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.pushData}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }
}
