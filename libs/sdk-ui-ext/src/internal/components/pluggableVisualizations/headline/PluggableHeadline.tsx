// (C) 2019-2025 GoodData Corporation

import { cloneDeep } from "lodash-es";

import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    IInsightDefinition,
    ISettings,
    MeasureGroupIdentifier,
    bucketIsEmpty,
    insightBucket,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    insightId,
    insightProperties,
    insightSorts,
    isInsight,
    isSeparators,
    newDimension,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { CoreHeadline, createHeadlineProvider } from "@gooddata/sdk-ui-charts";

import { setHeadlineRefPointBuckets, tryToMapForeignBuckets } from "./headlineBucketHelper.js";
import { METRIC } from "../../../constants/bucket.js";
import {
    HEADLINE_DEFAULT_CONTROL_PROPERTIES,
    HEADLINE_DEFAULT_MIGRATION_CONTROL_PROPERTIES,
    HEADLINE_SUPPORTED_PROPERTIES,
} from "../../../constants/supportedProperties.js";
import { HeadlineControlProperties } from "../../../interfaces/ControlProperties.js";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    InvalidBucketsSdkError,
    RenderFunction,
    UnmountFunction,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    findDerivedBucketItem,
    getAllItemsByType,
    hasDerivedBucketItems,
    isArithmeticBucketItem,
    isDerivedBucketItem,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { hasGlobalDateFilter } from "../../../utils/bucketRules.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { removeSort } from "../../../utils/sort.js";
import {
    buildHeadlineVisualizationConfig,
    getComparisonColorPalette,
    getDefaultHeadlineUiConfig,
    getHeadlineSupportedProperties,
    getHeadlineUiConfig,
} from "../../../utils/uiConfigHelpers/headlineUiConfigHelper.js";
import HeadlineConfigurationPanel from "../../configurationPanels/HeadlineConfigurationPanel.js";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization.js";

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
    private keepPrimaryDerivedMeasureOnly = false;

    constructor(props: IVisConstruct) {
        super(props);

        this.settings = props.featureFlags;
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;

        this.supportedPropertiesList = HEADLINE_SUPPORTED_PROPERTIES;
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
            uiConfig: getDefaultHeadlineUiConfig(),
        };

        if (!hasGlobalDateFilter(referencePoint.filters)) {
            newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
            newReferencePoint = removeAllDerivedMeasures(newReferencePoint);
        }

        const mappedReferencePoint = tryToMapForeignBuckets(newReferencePoint);

        if (mappedReferencePoint) {
            newReferencePoint = mappedReferencePoint;
            const primaryMeasure = mappedReferencePoint.buckets[0].items[0];
            this.keepPrimaryDerivedMeasureOnly =
                !primaryMeasure || !hasDerivedBucketItems(primaryMeasure, mappedReferencePoint.buckets);
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
            let secondaryMeasures =
                allMeasures.length > 1 ? allMeasures.slice(1, numberOfSecondaryMeasure + 1) : null;

            const primaryDerivedMeasure = findDerivedBucketItem(primaryMeasure, allMeasures);
            if (
                this.keepPrimaryDerivedMeasureOnly &&
                primaryDerivedMeasure &&
                !isArithmeticBucketItem(primaryMeasure)
            ) {
                secondaryMeasures = [primaryDerivedMeasure];
            }
            this.keepPrimaryDerivedMeasureOnly = !primaryDerivedMeasure;

            newReferencePoint = setHeadlineRefPointBuckets(
                newReferencePoint,
                primaryMeasure,
                secondaryMeasures,
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

    protected override checkBeforeRender(insight: IInsightDefinition): boolean {
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
        const headlineConfig = buildHeadlineVisualizationConfig(visualizationProperties, settings, options);

        const provider = createHeadlineProvider(buckets, headlineConfig);
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
                enableExecutionCancelling={headlineConfig.enableExecutionCancelling ?? false}
                headlineTransformation={headlineTransformation}
                execution={execution}
                drillableItems={drillableItems}
                onDrill={this.onDrill}
                locale={locale}
                config={headlineConfig}
                afterRender={this.afterRender}
                onLoadingChanged={this.onLoadingChanged}
                onDataView={this.onDataView}
                pushData={this.pushData}
                onError={this.onError}
                LoadingComponent={null}
                ErrorComponent={null}
                onExportReady={this.onExportReady}
            />,
            this.getElement(),
        );
    }

    protected renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();
        if (configPanelElement) {
            const comparisonColorPalette = getComparisonColorPalette(options?.theme);

            this.renderFun(
                <HeadlineConfigurationPanel
                    locale={this.locale}
                    insight={insight}
                    panelConfig={{
                        separators: isSeparators(this.settings?.["separators"])
                            ? this.settings?.["separators"]
                            : undefined,
                        comparisonColorPalette,
                        supportsAttributeHierarchies: false,
                    }}
                    pushData={this.pushData}
                    properties={getHeadlineSupportedProperties(this.visualizationProperties)}
                    propertiesMeta={this.propertiesMeta}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                    featureFlags={this.settings}
                />,
                configPanelElement,
            );
        }
    }

    protected override mergeDerivedBucketItems(
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

    protected override updateInstanceProperties(
        options: IVisProps,
        insight: IInsightDefinition,
        insightPropertiesMeta: any,
    ): void {
        super.updateInstanceProperties(options, insight, insightPropertiesMeta);

        const hasComparisonProperties = insightProperties(insight)["controls"]?.comparison;
        const currentControls = this.visualizationProperties.controls ?? {};

        if (!hasComparisonProperties) {
            const defaultComparisonProperties = this.getDefaultPropertiesForComparison(options, insight);
            const newProperties = {
                ...this.visualizationProperties,
                controls: {
                    ...currentControls,
                    ...defaultComparisonProperties,
                },
            };
            this.visualizationProperties = newProperties;
            this.pushData({
                properties: newProperties,
            });
        }
    }

    private getDefaultPropertiesForComparison(
        options: IVisProps,
        insight: IInsightDefinition,
    ): HeadlineControlProperties {
        const isInsightOpened = isInsight(insight) && insightId(insight);
        const hasSourceInsightId = !!options.custom?.sourceInsightId;
        const hasVisClassChanged = options.custom?.lastSavedVisClassUrl !== "local:headline";
        const useDefaultMigrationProperties = (isInsightOpened && !hasVisClassChanged) || hasSourceInsightId;
        return useDefaultMigrationProperties
            ? this.buildDefaultMigrationProperties()
            : HEADLINE_DEFAULT_CONTROL_PROPERTIES;
    }

    private buildDefaultMigrationProperties(): HeadlineControlProperties {
        return {
            comparison: {
                ...HEADLINE_DEFAULT_MIGRATION_CONTROL_PROPERTIES.comparison,
                labelConfig: {
                    unconditionalValue: this.intl.formatMessage({
                        id: "visualizations.headline.tertiary.title",
                    }),
                },
            },
        };
    }
}
