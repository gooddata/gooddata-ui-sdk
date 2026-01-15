// (C) 2024-2026 GoodData Corporation

import { cloneDeep, compact, omit } from "lodash-es";

import { type IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IColorMappingItem,
    type IDimension,
    type IInsightDefinition,
    type ITheme,
    areObjRefsEqual,
    insightBucket,
    insightBuckets,
    insightProperties,
    insightSetBuckets,
} from "@gooddata/sdk-model";
import { BucketNames, type IPushData, type VisualizationEnvironment } from "@gooddata/sdk-ui";
import {
    ColorUtils,
    CoreRepeater,
    type IColorMapping,
    type IRepeaterColumnSizing,
    type RepeaterColumnWidthItem,
    constructRepeaterBuckets,
    constructRepeaterDimensions,
    updateConfigWithSettings,
} from "@gooddata/sdk-ui-charts";

import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { REPEATER_SUPPORTER_PROPERTIES_LIST } from "../../../constants/supportedProperties.js";
import { defaultImprovedFilters } from "../../../constants/uiConfig.js";
import { type IColorConfiguration } from "../../../interfaces/Colors.js";
import {
    type IBucketItem,
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
    type IVisProps,
    type IVisualizationProperties,
    InvalidBucketsSdkError,
    InvalidColumnsSdkError,
    type RenderFunction,
    type UnmountFunction,
} from "../../../interfaces/Visualization.js";
import { cloneBucketItem, getMainRowAttribute, sanitizeFilters } from "../../../utils/bucketHelper.js";
import { getValidProperties } from "../../../utils/colors.js";
import { getSupportedPropertiesControls } from "../../../utils/propertiesHelper.js";
import {
    configRepeaterBuckets,
    getDefaultRepeaterUiConfig,
    setRepeaterUiConfig,
} from "../../../utils/uiConfigHelpers/repeaterUiConfigHelper.js";
import { RepeaterConfigurationPanel } from "../../configurationPanels/RepeaterConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";

/**
 * PluggableRepeater
 *
 * ## Buckets
 *
 * | Name      | Id       -| Accepts              |
 * |-----------|-----------|----------------------|
 * | Attribute | attribute | attribute only       |
 * | Columns   | columns   | attribute or measure |
 * | ViewBy    | view      | attribute or date    |
 *
 *
 * ### Bucket axioms
 *
 * - |Attribute| = 1
 * - |Columns| ≥ 1
 * - |ViewBy| ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableRepeater creates one or two dimensional execution, based on  the buckets.
 *
 * With main attribute and column attributes only:
 * - [[Attribute, ...ColumnAttributes]]
 * With main attribute, column attributes and viewBy:
 * - [[Attribute, ...ColumnAttributes], [ViewBy]]
 * With main attribute and column attributes and measures:
 * - [[Attribute, ...ColumnAttributes], [MeasureGroupIdentifier]]
 * With main attribute, column attributes and measures, and viewBy:
 * - [[Attribute, ...ColumnAttributes], [ViewBy, MeasureGroupIdentifier]]
 *
 */
export class PluggableRepeater extends AbstractPluggableVisualization {
    private environment: VisualizationEnvironment | undefined;
    private renderFun: RenderFunction;
    private unmountFun: UnmountFunction;
    protected colors: IColorConfiguration | undefined;

    constructor(props: IVisConstruct) {
        super(props);

        this.environment = props.environment;
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;
        this.supportedPropertiesList = REPEATER_SUPPORTER_PROPERTIES_LIST;
        this.initializeProperties(props.visualizationProperties);
    }

    public unmount(): void {
        this.unmountFun([this.getElement()!, this.getConfigPanelElement()!]);
    }

