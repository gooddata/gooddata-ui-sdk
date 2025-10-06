// (C) 2019-2025 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import {
    IInsight,
    IInsightDefinition,
    bucketIsEmpty,
    bucketsItems,
    insightBucket,
    insightBuckets,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    IDrillEvent,
    IDrillEventIntersectionElement,
    getIntersectionPartAfter,
} from "@gooddata/sdk-ui";
import { arrayUtils } from "@gooddata/util";

import { PluggableBaseChart } from "./baseChart/PluggableBaseChart.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "./drillDownUtil.js";
import { AXIS } from "../../constants/axis.js";
import { ATTRIBUTE, BUCKETS, DATE } from "../../constants/bucket.js";
import {
    COLUMN_BAR_CHART_UICONFIG_WITH_MULTIPLE_DATES,
    MAX_CATEGORIES_COUNT,
    MAX_METRICS_COUNT,
    MAX_STACKS_COUNT,
} from "../../constants/uiConfig.js";
import {
    IBucketItem,
    IBucketOfFun,
    IDrillDownContext,
    IDrillDownDefinition,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
} from "../../interfaces/Visualization.js";
import {
    getAllCategoriesAttributeItems,
    getFilteredMeasuresForStackedCharts,
    getStackItems,
    hasSameDateDimension,
    isDateBucketItem,
    limitNumberOfMeasuresInBuckets,
} from "../../utils/bucketHelper.js";
import { drillDownFromAttributeLocalId } from "../../utils/ImplicitDrillDownHelper.js";
import {
    getReferencePointWithSupportedProperties,
    getReferencePointWithTotalLabelsInitialized,
    isStackingMeasure,
    isStackingToPercent,
    removeImmutableOptionalStackingProperties,
    setSecondaryMeasures,
} from "../../utils/propertiesHelper.js";
import { setColumnBarChartUiConfig } from "../../utils/uiConfigHelpers/columnBarChartUiConfigHelper.js";

export class PluggableColumnBarCharts extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        // set default to DUAL to get the full supported props list
        // and will be updated in getExtendedReferencePoint
        this.axis = AXIS.DUAL;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public override getUiConfig(): IUiConfig {
        return cloneDeep(COLUMN_BAR_CHART_UICONFIG_WITH_MULTIPLE_DATES);
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
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

            newExt = getReferencePointWithTotalLabelsInitialized(
                getReferencePointWithSupportedProperties(newExt, this.supportedPropertiesList),
            );

            return setColumnBarChartUiConfig(newExt, this.intl);
        });
    }

    public override isOpenAsReportSupported(): boolean {
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

    public override getInsightWithDrillDownApplied(
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

    private getBucketMeasures(buckets: IBucketOfFun[] = []) {
        const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, MAX_METRICS_COUNT, true);
        return getFilteredMeasuresForStackedCharts(limitedBuckets);
    }

    protected override configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        this.configureBucketsWithMultipleDates(extendedReferencePoint);
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
        const measures = this.getBucketMeasures(buckets);
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
