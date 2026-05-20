// (C) 2026 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import { type IInsight, type IInsightDefinition, newAttributeSort } from "@gooddata/sdk-model";
import { BucketNames, type IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket.js";
import { RADAR_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { MAX_METRICS_COUNT, RADAR_UICONFIG } from "../../../constants/uiConfig.js";
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
    getFilteredMeasuresForStackedCharts,
    getFistDateItemWithMultipleDates,
    getMeasureItems,
    getStackItems,
    limitNumberOfMeasuresInBuckets,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { setRadarChartUiConfig } from "../../../utils/uiConfigHelpers/radarChartUiConfigHelper.js";
import { RadarChartConfigurationPanel } from "../../configurationPanels/RadarChartConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil.js";

/**
 * PluggableRadarChart
 *
 * ## Buckets
 *
 * | Name      | Id       | Accepts             |
 * |-----------|----------|---------------------|
 * | Measures  | measures | measures only       |
 * | ViewBy    | trend    | attributes or dates |
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
 * The PluggableRadarChart always creates two dimensional execution.
 *
 * - |SegmentBy| = 1 ⇒ [[...SegmentBy], [...TrendBy, MeasureGroupIdentifier]]
 * - |SegmentBy| = 0 ⇒ [[MeasureGroupIdentifier], [...TrendBy]]
 *
 * ## Sorts
 *
 * The PluggableRadarChart does not use any sorts.
 */
export class PluggableRadarChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.RADAR;
        this.supportedPropertiesList = RADAR_CHART_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    public override getUiConfig(): IUiConfig {
        return cloneDeep(RADAR_UICONFIG);
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

        newReferencePoint = setRadarChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );

        this.referencePoint = newReferencePoint;

        return Promise.resolve(sanitizeFilters(newReferencePoint, referencePoint));
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
        return getFilteredMeasuresForStackedCharts(limitedBuckets);
    }

    protected override configureBuckets(newReferencePoint: IExtendedReferencePoint): void {
        this.configureBucketsWithMultipleDates(newReferencePoint);
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
                supportsChartFill: true,
            };

            this.renderFun(
                <RadarChartConfigurationPanel
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

        const defaultSort = trendBy.length > 0 ? [newAttributeSort(trendBy[0].localIdentifier, "asc")] : [];

        if (measures.length > 0 && trendBy.length === 1) {
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
}
