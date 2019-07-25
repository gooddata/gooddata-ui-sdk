// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import set = require("lodash/set");
import * as BucketNames from "../../../constants/bucketNames";
import { PluggableBaseChart } from "./baseChart/PluggableBaseChart";
import { AXIS } from "../../constants/axis";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IBucket,
} from "../../interfaces/Visualization";
import {
    getFilteredMeasuresForStackedCharts,
    getStackItems,
    isDate,
    getAllCategoriesAttributeItems,
    getDateItems,
    isNotDate,
} from "../../utils/bucketHelper";
import { MAX_STACKS_COUNT, UICONFIG_AXIS, UICONFIG, MAX_CATEGORIES_COUNT } from "../../constants/uiConfig";
import {
    getReferencePointWithSupportedProperties,
    setSecondaryMeasures,
    removeImmutableOptionalStackingProperties,
    isStackingMeasure,
    isStackingToPercent,
} from "../../utils/propertiesHelper";
import { setColumnBarChartUiConfig } from "../../utils/uiConfigHelpers/columnBarChartUiConfigHelper";
import { haveManyViewItems } from "../../utils/mdObjectHelper";
import { BUCKETS } from "../../constants/bucket";

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
            !haveManyViewItems(this.mdObject) &&
            !isStackingMeasure(this.visualizationProperties) &&
            !isStackingToPercent(this.visualizationProperties)
        );
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const buckets: IBucket[] = get(extendedReferencePoint, BUCKETS, []);
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const dateItems = getDateItems(buckets);
        const categoriesCount: number = get(
            extendedReferencePoint,
            [UICONFIG, BUCKETS, BucketNames.VIEW, "itemsLimit"],
            MAX_CATEGORIES_COUNT,
        );
        const allAttributesWithoutStacks = getAllCategoriesAttributeItems(buckets);
        let views = allAttributesWithoutStacks.slice(0, categoriesCount);
        const hasDateItemInViewByBucket = views.some(isDate);
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
                .filter(isNotDate)
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
