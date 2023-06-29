// (C) 2019-2022 GoodData Corporation
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";
import {
    bucketIsEmpty,
    bucketsItems,
    IInsight,
    IInsightDefinition,
    insightBucket,
    insightBuckets,
} from "@gooddata/sdk-model";
import { arrayUtils } from "@gooddata/util";
import {
    BucketNames,
    getIntersectionPartAfter,
    IDrillEvent,
    IDrillEventIntersectionElement,
} from "@gooddata/sdk-ui";
import { AXIS } from "../../constants/axis.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";
import {
    COLUMN_BAR_CHART_UICONFIG,
    COLUMN_BAR_CHART_UICONFIG_WITH_MULTIPLE_DATES,
    MAX_CATEGORIES_COUNT,
    MAX_STACKS_COUNT,
} from "../../constants/uiConfig.js";
import { drillDownFromAttributeLocalId } from "../../utils/ImplicitDrillDownHelper.js";
import {
    IBucketItem,
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IDrillDownDefinition,
} from "../../interfaces/Visualization.js";
import {
    getAllCategoriesAttributeItems,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
    getMainDateItem,
    getStackItems,
    removeDivergentDateItems,
    isDateBucketItem,
    isNotDateBucketItem,
    hasSameDateDimension,
} from "../../utils/bucketHelper.js";
import {
    getReferencePointWithSupportedProperties,
    isStackingMeasure,
    isStackingToPercent,
    removeImmutableOptionalStackingProperties,
    setSecondaryMeasures,
    getReferencePointWithTotalLabelsInitialized,
} from "../../utils/propertiesHelper.js";
import { setColumnBarChartUiConfig } from "../../utils/uiConfigHelpers/columnBarChartUiConfigHelper.js";
import { PluggableBaseChart } from "./baseChart/PluggableBaseChart.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "./drillDownUtil.js";
export class PluggableColumnBarCharts extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        // set default to DUAL to get the full supported props list
        // and will be updated in getExtendedReferencePoint
        this.axis = AXIS.DUAL;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public getUiConfig(): IUiConfig {
        const config = this.isMultipleDatesEnabled()
            ? COLUMN_BAR_CHART_UICONFIG_WITH_MULTIPLE_DATES
            : COLUMN_BAR_CHART_UICONFIG;
        return cloneDeep(config);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        // reset the list to retrieve full 'referencePoint.properties.controls'
        this.supportedPropertiesList = this.getSupportedPropertiesList();
        return super.getExtendedReferencePoint(referencePoint).then((ext: IExtendedReferencePoint) => {
            let newExt = setSecondaryMeasures(ext, this.secondaryAxis);

            this.axis = newExt?.uiConfig?.axis ?? AXIS.PRIMARY;

            // filter out unnecessary stacking props for some specific cases such as one measure or empty stackBy
            this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
                newExt,
                this.getSupportedPropertiesList(),
            );

            newExt = getReferencePointWithSupportedProperties(newExt, this.supportedPropertiesList);
            if (this.featureFlags.enableSeparateTotalLabels) {
                newExt = getReferencePointWithTotalLabelsInitialized(newExt);
            }

            return setColumnBarChartUiConfig(newExt, this.intl);
        });
    }

    public isOpenAsReportSupported(): boolean {
        return (
            super.isOpenAsReportSupported() &&
            !haveManyViewItems(this.currentInsight) &&
            !isStackingMeasure(this.visualizationProperties) &&
            !isStackingToPercent(this.visualizationProperties)
        );
    }

    private adjustIntersectionForColumnBar(
        source: IInsight,
        event: IDrillEvent,
    ): IDrillEventIntersectionElement[] {
        const stackBucket = insightBucket(source, BucketNames.STACK);
        const hasStackByAttributes = stackBucket && !bucketIsEmpty(stackBucket);

        const intersection = event.drillContext.intersection;
        return hasStackByAttributes ? arrayUtils.shiftArrayRight(intersection) : intersection;
    }

    private addFiltersForColumnBar(
        source: IInsight,
        drillConfig: IDrillDownDefinition,
        event: IDrillEvent,
        backendSupportsElementUris: boolean,
    ) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const reorderedIntersection = this.adjustIntersectionForColumnBar(source, event);
        const cutIntersection = getIntersectionPartAfter(reorderedIntersection, clicked);
        return addIntersectionFiltersToInsight(source, cutIntersection, backendSupportsElementUris);
    }

    public getInsightWithDrillDownApplied(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const withFilters = this.addFiltersForColumnBar(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
            backendSupportsElementUris,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        if (this.isMultipleDatesEnabled()) {
            this.configureBucketsWithMultipleDates(extendedReferencePoint);
            return;
        }

        const buckets = extendedReferencePoint?.buckets ?? [];
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const dateItems = getDateItems(buckets);
        const mainDateItem = getMainDateItem(dateItems);
        const categoriesCount =
            extendedReferencePoint.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT;
        const allAttributesWithoutStacks = getAllCategoriesAttributeItems(buckets);
        const allAttributesWithoutStacksWithDatesHandled = removeDivergentDateItems(
            allAttributesWithoutStacks,
            mainDateItem,
        );
        let views = allAttributesWithoutStacksWithDatesHandled.slice(0, categoriesCount);
        const hasDateItemInViewByBucket = views.some(isDateBucketItem);
        let stackItemIndex = categoriesCount;
        let stacks = getStackItems(buckets);

        if (dateItems.length && !hasDateItemInViewByBucket) {
            const extraViewItems = allAttributesWithoutStacksWithDatesHandled.slice(0, categoriesCount - 1);
            views = [mainDateItem, ...extraViewItems];
            stackItemIndex = categoriesCount - 1;
        }

        const hasSomeRemainingAttributes = allAttributesWithoutStacksWithDatesHandled.length > stackItemIndex;

        if (!stacks.length && measures.length <= 1 && hasSomeRemainingAttributes) {
            stacks = allAttributesWithoutStacksWithDatesHandled
                .slice(stackItemIndex, allAttributesWithoutStacksWithDatesHandled.length)
                .filter(isNotDateBucketItem)
                .slice(0, MAX_STACKS_COUNT);
        }

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

    private configureBucketsWithMultipleDates(extendedReferencePoint: IExtendedReferencePoint): void {
        const { measures, views, stacks } = this.getMeasuresViewStackBucketItems(extendedReferencePoint);

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

    private canPutAttributeToViewBy(
        currentAttribute: IBucketItem,
        firstAttribute: IBucketItem,
        viewByCount: number,
        viewByMaxItemCount: number,
    ) {
        const isFirstAttributeDate = isDateBucketItem(firstAttribute);
        const isCurrentAttributeDate = isDateBucketItem(currentAttribute);
        const sameDateDimension = hasSameDateDimension(firstAttribute, currentAttribute);

        return (
            (!isFirstAttributeDate || !isCurrentAttributeDate || sameDateDimension) &&
            viewByCount < viewByMaxItemCount
        );
    }

    private getMeasuresViewStackBucketItems(extendedReferencePoint: IExtendedReferencePoint): {
        measures: IBucketItem[];
        views: IBucketItem[];
        stacks: IBucketItem[];
    } {
        const buckets = extendedReferencePoint?.buckets ?? [];
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const viewByMaxItemCount = this.getViewByMaxItemCount(extendedReferencePoint);
        const stackByMaxItemCount = this.getStackByMaxItemCount(extendedReferencePoint);
        const allAttributesWithoutStacks = getAllCategoriesAttributeItems(buckets);
        const stacks: IBucketItem[] = getStackItems(buckets, [ATTRIBUTE, DATE]);

        const [firstAttribute, ...remainingAttributes] = allAttributesWithoutStacks;

        const views: IBucketItem[] = firstAttribute ? [firstAttribute] : [];
        const possibleStacks: IBucketItem[] = [];

        for (const currentAttribute of remainingAttributes) {
            const canPutToViewBy = this.canPutAttributeToViewBy(
                currentAttribute,
                firstAttribute,
                views.length,
                viewByMaxItemCount,
            );

            if (canPutToViewBy) {
                views.push(currentAttribute);
            } else {
                possibleStacks.push(currentAttribute);
            }
        }

        if (!stacks.length && measures.length <= 1) {
            const finalStacks = [...stacks, ...possibleStacks].slice(0, stackByMaxItemCount);
            return { measures, views, stacks: finalStacks };
        }

        return { measures, views, stacks };
    }

    private getViewByMaxItemCount(extendedReferencePoint: IExtendedReferencePoint): number {
        return (
            extendedReferencePoint.uiConfig?.buckets?.[BucketNames.VIEW]?.itemsLimit ?? MAX_CATEGORIES_COUNT
        );
    }

    private getStackByMaxItemCount(extendedReferencePoint: IExtendedReferencePoint): number {
        return extendedReferencePoint.uiConfig?.buckets?.[BucketNames.STACK]?.itemsLimit ?? MAX_STACKS_COUNT;
    }
}

function haveManyViewItems(insight: IInsightDefinition): boolean {
    return bucketsItems(insightBuckets(insight, BucketNames.VIEW)).length > 1;
}
