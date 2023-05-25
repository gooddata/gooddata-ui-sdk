// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { VisualizationTypes, BucketNames } from "@gooddata/sdk-ui";
import { newAttributeSort } from "@gooddata/sdk-model";
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts.js";
import { AXIS, AXIS_NAME } from "../../../constants/axis.js";
import { COLUMN_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { IVisConstruct, IReferencePoint } from "../../../interfaces/Visualization.js";
import { getBucketItems } from "../../../utils/bucketHelper.js";
import { canSortStackTotalValue } from "../barChart/sortHelpers.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import { getCustomSortDisabledExplanation } from "../../../utils/sort.js";

/**
 * PluggableColumnChart
 *
 * ## Buckets
 *
 * | Name     | Id       | Accepts             |
 * |----------|----------|---------------------|
 * | Measures | measures | measures only       |
 * | ViewBy   | view     | attributes or dates |
 * | StackBy  | stack    | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |Measures| ≥ 1
 * - |ViewBy| ≤ 2
 * - |StackBy| ≤ 1
 * - |StackBy| = 1 ⇒ |Measures| ≤ 1
 * - |StackBy| = 0 ⇒ |Measures| ≤ 20
 * - |Measures| ≥ 2 ⇒ |StackBy| = 0
 * - ∀ a, b ∈ ViewBy (isDate(a) ∧ isDate(b) ⇒ dateDataset(a) = dateDataset(b))
 *
 * ## Dimensions
 *
 * The PluggableColumnChart always creates two dimensional execution.
 *
 * - |StackBy| != 0 ⇒ [[StackBy[0]], [...ViewBy, MeasureGroupIdentifier]]
 * - |StackBy| = 0 ⇒ [[MeasureGroupIdentifier], [...ViewBy]]
 *
 * ##  Sorts
 *
 * The PluggableColumnChart does not use any sorts.
 *
 * If "enableChartsSorting" is enabled, the sorts can be changed by the user.
 */
export class PluggableColumnChart extends PluggableColumnBarCharts {
    constructor(props: IVisConstruct) {
        super(props);
        this.secondaryAxis = AXIS_NAME.SECONDARY_Y;
        this.type = VisualizationTypes.COLUMN;
        this.defaultControlsProperties = {
            stackMeasures: false,
        };

        this.initializeProperties(props.visualizationProperties);
    }

    public getSupportedPropertiesList(): string[] {
        return COLUMN_CHART_SUPPORTED_PROPERTIES[this.axis || AXIS.DUAL] || [];
    }

    protected getDefaultAndAvailableSort(
        referencePoint: IReferencePoint,
        canSortStackTotalValue: boolean,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        if (this.isSortDisabled(referencePoint).disabled) {
            return {
                defaultSort: [],
                availableSorts: [],
            };
        }
        const { buckets } = referencePoint;
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const defaultSort = viewBy.map((vb) => newAttributeSort(vb.localIdentifier, "asc"));
        const isStacked = !isEmpty(stackBy) || canSortStackTotalValue;

        if (viewBy.length === 2) {
            if (measures.length >= 2 && !canSortStackTotalValue) {
                return {
                    defaultSort,
                    availableSorts: [
                        newAvailableSortsGroup(viewBy[0].localIdentifier),
                        newAvailableSortsGroup(
                            viewBy[1].localIdentifier,
                            measures.map((m) => m.localIdentifier),
                        ),
                    ],
                };
            }

            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(viewBy[0].localIdentifier),
                    newAvailableSortsGroup(
                        viewBy[1].localIdentifier,
                        isEmpty(stackBy) ? measures.map((m) => m.localIdentifier) : [],
                        true,
                        isStacked || measures.length > 1,
                    ),
                ],
            };
        }

        if (!isEmpty(viewBy) && isStacked) {
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

        if (!isEmpty(viewBy) && !isEmpty(measures)) {
            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        measures.map((m) => m.localIdentifier),
                        true,
                        measures.length > 1,
                    ),
                ],
            };
        }

        return {
            defaultSort: [],
            availableSorts: [],
        };
    }

    private isSortDisabled(referencePoint: IReferencePoint) {
        const { buckets } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const disabled = viewBy.length < 1 || measures.length < 1;
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled,
            disabledExplanation,
        };
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(
            referencePoint,
            canSortStackTotalValue(buckets, properties),
        );

        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint);

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
}
