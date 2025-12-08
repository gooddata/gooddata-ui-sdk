// (C) 2019-2025 GoodData Corporation

import { cloneDeep, isEmpty, set } from "lodash-es";

import {
    IInsight,
    IInsightDefinition,
    bucketsItems,
    insightBucket,
    insightBuckets,
    newAttributeSort,
} from "@gooddata/sdk-model";
import { BucketNames, IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket.js";
import {
    AREA_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties.js";
import {
    AREA_UICONFIG_WITH_MULTIPLE_DATES,
    MAX_CATEGORIES_COUNT,
    MAX_METRICS_COUNT,
} from "../../../constants/uiConfig.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import {
    IBucketItem,
    IBucketOfFun,
    IDrillDownContext,
    IDrillDownDefinition,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisProps,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    getAllAttributeItemsWithPreference,
    getBucketItems,
    getFilteredMeasuresForStackedCharts,
    getStackItems,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import {
    getReferencePointWithSupportedProperties,
    removeImmutableOptionalStackingProperties,
} from "../../../utils/propertiesHelper.js";
import { getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { setAreaChartUiConfig } from "../../../utils/uiConfigHelpers/areaChartUiConfigHelper.js";
import { LineChartBasedConfigurationPanel } from "../../configurationPanels/LineChartBasedConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil.js";

/**
 * PluggableAreaChart
 *
 * ## Buckets
 *
 * | Name     | Id       | Accepts             |
 * |----------|----------|---------------------|
 * | Measures | measures | measures only       |
 * | ViewBy   | view     | attributes or dates |
 * | StackBy  | stack    | attributes only     |
 *
 * ### Bucket axioms
 *
 * - |Measures| ≥ 1
 * - |ViewBy| ≤ 2
 * - |StackBy| ≤ 1
 * - |ViewBy| + |StackBy| ≤ 2
 * - |ViewBy| + |StackBy| = 2 ⇒ |Measures| ≤ 1
 * - |ViewBy| + |StackBy| \< 2 ⇒ |Measures| ≤ 20
 *
 * ## Dimensions
 *
 * The PluggableAreaChart always creates two dimensional execution.
 *
 * - |StackBy| = 1 ∧ |ViewBy| ≥ 1 ⇒ [[StackBy[0]], [ViewBy[0], MeasureGroupIdentifier]]
 * - |StackBy| = 1 ∧ |ViewBy| = 0 ⇒ [[StackBy[0]], [MeasureGroupIdentifier]]
 * - |StackBy| = 0 ∧ |ViewBy| = 2 ⇒ [[ViewBy[1]], [ViewBy[0], MeasureGroupIdentifier]]
 * - |StackBy| = 0 ∧ |ViewBy| = 1 ⇒ [[MeasureGroupIdentifier], [ViewBy[0]]]
 * - |StackBy| = 0 ∧ |ViewBy| = 0 ⇒ [[MeasureGroupIdentifier], []]]
 *
 * ## Sorts
 *
 * Unless the user specifies otherwise, PluggableAreaChart does not use any sorts.
 *
 */
export class PluggableAreaChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.AREA;
        this.defaultControlsProperties = {
            stackMeasures: true,
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public override getUiConfig(): IUiConfig {
        return cloneDeep(AREA_UICONFIG_WITH_MULTIPLE_DATES);
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: this.getUiConfig(),
        };
        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        this.configureBuckets(newReferencePoint);

        newReferencePoint = setAreaChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);

        this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
            newReferencePoint,
            this.getSupportedPropertiesList(),
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public override getInsightWithDrillDownApplied(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const withFilters = this.addFilters(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
            backendSupportsElementUris,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public override getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(referencePoint);
        const { properties, availableSorts: previousAvailableSorts } = referencePoint;
        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint, availableSorts);
        return Promise.resolve({
            supported: true,
            disabled,
            appliedSort: super.reuseCurrentSort(
                previousAvailableSorts,
                properties,
                availableSorts,
                defaultSort,
            ),
            defaultSort,
            availableSorts,
            ...(disabledExplanation && { disabledExplanation }),
        });
    }

    protected override updateInstanceProperties(
        options: IVisProps,
        insight: IInsightDefinition,
        insightPropertiesMeta: any,
    ): void {
        super.updateInstanceProperties(options, insight, insightPropertiesMeta);

        this.updateCustomSupportedProperties(insight);
    }

    protected override configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const { measures, views, stacks } = this.getBucketItemsWithMultipleDates(extendedReferencePoint);

        set(extendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: views,
            },
            {
                localIdentifier: BucketNames.STACK,
                items: stacks,
            },
        ]);
    }

    protected override getSupportedPropertiesList(): string[] {
        return AREA_CHART_SUPPORTED_PROPERTIES;
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();
        if (configPanelElement) {
            const panelConfig = {
                isContinuousLineControlDisabled: this.isContinuousLineControlDisabled(insight),
                isDistinctPointShapesDisabled: this.isDistinctPointShapesDisabled(),
                supportsAttributeHierarchies: this.backendCapabilities.supportsAccessControl,
                supportsChartFill: options.supportsChartFill,
            };

            this.renderFun(
                <LineChartBasedConfigurationPanel
                    locale={this.locale}
                    colors={this.colors}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    references={this.references}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    private addFilters(
        source: IInsight,
        drillConfig: IDrillDownDefinition,
        event: IDrillEvent,
        backendSupportsElementUris: boolean,
    ) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection, backendSupportsElementUris);
    }

    private updateCustomSupportedProperties(insight: IInsightDefinition): void {
        if (
            bucketsItems(insightBuckets(insight, BucketNames.VIEW)).length > 1 ||
            !this.isContinuousLineControlDisabled(insight)
        ) {
            this.addSupportedProperties(OPTIONAL_STACKING_PROPERTIES);
            this.setCustomControlsProperties({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        } else {
            this.setCustomControlsProperties({});
        }
    }

    private addSupportedProperties(properties: string[]) {
        const supportedPropertiesList = this.supportedPropertiesList;
        (properties || []).forEach((property: string) => {
            if (!supportedPropertiesList.some((supportedProperty) => supportedProperty === property)) {
                supportedPropertiesList.push(property);
            }
        });
    }

    private getViewByMaxItemCount(referencePoint: IExtendedReferencePoint): number {
        return referencePoint.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT;
    }

    private getBucketMeasures(buckets: IBucketOfFun[] = []) {
        const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, MAX_METRICS_COUNT, true);
        return getFilteredMeasuresForStackedCharts(limitedBuckets);
    }

    private getBucketItemsWithMultipleDates(referencePoint: IExtendedReferencePoint) {
        const buckets = referencePoint?.buckets ?? [];
        const measures = this.getBucketMeasures(buckets);
        const viewByMaxItemCount = this.getViewByMaxItemCount(referencePoint);
        const stacks: IBucketItem[] = getStackItems(buckets, [ATTRIBUTE, DATE]);

        const allAttributesWithoutStacks = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.LOCATION,
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.ATTRIBUTES,
            BucketNames.SEGMENT,
            BucketNames.STACK,
        ]).filter((attribute) => !stacks.includes(attribute));

        const maxViews = stacks.length || measures.length > 1 ? 1 : viewByMaxItemCount;
        const views = allAttributesWithoutStacks.slice(0, maxViews);

        return {
            measures,
            views,
            stacks,
        };
    }

    private getDefaultAndAvailableSort(referencePoint: IReferencePoint): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const { buckets, properties } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const canSortStackTotal =
            properties?.controls?.["stackMeasures"] ?? this.getUiConfig().optionalStacking.stackMeasures;

        const defaultSort = viewBy.length > 0 ? [newAttributeSort(viewBy[0].localIdentifier, "asc")] : [];

        if (measures.length >= 2 && viewBy.length === 1 && !canSortStackTotal) {
            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        measures.map((m) => m.localIdentifier),
                    ),
                ],
            };
        }
        if (measures.length === 1 && isEmpty(stackBy)) {
            if (viewBy.length >= 2) {
                return {
                    defaultSort,
                    availableSorts: [newAvailableSortsGroup(viewBy[0].localIdentifier)],
                };
            }
            if (viewBy.length === 1) {
                return {
                    defaultSort,
                    availableSorts: [
                        newAvailableSortsGroup(
                            viewBy[0].localIdentifier,
                            measures.map((m) => m.localIdentifier),
                            true,
                            false,
                        ),
                    ],
                };
            }
        }
        if (measures.length > 0 && viewBy.length === 1 && (stackBy.length === 1 || canSortStackTotal)) {
            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        isEmpty(stackBy) ? measures.map((m) => m.localIdentifier) : [],
                    ),
                ],
            };
        }
        return {
            defaultSort: [],
            availableSorts: [],
        };
    }

    private isSortDisabled(referencePoint: IReferencePoint, availableSorts: ISortConfig["availableSorts"]) {
        const { buckets } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled: viewBy.length < 1 || measures.length < 1 || availableSorts.length === 0,
            disabledExplanation,
        };
    }

    private isContinuousLineControlDisabled(insight: IInsightDefinition) {
        const isStackingMeasures = this.visualizationProperties?.controls?.["stackMeasures"];
        if (typeof isStackingMeasures === "undefined") {
            const measuresBuckets = insightBucket(insight, BucketNames.MEASURES);
            const stackBuckets = insightBucket(insight, BucketNames.STACK);
            return stackBuckets?.items.length > 0 || measuresBuckets?.items?.length > 1;
        }
        return isStackingMeasures;
    }

    private isDistinctPointShapesDisabled(): boolean {
        const dataPointsVisible = this.visualizationProperties?.controls?.["dataPoints"]?.visible;

        if (typeof dataPointsVisible === "undefined") {
            return true;
        }

        return !!dataPointsVisible;
    }
}
