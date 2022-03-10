// (C) 2019-2022 GoodData Corporation
import {
    bucketsItems,
    IInsight,
    IInsightDefinition,
    insightBuckets,
    newAttributeSort,
    localIdRef,
} from "@gooddata/sdk-model";
import { BucketNames, IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";
import React from "react";
import { render } from "react-dom";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import isEmpty from "lodash/isEmpty";

import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket";
import {
    AREA_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties";
import {
    AREA_UICONFIG_WITH_MULTIPLE_DATES,
    DEFAULT_AREA_UICONFIG,
    MAX_CATEGORIES_COUNT,
    MAX_STACKS_COUNT,
    MAX_VIEW_COUNT,
} from "../../../constants/uiConfig";
import {
    IBucketItem,
    IBucketOfFun,
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisProps,
    IDrillDownDefinition,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";
import {
    getAllAttributeItemsWithPreference,
    getAllCategoriesAttributeItems,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
    getStackItems,
    removeDivergentDateItems,
    isDateBucketItem,
    isNotDateBucketItem,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
    getMainDateItem,
    getBucketItems,
} from "../../../utils/bucketHelper";
import {
    getReferencePointWithSupportedProperties,
    removeImmutableOptionalStackingProperties,
} from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";
import { setAreaChartUiConfig } from "../../../utils/uiConfigHelpers/areaChartUiConfigHelper";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil";
import { ISortConfig, newMeasureSortSuggestion } from "../../../interfaces/SortConfig";

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
 * The ViewBy can accept one date at most, unless "enableMultipleDates" FF is on.
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

    public getUiConfig(): IUiConfig {
        return cloneDeep(
            this.isMultipleDatesEnabled() ? AREA_UICONFIG_WITH_MULTIPLE_DATES : DEFAULT_AREA_UICONFIG,
        );
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
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
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );

        this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
            newReferencePoint,
            this.getSupportedPropertiesList(),
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

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(referencePoint);
        const { properties } = referencePoint;
        const disabled = this.isSortDisabled(referencePoint, availableSorts);
        return Promise.resolve({
            supported: true,
            disabled,
            appliedSort: super.reuseCurrentSort(properties, availableSorts, defaultSort),
            defaultSort,
            availableSorts,
        });
    }

    protected updateInstanceProperties(
        options: IVisProps,
        insight: IInsightDefinition,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        insightPropertiesMeta: any,
    ): void {
        super.updateInstanceProperties(options, insight, insightPropertiesMeta);

        this.updateCustomSupportedProperties(insight);
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const { measures, views, stacks } = this.isMultipleDatesEnabled()
            ? this.getBucketItemsWithMultipleDates(extendedReferencePoint)
            : this.getBucketItems(extendedReferencePoint);

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

    protected getSupportedPropertiesList(): string[] {
        return AREA_CHART_SUPPORTED_PROPERTIES;
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            render(
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
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    private updateCustomSupportedProperties(insight: IInsightDefinition): void {
        if (bucketsItems(insightBuckets(insight, BucketNames.VIEW)).length > 1) {
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

    private getAllAttributes(buckets: IBucketOfFun[]): IBucketItem[] {
        return getAllAttributeItemsWithPreference(buckets, [
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.SEGMENT,
            BucketNames.STACK,
        ]);
    }

    private getAllAttributesWithoutDate(buckets: IBucketOfFun[]): IBucketItem[] {
        return this.getAllAttributes(buckets).filter(isNotDateBucketItem);
    }

    private filterStackItems(bucketItems: IBucketItem[]): IBucketItem[] {
        return bucketItems.filter(isNotDateBucketItem).slice(0, MAX_STACKS_COUNT);
    }

    private getBucketItems(referencePoint: IReferencePoint) {
        const buckets = referencePoint?.buckets ?? [];
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const dateItems = getDateItems(buckets);
        const mainDateItem = getMainDateItem(dateItems);

        let stacks: IBucketItem[] = this.filterStackItems(getStackItems(buckets));
        const isAllowMoreThanOneViewByAttribute = !stacks.length && measures.length <= 1;
        const numOfAttributes = isAllowMoreThanOneViewByAttribute ? MAX_VIEW_COUNT : 1;
        let views: IBucketItem[] = removeDivergentDateItems(
            getAllCategoriesAttributeItems(buckets),
            mainDateItem,
        ).slice(0, numOfAttributes);
        const hasDateItemInViewByBucket = views.some(isDateBucketItem);

        if (dateItems.length && !hasDateItemInViewByBucket) {
            const allAttributes = this.getAllAttributesWithoutDate(buckets);
            const extraViewItems = allAttributes.slice(0, numOfAttributes - 1);
            views = numOfAttributes > 1 ? [mainDateItem, ...extraViewItems] : [mainDateItem];
            if (!isAllowMoreThanOneViewByAttribute && measures.length <= 1) {
                stacks = allAttributes.slice(0, MAX_STACKS_COUNT);
            }
        }

        return {
            measures,
            views,
            stacks,
        };
    }

    private getViewByMaxItemCount(referencePoint: IExtendedReferencePoint): number {
        return referencePoint.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT;
    }

    private getBucketItemsWithMultipleDates(referencePoint: IExtendedReferencePoint) {
        const buckets = referencePoint?.buckets ?? [];
        const measures = getFilteredMeasuresForStackedCharts(buckets);
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
            properties?.controls?.stackMeasures ?? this.getUiConfig().optionalStacking.stackMeasures;

        const defaultSort = viewBy.length > 0 ? [newAttributeSort(viewBy[0].localIdentifier, "asc")] : [];

        if (measures.length >= 2 && viewBy.length === 1 && !canSortStackTotal) {
            return {
                defaultSort,
                availableSorts: [
                    {
                        itemId: localIdRef(viewBy[0].localIdentifier),
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: true,
                        },
                        metricSorts: measures.map((m) => newMeasureSortSuggestion(m.localIdentifier)),
                    },
                ],
            };
        }
        if (measures.length === 1 && isEmpty(stackBy)) {
            if (viewBy.length >= 2) {
                return {
                    defaultSort,
                    availableSorts: [
                        {
                            itemId: localIdRef(viewBy[0].localIdentifier),
                            attributeSort: {
                                normalSortEnabled: true,
                                areaSortEnabled: true,
                            },
                        },
                    ],
                };
            }
            if (viewBy.length === 1) {
                return {
                    defaultSort,
                    availableSorts: [
                        {
                            itemId: localIdRef(viewBy[0].localIdentifier),
                            attributeSort: {
                                normalSortEnabled: true,
                                areaSortEnabled: false,
                            },
                            metricSorts: measures.map((m) => newMeasureSortSuggestion(m.localIdentifier)),
                        },
                    ],
                };
            }
        }
        if (measures.length > 0 && viewBy.length === 1 && (stackBy.length === 1 || canSortStackTotal)) {
            return {
                defaultSort,
                availableSorts: [
                    {
                        itemId: localIdRef(viewBy[0].localIdentifier),
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: true,
                        },
                        metricSorts: isEmpty(stackBy)
                            ? measures.map((m) => newMeasureSortSuggestion(m.localIdentifier))
                            : [],
                    },
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
        return viewBy.length < 1 || measures.length < 1 || availableSorts.length === 0;
    }
}
