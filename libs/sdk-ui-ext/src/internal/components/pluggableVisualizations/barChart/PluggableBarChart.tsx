// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render } from "react-dom";
import isEmpty from "lodash/isEmpty";

import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IInsightDefinition, localIdRef, newAttributeAreaSort, newMeasureSort } from "@gooddata/sdk-model";
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts";
import { IReferencePoint, IVisConstruct } from "../../../interfaces/Visualization";
import { BAR_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import BarChartConfigurationPanel from "../../configurationPanels/BarChartConfigurationPanel";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import { ISortConfig, newMeasureSortSuggestion } from "../../../interfaces/SortConfig";
import { getBucketItems } from "../../../utils/bucketHelper";
import { canSortStackTotalValue } from "./sortHelpers";
import { validateCurrentSort } from "../../../utils/sort";

/**
 * PluggableBarChart
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
 * The PluggableBarChart always creates two dimensional execution.
 *
 * - |StackBy| != 0 ⇒ [[StackBy[0]], [...ViewBy, MeasureGroupIdentifier]]
 * - |StackBy| = 0 ⇒ [[MeasureGroupIdentifier], [...ViewBy]]
 *
 * ## Sorts
 *
 * Unless the user specifies otherwise, the sorts used by default are:
 *
 * - |ViewBy| = 2 ∧ |Measures| ≥ 2 ∧ ¬stackMeasures ⇒ [attributeAreaSort(ViewBy[0]), measureSort(Measures[0])]
 * - |ViewBy| = 2 ∧ ¬(|Measures| ≥ 2 ∧ ¬stackMeasures) ⇒ [attributeAreaSort(ViewBy[0]), attributeAreaSort(ViewBy[1])]
 * - |ViewBy| = 1 ∧ (|StackBy| = 1 ∨ stackMeasures) ⇒ [attributeAreaSort(ViewBy[0])]
 * - |ViewBy| = 1 ∧ ¬(|StackBy| = 1 ∨ stackMeasures) ∧ |Measures| ≥ 1 ⇒ [measureSort(Measures[0])]
 *
 * In any other case the sorts are not used.
 *
 * If "enableChartsSorting" is enabled, the sorts can be changed by the user.
 */
export class PluggableBarChart extends PluggableColumnBarCharts {
    constructor(props: IVisConstruct) {
        super(props);
        this.secondaryAxis = AXIS_NAME.SECONDARY_X;
        this.type = VisualizationTypes.BAR;
        this.defaultControlsProperties = {
            stackMeasures: false,
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public getSupportedPropertiesList(): string[] {
        return BAR_CHART_SUPPORTED_PROPERTIES[this.axis || AXIS.DUAL] || [];
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <BarChartConfigurationPanel
                    locale={this.locale}
                    colors={this.colors}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    protected getDefaultAndAvailableSort(
        referencePoint: IReferencePoint,
        canSortStackTotalValue: boolean,
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const { buckets } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const isStacked = !isEmpty(stackBy) || canSortStackTotalValue;

        if (viewBy.length === 2 && !isEmpty(measures)) {
            if (measures.length >= 2 && !canSortStackTotalValue) {
                return {
                    defaultSort: [
                        newAttributeAreaSort(viewBy[0].localIdentifier, "desc"),
                        newMeasureSort(measures[0].localIdentifier, "desc"),
                    ],
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
                defaultSort: [
                    newAttributeAreaSort(viewBy[0].localIdentifier, "desc"),
                    isStacked
                        ? newAttributeAreaSort(viewBy[1].localIdentifier, "desc")
                        : newMeasureSort(measures[0].localIdentifier, "desc"),
                ],
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
                defaultSort: [newAttributeAreaSort(viewBy[0].localIdentifier, "desc")],
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
                defaultSort: [newMeasureSort(measures[0].localIdentifier, "desc")],
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
    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties } = referencePoint;
        const currentSort = properties && properties.sortItems;
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(
            referencePoint,
            canSortStackTotalValue(buckets, properties),
        );
        const keptCurrentSort = validateCurrentSort(currentSort, availableSorts, defaultSort);
        const disabled = viewBy.length < 1 || measures.length < 1 || availableSorts.length === 0;
        return Promise.resolve({
            supported: true,
            disabled,
            appliedSort: currentSort && currentSort.length ? keptCurrentSort : [],
            defaultSort,
            availableSorts: availableSorts,
        });
    }
}