    public getExtendedReferencePoint = async (
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> => {
        const referencePointCloned = cloneDeep(referencePoint);
        const uiConfig = getDefaultRepeaterUiConfig();
        if (this.featureFlags?.enableImprovedAdFilters && uiConfig.buckets?.["filters"]) {
            uiConfig.buckets["filters"] = defaultImprovedFilters.filters;
        }

        let newReferencePoint: IExtendedReferencePoint = {
            ...referencePointCloned,
            uiConfig,
        };

        newReferencePoint = configRepeaterBuckets(newReferencePoint);
        newReferencePoint = setRepeaterUiConfig(newReferencePoint, this.intl);
        return Promise.resolve(
            sanitizeFilters(
                newReferencePoint,
                this.featureFlags?.enableImprovedAdFilters,
                referencePointCloned,
            ),
        );
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
        const rowAttribute = attributeBucket?.items[0] as IAttribute;
        const columnsBucket = insightBucket(insight, BucketNames.COLUMNS);
        const extendedConfig = this.getExtendedConfig(options, insight);
        const sanitizedBuckets = constructRepeaterBuckets(
            rowAttribute,
            columnsBucket!.items,
            viewBucket?.items?.[0] as IAttribute,
            extendedConfig?.inlineVisualizations,
        );
        const insightWithSanitizedBuckets = insightSetBuckets(insight, sanitizedBuckets);

        return executionFactory
            .forInsight(insightWithSanitizedBuckets)
            .withDimensions(...dimensions)
            .withDateFormat(dateFormat!);
    }

    public override getBucketsToUpdate(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ): IBucketItem[] | undefined {
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
            !currentRowAttribute.displayForms?.some((currentDf) =>
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
        return (bucket?.items?.length ?? 0) > 0;
    }

    private insightHasRows(insight: IInsightDefinition): boolean {
        const bucket = insightBucket(insight, BucketNames.ATTRIBUTE);
        return (bucket?.items?.length ?? 0) > 0;
    }

    protected override mergeDerivedBucketItems(
        _referencePoint: IReferencePoint,
        bucket: IBucketOfFun,
        newDerivedBucketItems: IBucketItem[],
    ): IBucketItem[] {
        let result: IBucketItem[] | undefined;

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

        if (result !== undefined) {
            return result;
        }
        return [...newDerivedBucketItems, ...itemsWithoutAttributes];
    }

    protected override checkBeforeRender(insight: IInsightDefinition): boolean {
        super.checkBeforeRender(insight);

        if (!this.insightHasColumns(insight)) {
            throw new InvalidColumnsSdkError();
        }
        if (!this.insightHasRows(insight)) {
            throw new InvalidBucketsSdkError();
        }

        return true;
    }

    protected initializeProperties(visualizationProperties: IVisualizationProperties): void {
        const controls = visualizationProperties?.controls;

        const supportedProperties = getSupportedPropertiesControls(controls, this.supportedPropertiesList);
        const initialProperties = {
            supportedProperties: { controls: supportedProperties },
        };

        this.handlePushData({
            initialProperties,
        });
    }

    private onColumnResized = (columnWidths: RepeaterColumnWidthItem[]): void => {
        const properties = this.visualizationProperties ?? {};
        const supportedProperties = {
            ...getSupportedPropertiesControls(properties?.controls, this.supportedPropertiesList),
            columnWidths,
        };

        this.visualizationProperties = supportedProperties;

        this.pushData({
            properties: {
                controls: supportedProperties,
            },
        });
    };

    private buildColumnSizing(columnWidths?: RepeaterColumnWidthItem[]): IRepeaterColumnSizing {
        const growToFit = this.environment === DASHBOARDS_ENVIRONMENT;

        let columnSizing: Partial<IRepeaterColumnSizing> = {
            defaultWidth: "autoresizeAll",
        };

        if (growToFit) {
            columnSizing = {
                ...columnSizing,
                growToFit: true,
            };
        }

        if (columnWidths && columnWidths.length > 0) {
            columnSizing = {
                ...columnSizing,
                columnWidths,
            };
        }

        return columnSizing as IRepeaterColumnSizing;
    }

    private buildColorMapping(colorMapping?: IColorMappingItem[]): IColorMapping[] | undefined {
        const validColorMapping = compact(colorMapping).map(
            (mapItem): IColorMapping => ({
                predicate: ColorUtils.getColorMappingPredicate(mapItem.id),
                color: mapItem.color,
            }),
        );

        return validColorMapping?.length > 0 ? validColorMapping : undefined;
    }

    private getExtendedConfig(options: IVisProps, insight: IInsightDefinition) {
        const { config = {}, customVisualizationConfig = {} } = options;
        const properties = insightProperties(insight);

        return {
            ...(properties?.["controls"] ?? {}),
            ...config,
            ...properties,
            ...customVisualizationConfig,
        };
    }

    protected handleConfirmedColorMapping(data: IPushData): void {
        const resultingData = data;
        this.colors = data.colors;

        if (this.visualizationProperties) {
            resultingData.properties = getValidProperties(
                this.visualizationProperties,
                data.colors?.colorAssignments,
            );

            this.visualizationProperties = resultingData.properties;
        }

        this.pushData(resultingData);
        this.renderConfigurationPanel(this.currentInsight, this.currentOptions);
    }

    protected handlePushData = (data: IPushData): void => {
        if (data.colors) {
            this.handleConfirmedColorMapping(data);
        } else {
            this.pushData(data);
        }
    };

    protected renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { locale, custom = {} } = options;
        const { drillableItems } = custom;
        const execution = this.getExecution(options, insight, executionFactory);
        let extendedConfig = this.getExtendedConfig(options, insight);

        extendedConfig = {
            ...extendedConfig,
            columnSizing: this.buildColumnSizing(extendedConfig?.columnWidths),
            colorMapping: this.buildColorMapping(extendedConfig?.colorMapping),
        };

        this.renderFun(
            <CoreRepeater
                enableExecutionCancelling={extendedConfig.enableExecutionCancelling ?? false}
                execution={execution}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                locale={locale}
                config={updateConfigWithSettings(extendedConfig, this.featureFlags)}
                afterRender={this.afterRender}
                onLoadingChanged={this.onLoadingChanged}
                pushData={this.handlePushData}
                onError={this.onError}
                onDataView={this.onDataView}
                onColumnResized={this.onColumnResized}
                theme={undefined as unknown as ITheme}
            />,
            this.getElement(),
        );
    }

    protected renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            this.renderFun(
                <RepeaterConfigurationPanel
                    colors={this.colors}
                    locale={this.locale}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.handlePushData}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    configurationPanelRenderers={omit(
                        options.custom?.configurationPanelRenderers,
                        "InteractionsDetailRenderer",
                    )}
                />,
                configPanelElement,
            );
        }
    }
}
