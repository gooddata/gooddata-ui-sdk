// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { VisualizationTypes, BucketNames } from "@gooddata/sdk-ui";
import { localIdRef, newAttributeSort } from "@gooddata/sdk-model";
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import { COLUMN_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { IVisConstruct, IReferencePoint, IBucketItem } from "../../../interfaces/Visualization";
import { getBucketItems } from "../../../utils/bucketHelper";
import { canSortStackTotalValue } from "../barChart/sortHelpers";
import { newMeasureSortSuggestion, ISortConfig } from "../../../interfaces/SortConfig";
import { getCustomSortDisabledExplanation } from "../../../utils/sort";

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
        measures: IBucketItem[],
        viewBy: IBucketItem[],
        stackBy: IBucketItem[],
        canSortStackTotalValue: boolean,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const defaultSort = viewBy.map((vb) => newAttributeSort(vb.localIdentifier, "asc"));
        const isStacked = !isEmpty(stackBy) || canSortStackTotalValue;

        if (viewBy.length === 2) {
            if (measures.length >= 2 && !canSortStackTotalValue) {
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
                        {
                            itemId: localIdRef(viewBy[1].localIdentifier),
                            attributeSort: {
                                normalSortEnabled: true,
                                areaSortEnabled: true,
                            },
                            metricSorts: [
                                ...measures.map((m) => newMeasureSortSuggestion(m.localIdentifier)),
                            ],
                        },
                    ],
                };
            }

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
                    {
                        itemId: localIdRef(viewBy[1].localIdentifier),
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: isStacked || measures.length > 1,
                        },
                        metricSorts: isEmpty(stackBy)
                            ? [...measures.map((m) => newMeasureSortSuggestion(m.localIdentifier))]
                            : [],
                    },
                ],
            };
        }

        if (!isEmpty(viewBy) && isStacked) {
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
                            ? [...measures.map((m) => newMeasureSortSuggestion(m.localIdentifier))]
                            : [],
                    },
                ],
            };
        }

        if (!isEmpty(viewBy) && !isEmpty(measures)) {
            return {
                defaultSort,
                availableSorts: [
                    {
                        itemId: localIdRef(viewBy[0].localIdentifier),
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: measures.length > 1,
                        },
                        metricSorts: [...measures.map((m) => newMeasureSortSuggestion(m.localIdentifier))],
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
        const disabled = viewBy.length < 1 || measures.length < 1 || availableSorts.length === 0;
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled,
            disabledExplanation,
        };
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties } = referencePoint;
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(
            measures,
            viewBy,
            stackBy,
            canSortStackTotalValue(buckets, properties),
        );

        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint, availableSorts);

        return Promise.resolve({
            supported: true,
            disabled,
            appliedSort: super.reuseCurrentSort(properties, availableSorts, defaultSort),
            defaultSort,
            availableSorts,
            ...(disabledExplanation && { disabledExplanation }),
        });
    }
}
