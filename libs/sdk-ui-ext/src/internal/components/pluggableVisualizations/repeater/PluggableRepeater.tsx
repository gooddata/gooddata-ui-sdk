// (C) 2024 GoodData Corporation

import React from "react";
import {
    IAttribute,
    IDimension,
    IInsightDefinition,
    ISettings,
    IdentifierRef,
    areObjRefsEqual,
    attributeDisplayFormRef,
    insightBucket,
    insightBuckets,
    insightProperties,
    insightSetBuckets,
    isAdhocMeasure,
    isMeasure,
    measureAlias,
    measureFormat,
    measureTitle,
    measureLocalId,
    modifyInlineMeasure,
    newInlineMeasure,
    IMeasure,
    measureAggregation,
    measureItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    RepeaterColumnWidthItem,
    IRepeaterColumnSizing,
    ChartInlineVisualizationType,
    CoreRepeater,
    constructRepeaterDimensions,
    updateConfigWithSettings,
} from "@gooddata/sdk-ui-charts";
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
        const attributeBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
        const viewBucket = insightBucket(insight, BucketNames.VIEW);
        const rowAttribute = attributeBucket.items[0] as IAttribute;
        const mainRowAttributeRef = attributeDisplayFormRef(rowAttribute) as IdentifierRef;
        const mainRowAttributeId = mainRowAttributeRef.identifier;
        const columnBucket = insightBucket(insight, BucketNames.COLUMNS);
        const visualizationProperties = insightProperties(insight);
        const sanitizedColumnBucketItems = columnBucket.items.map((item) => {
            if (isMeasure(item)) {
                const localId = measureLocalId(item);
                const inlineVisualizationType =
                    (visualizationProperties?.inlineVisualizations?.[localId]
                        ?.type as ChartInlineVisualizationType) ?? "metric";

                return transformAdhocMeasureToInline(
                    item,
                    inlineVisualizationType === "metric" ? mainRowAttributeId : undefined,
                );
            }

            return item;
        });

        const insightWithSanitizedBuckets = insightSetBuckets(insight, [
            attributeBucket,
            { ...columnBucket, items: sanitizedColumnBucketItems },
            viewBucket ?? newBucket(BucketNames.VIEW),
        ]);

        return executionFactory
            .forInsight(insightWithSanitizedBuckets)
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
        let result;

        if (bucket.localIdentifier === BucketNames.ATTRIBUTE) {
            result = bucket.items;
        }

        if (bucket.localIdentifier === BucketNames.VIEW) {
            result = [];
        }

        if (newDerivedBucketItems.length === 0) {
            result = [];
        }

        // remove all existing attributes as they should disappear when cloning the row attribute
        const itemsWithoutAttributes = bucket.items.filter((item) => item.type !== "attribute");

        if (result) {
            return result;
        }
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

    private onColumnResized = (columnWidths: RepeaterColumnWidthItem[]): void => {
        const properties = this.visualizationProperties ?? {};
        const supportedProperties = getSupportedPropertiesControls(
            properties?.controls,
            this.supportedPropertiesList,
        );

        this.pushData({
            properties: {
                controls: {
                    columnWidths,
                    ...supportedProperties,
                },
            },
        });
    };

    private buildColumnSizing(columnWidths?: RepeaterColumnWidthItem[]): IRepeaterColumnSizing {
        let columnSizing: Partial<IRepeaterColumnSizing> = {};

        //TODO: implement autoSize and growToFit
        // if (autoSize) {
        //     columnSizing = {
        //         defaultWidth: config.isExportMode ? "viewport" : "autoresizeAll",
        //     };
        // }
        // if (growToFit) {
        //     columnSizing = {
        //         ...columnSizing,
        //         growToFit: true,
        //     };
        // }

        if (columnWidths && columnWidths.length > 0) {
            columnSizing = {
                ...columnSizing,
                columnWidths,
            };
        }

        return columnSizing as IRepeaterColumnSizing;
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
            columnSizing: this.buildColumnSizing(properties?.controls?.columnWidths),
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
                onColumnResized={this.onColumnResized}
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

export function transformAdhocMeasureToInline(measure: IMeasure, mainRowAttributeId?: string): IMeasure {
    if (!isAdhocMeasure(measure)) {
        return measure;
    }

    const itemRef = measureItem(measure) as IdentifierRef;
    const aggregation = measureAggregation(measure);
    let maqlExpression = "";

    const itemIdentifier = `{${itemRef.type}/${itemRef.identifier}}`;

    if (aggregation) {
        maqlExpression = `SELECT ${aggregation}(${itemIdentifier})`;
    } else {
        maqlExpression = `SELECT ${itemIdentifier}`;
    }

    if (mainRowAttributeId) {
        maqlExpression += ` BY ALL OTHER EXCEPT {label/${mainRowAttributeId}}`;
    }

    const inlineMeasure = newInlineMeasure(maqlExpression);

    return modifyInlineMeasure(inlineMeasure, (m) =>
        m
            .format(measureFormat(measure))
            .localId(measureLocalId(measure))
            .title(measureTitle(measure))
            .alias(measureAlias(measure)),
    );
}
