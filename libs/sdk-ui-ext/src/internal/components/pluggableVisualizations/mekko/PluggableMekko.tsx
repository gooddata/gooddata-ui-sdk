// (C) 2026 GoodData Corporation

import { cloneDeep, isEmpty } from "lodash-es";

import { type ISortItem, newAttributeSort } from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { BUCKETS } from "../../../constants/bucket.js";
import { MEKKO_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_MEKKO_UICONFIG } from "../../../constants/uiConfig.js";
import { type ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import {
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    getBucketItems,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { setMekkoUiConfig } from "../../../utils/uiConfigHelpers/mekkoUiConfigHelper.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

import { transformBuckets } from "./bucketHelper.js";

/**
 * PluggableMekko
 *
 * ## Buckets
 *
 * | Name             | Id                 | Accepts             |
 * |------------------|--------------------|---------------------|
 * | Metric (Width)   | measures           | measures only       |
 * | Metric (Height)  | secondary_measures | measures only       |
 * | ViewBy           | view               | attributes or dates |
 * | StackBy          | stack              | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |Width|  ≤ 1
 * - |Height| ≤ 1
 * - |ViewBy| ≤ 1
 * - |StackBy| ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableMekko always creates a two dimensional execution:
 *
 * - [[StackBy], [ViewBy, MeasureGroupIdentifier]]
 */
export class PluggableMekko extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.MEKKO;
        this.supportedPropertiesList = MEKKO_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const uiConfig = cloneDeep(DEFAULT_MEKKO_UICONFIG);

        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig,
        };

        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        newReferencePoint[BUCKETS] = transformBuckets(newReferencePoint.buckets);

        newReferencePoint = setMekkoUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, true);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = sanitizeFilters(newReferencePoint, clonedReferencePoint);

        return Promise.resolve(newReferencePoint);
    }

    public override getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;

        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        // Both metric buckets can drive a measure sort of the columns.
        const measures = [
            ...getBucketItems(buckets, BucketNames.MEASURES),
            ...getBucketItems(buckets, BucketNames.SECONDARY_MEASURES),
        ];

        // Sorting needs a column attribute and at least one measure to sort by.
        const disabled = isEmpty(viewBy) || isEmpty(measures);

        // Sort by the single view-by attribute; use viewBy[0] to stay consistent with availableSorts.
        const defaultSort: ISortItem[] = viewBy
            .slice(0, 1)
            .map((vb) => newAttributeSort(vb.localIdentifier, "asc"));

        const availableSorts = disabled
            ? []
            : [
                  newAvailableSortsGroup(
                      viewBy[0].localIdentifier,
                      // with stacked segments a measure sort locator no longer matches the execution
                      // dimensions and the backend rejects it — only area sort applies then
                      isEmpty(stackBy) ? measures.map((m) => m.localIdentifier) : [],
                      true,
                      // area sort (by the stacked total) only makes sense with stacked segments
                      !isEmpty(stackBy),
                  ),
              ];

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
        });
    }
}
