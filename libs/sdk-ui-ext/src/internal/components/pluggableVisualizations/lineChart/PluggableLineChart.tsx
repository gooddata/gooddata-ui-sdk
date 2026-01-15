// (C) 2019-2026 GoodData Corporation

import { cloneDeep, isEmpty, isEqual, set } from "lodash-es";

import { type IInsight, type IInsightDefinition, newAttributeSort } from "@gooddata/sdk-model";
import { BucketNames, type IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";

import { AXIS, AXIS_NAME } from "../../../constants/axis.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket.js";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { LINE_UICONFIG_WITH_MULTIPLE_DATES, MAX_METRICS_COUNT } from "../../../constants/uiConfig.js";
import { type ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import {
    type IBucketItem,
    type IBucketOfFun,
    type IDrillDownContext,
    type IDrillDownDefinition,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IUiConfig,
    type IVisConstruct,
    type IVisProps,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getBucketItems,
    getFilteredMeasuresForStackedChartsWithStyleControlMetricSupport,
    getFistDateItemWithMultipleDates,
    getMeasureItems,
    getStackItems,
    limitNumberOfMeasuresInBuckets,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import {
    getReferencePointWithSupportedProperties,
    setSecondaryMeasures,
} from "../../../utils/propertiesHelper.js";
import { getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { setLineChartUiConfig } from "../../../utils/uiConfigHelpers/lineChartUiConfigHelper.js";
import { LineChartBasedConfigurationPanel } from "../../configurationPanels/LineChartBasedConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil.js";

/**
 * PluggableLineChart
 *
 * ## Buckets
 *
 * | Name      | Id       | Accepts             |
 * |-----------|----------|---------------------|
 * | Measures  | measures | measures only       |
 * | TrendBy   | trend    | attributes or dates |
 * | SegmentBy | segment  | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |Measures| ≥ 1
 * - |TrendBy| ≤ 1
 * - |SegmentBy| ≤ 1
 * - |SegmentBy| = 1 ⇒ |Measures| = 1
 * - |SegmentBy| = 0 ⇒ |Measures| ≤ 20
 * - |Measures| ≥ 2 ⇒ |SegmentBy| = 0
 *
 * ## Dimensions
 *
 * The PluggableLineChart always creates two dimensional execution.
 *
 * - |SegmentBy| = 1 ⇒ [[...SegmentBy], [...TrendBy, MeasureGroupIdentifier]]
 * - |SegmentBy| = 0 ⇒ [[MeasureGroupIdentifier], [...TrendBy]]
 *
 * ## Sorts
 *
 * The PluggableLineChart does not use any sorts.
 */
export class PluggableLineChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        // set default to DUAL to get the full supported props list
        // and will be updated in getExtendedReferencePoint
        this.axis = AXIS.DUAL;
        this.type = VisualizationTypes.LINE;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
        this.initializeProperties(props.visualizationProperties);
    }

    public override getSupportedPropertiesList(): string[] {
        return LINE_CHART_SUPPORTED_PROPERTIES[this.axis];
    }

    public override getUiConfig(): IUiConfig {
        const config = cloneDeep(LINE_UICONFIG_WITH_MULTIPLE_DATES);
        this.addMetricToFiltersIfEnabled(config);
        return config;
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: this.getUiConfig(),
        };

        this.configureBuckets(newReferencePoint);

        newReferencePoint = setSecondaryMeasures(newReferencePoint, AXIS_NAME.SECONDARY_Y);

        this.axis = newReferencePoint?.uiConfig?.axis ?? AXIS.PRIMARY;
        this.supportedPropertiesList = this.getSupportedPropertiesList();

        newReferencePoint = setLineChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );

        newReferencePoint = this.setThresholdProperties(newReferencePoint);

        this.referencePoint = newReferencePoint;

        return Promise.resolve(
            sanitizeFilters(newReferencePoint, this.featureFlags?.enableImprovedAdFilters, referencePoint),
        );
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
        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint, availableSorts);

        const { properties, availableSorts: previousAvailableSorts } = referencePoint;
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

    private getBucketMeasures(buckets: IBucketOfFun[] = []) {
        const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, MAX_METRICS_COUNT, true);
        return getFilteredMeasuresForStackedChartsWithStyleControlMetricSupport(limitedBuckets);
    }

    protected override configureBuckets(newReferencePoint: IExtendedReferencePoint): void {
        this.configureBucketsWithMultipleDates(newReferencePoint);
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
                isDistinctPointShapesDisabled: this.isDistinctPointShapesDisabled(),
            };

            this.renderFun(
                <LineChartBasedConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    referencePoint={this.referencePoint}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    private configureBucketsWithMultipleDates(newReferencePoint: IExtendedReferencePoint): void {
        const buckets = newReferencePoint?.buckets ?? [];
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);

        let attributes: IBucketItem[] = [];
        let stacks: IBucketItem[] = getStackItems(buckets, [ATTRIBUTE, DATE]);
        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.LOCATION,
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.ATTRIBUTES,
            BucketNames.SEGMENT,
            BucketNames.STACK,
        ]);

        const firstDateItemInViews = getFistDateItemWithMultipleDates(buckets);

        if (firstDateItemInViews) {
            attributes = [firstDateItemInViews];
            const nextAttribute = allAttributes.find((attr) => attr !== firstDateItemInViews);

            if (masterMeasures.length <= 1 && nextAttribute && !stacks.length) {
                stacks = [nextAttribute];
            }
        } else {
            if (masterMeasures.length <= 1 && allAttributes.length > 1 && !stacks.length) {
                stacks = allAttributes.slice(1, 2);
            }

            attributes = getAttributeItemsWithoutStacks(buckets, [ATTRIBUTE, DATE]).slice(0, 1);
        }

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: this.getBucketMeasures(newReferencePoint.buckets),
            },
            {
                localIdentifier: BucketNames.TREND,
                items: attributes,
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: stacks,
            },
        ]);
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

    private getDefaultAndAvailableSort(referencePoint: IReferencePoint): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const { buckets } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const trendBy = getBucketItems(buckets, BucketNames.TREND);
        const segmentBy = getBucketItems(buckets, BucketNames.SEGMENT);

        const defaultSort = trendBy.length > 0 ? [newAttributeSort(trendBy[0].localIdentifier, "asc")] : [];

        if (measures.length > 0 && trendBy.length === 1) {
            if (isEmpty(segmentBy)) {
                return {
                    defaultSort,
                    availableSorts: [
                        newAvailableSortsGroup(
                            trendBy[0].localIdentifier,
                            measures.map((m) => m.localIdentifier),
                            true,
                            measures.length > 1,
                        ),
                    ],
                };
            }
            return {
                defaultSort,
                availableSorts: [newAvailableSortsGroup(trendBy[0].localIdentifier)],
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
        const viewBy = getBucketItems(buckets, BucketNames.TREND);
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled: viewBy.length < 1 || measures.length < 1 || availableSorts.length === 0,
            disabledExplanation,
        };
    }

    private setThresholdProperties(referencePoint: IExtendedReferencePoint) {
        const { buckets, properties } = referencePoint;
        const measureItems = getMeasureItems(buckets);

        const listThresholdMeasures = measureItems
            .filter((item) => item.isThresholdMeasure)
            .map((item) => item.localIdentifier);
        const existingThresholdMeasures = properties?.controls?.["thresholdMeasures"] || [];

        if (measureItems.length <= 1 && existingThresholdMeasures.length > 0) {
            // In case there's just one measure item, we need to reset the threshold measures
            set(referencePoint, "properties.controls.thresholdMeasures", []);
        }
        if (isEqual(listThresholdMeasures, existingThresholdMeasures)) {
            return referencePoint;
        }
        set(referencePoint, "properties.controls.thresholdMeasures", listThresholdMeasures);
        return referencePoint;
    }

    private isDistinctPointShapesDisabled(): boolean {
        const dataPointsVisible = this.visualizationProperties?.controls?.["dataPoints"]?.visible;

        if (typeof dataPointsVisible === "undefined") {
            return true;
        }

        return !!dataPointsVisible;
    }
}
