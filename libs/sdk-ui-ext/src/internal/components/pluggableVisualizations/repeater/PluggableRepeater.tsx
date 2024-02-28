// (C) 2024 GoodData Corporation

import React from "react";
import {
    IDimension,
    IInsightDefinition,
    ISettings,
    MeasureGroupIdentifier,
    areObjRefsEqual,
    bucketAttributes,
    bucketMeasures,
    insightBucket,
    newDimension,
} from "@gooddata/sdk-model";
import { CoreRepeater, updateConfigWithSettings } from "@gooddata/sdk-ui-charts";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { BucketNames } from "@gooddata/sdk-ui";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
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
import { cloneBucketItem, getMainRowAttribute } from "../../../utils/bucketHelper.js";

export class PluggableRepeater extends AbstractPluggableVisualization {
    private featureFlags?: ISettings;
    private renderFun: RenderFunction;
    private unmountFun: UnmountFunction;

    constructor(props: IVisConstruct) {
        super(props);

        this.featureFlags = props.featureFlags;
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;
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

        return newReferencePoint;
    };

    public getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { dateFormat } = options;

        return executionFactory
            .forInsight(insight)
            .withDimensions(this.getRepeaterDimensions(insight))
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

    private getRepeaterDimensions(insight: IInsightDefinition): IDimension {
        const attributeBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
        const attributes = attributeBucket ? bucketAttributes(attributeBucket) : [];
        const rowAttribute = attributes[0];

        const columnsBucket = insightBucket(insight, BucketNames.COLUMNS);
        const measures = columnsBucket ? bucketMeasures(columnsBucket) : [];
        const otherAttributes = columnsBucket ? bucketAttributes(columnsBucket) : [];

        if (measures.length) {
            return newDimension([rowAttribute, ...otherAttributes, MeasureGroupIdentifier]);
        }

        return newDimension([rowAttribute, ...otherAttributes]);
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

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { locale, custom = {}, config } = options;
        const { drillableItems } = custom;
        const execution = this.getExecution(options, insight, executionFactory);

        this.renderFun(
            <CoreRepeater
                execution={execution}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                locale={locale}
                config={updateConfigWithSettings(config, this.featureFlags)}
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
