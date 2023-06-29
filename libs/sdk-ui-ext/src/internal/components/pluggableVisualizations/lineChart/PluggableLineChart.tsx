// (C) 2019-2022 GoodData Corporation
import { BucketNames, IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { IInsight, IInsightDefinition, newAttributeSort } from "@gooddata/sdk-model";

import { AXIS, AXIS_NAME } from "../../../constants/axis.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket.js";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_LINE_UICONFIG, LINE_UICONFIG_WITH_MULTIPLE_DATES } from "../../../constants/uiConfig.js";
import {
    IBucketItem,
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IUiConfig,
    IDrillDownDefinition,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
    getFistDateItemWithMultipleDates,
    getMeasureItems,
    getStackItems,
    isDateBucketItem,
    sanitizeFilters,
    getBucketItems,
} from "../../../utils/bucketHelper.js";
import {
    getReferencePointWithSupportedProperties,
    setSecondaryMeasures,
} from "../../../utils/propertiesHelper.js";
import { removeSort, getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { setLineChartUiConfig } from "../../../utils/uiConfigHelpers/lineChartUiConfigHelper.js";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";

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

    public getSupportedPropertiesList(): string[] {
        return LINE_CHART_SUPPORTED_PROPERTIES[this.axis];
    }

    public getUiConfig(): IUiConfig {
        const config = this.isMultipleDatesEnabled()
            ? LINE_UICONFIG_WITH_MULTIPLE_DATES
            : DEFAULT_LINE_UICONFIG;
        return cloneDeep(config);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
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
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        if (!this.featureFlags.enableChartsSorting) {
            newReferencePoint = removeSort(newReferencePoint);
        }

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public getInsightWithDrillDownApplied(
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

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
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

    protected configureBuckets(newReferencePoint: IExtendedReferencePoint): void {
        if (this.isMultipleDatesEnabled()) {
            this.configureBucketsWithMultipleDates(newReferencePoint);
            return;
        }

        const buckets = newReferencePoint?.buckets ?? [];
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);
        let attributes: IBucketItem[] = [];
        let stacks: IBucketItem[] = getStackItems(buckets);
        const dateItems = getDateItems(buckets);
        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.LOCATION,
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.SEGMENT,
            BucketNames.STACK,
        ]);

        if (dateItems.length) {
            attributes = dateItems.slice(0, 1);
            stacks =
                masterMeasures.length <= 1 && allAttributes.length > 1
                    ? allAttributes
                          .filter((attribute: IBucketItem) => !isDateBucketItem(attribute))
                          .slice(0, 1)
                    : stacks;
        } else {
            if (
                masterMeasures.length <= 1 &&
                allAttributes.length > 1 &&
                !isDateBucketItem(allAttributes?.[1])
            ) {
                stacks = allAttributes.slice(1, 2);
            }

            attributes = getAttributeItemsWithoutStacks(buckets).slice(0, 1);
        }

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: getFilteredMeasuresForStackedCharts(buckets),
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

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            this.renderFun(
                <LineChartBasedConfigurationPanel
                    locale={this.locale}
                    references={this.references}
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
                items: getFilteredMeasuresForStackedCharts(buckets),
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
}
