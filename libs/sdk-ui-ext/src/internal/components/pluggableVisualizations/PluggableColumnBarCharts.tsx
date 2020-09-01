// (C) 2019 GoodData Corporation
import get from "lodash/get";
import set from "lodash/set";
import {
    IInsight,
    bucketsItems,
    IInsightDefinition,
    insightBuckets,
    bucketsFind,
    IBucket,
    idMatchBucket,
    bucketIsEmpty,
} from "@gooddata/sdk-model";
import { arrayUtils } from "@gooddata/util";
import {
    BucketNames,
    IDrillEvent,
    IDrillEventIntersectionElement,
    getIntersectionPartAfter,
} from "@gooddata/sdk-ui";
import { AXIS } from "../../constants/axis";
import { BUCKETS } from "../../constants/bucket";
import { MAX_CATEGORIES_COUNT, MAX_STACKS_COUNT, UICONFIG, UICONFIG_AXIS } from "../../constants/uiConfig";
import { drillDownFromAttributeLocalId } from "../../utils/ImplicitDrillDownHelper";
import {
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IImplicitDrillDown,
    IDrillDownContext,
} from "../../interfaces/Visualization";
import {
    getAllCategoriesAttributeItems,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
    getStackItems,
    isDateBucketItem,
    isNotDateBucketItem,
} from "../../utils/bucketHelper";
import {
    getReferencePointWithSupportedProperties,
    isStackingMeasure,
    isStackingToPercent,
    removeImmutableOptionalStackingProperties,
    setSecondaryMeasures,
} from "../../utils/propertiesHelper";
import { setColumnBarChartUiConfig } from "../../utils/uiConfigHelpers/columnBarChartUiConfigHelper";
import { PluggableBaseChart } from "./baseChart/PluggableBaseChart";
import { modifyBucketsAttributesForDrillDown, addIntersectionFiltersToInsight } from "./drillDownUtil";

export class PluggableColumnBarCharts extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        // set default to DUAL to get the full supported props list
        // and will be updated in getExtendedReferencePoint
        this.axis = AXIS.DUAL;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        // reset the list to retrieve full 'referencePoint.properties.controls'
        this.supportedPropertiesList = this.getSupportedPropertiesList();
        return super.getExtendedReferencePoint(referencePoint).then((ext: IExtendedReferencePoint) => {
            let newExt = setSecondaryMeasures(ext, this.secondaryAxis);

            this.axis = get(newExt, UICONFIG_AXIS, AXIS.PRIMARY);

            // filter out unnecessary stacking props for some specific cases such as one measure or empty stackBy
            this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
                newExt,
                this.getSupportedPropertiesList(),
            );

            newExt = getReferencePointWithSupportedProperties(newExt, this.supportedPropertiesList);
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
        const hasStackByAttributes = bucketsFind(insightBuckets(source), (bucket: IBucket) => {
            return idMatchBucket(BucketNames.STACK) && !bucketIsEmpty(bucket);
        });

        const intersection = event.drillContext.intersection;
        return hasStackByAttributes ? arrayUtils.shiftArrayRight(intersection) : intersection;
    }

    private addFiltersForColumnBar(source: IInsight, drillConfig: IImplicitDrillDown, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const reorderedIntersection = this.adjustIntersectionForColumnBar(source, event);
        const cutIntersection = getIntersectionPartAfter(reorderedIntersection, clicked);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFiltersForColumnBar(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const buckets: IBucketOfFun[] = get(extendedReferencePoint, BUCKETS, []);
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const dateItems = getDateItems(buckets);
        const categoriesCount: number = get(
            extendedReferencePoint,
            [UICONFIG, BUCKETS, BucketNames.VIEW, "itemsLimit"],
            MAX_CATEGORIES_COUNT,
        );
        const allAttributesWithoutStacks = getAllCategoriesAttributeItems(buckets);
        let views = allAttributesWithoutStacks.slice(0, categoriesCount);
        const hasDateItemInViewByBucket = views.some(isDateBucketItem);
        let stackItemIndex = categoriesCount;
        let stacks = getStackItems(buckets);

        if (dateItems.length && !hasDateItemInViewByBucket) {
            const extraViewItems = allAttributesWithoutStacks.slice(0, categoriesCount - 1);
            views = [dateItems[0], ...extraViewItems];
            stackItemIndex = categoriesCount - 1;
        }

        if (!stacks.length && measures.length <= 1 && allAttributesWithoutStacks.length > stackItemIndex) {
            stacks = allAttributesWithoutStacks
                .slice(stackItemIndex, allAttributesWithoutStacks.length)
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
}

function haveManyViewItems(insight: IInsightDefinition): boolean {
    return bucketsItems(insightBuckets(insight, BucketNames.VIEW)).length > 1;
}
