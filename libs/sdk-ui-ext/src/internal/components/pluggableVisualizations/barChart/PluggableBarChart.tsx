// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render } from "react-dom";
import isEmpty from "lodash/isEmpty";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IInsightDefinition, newAttributeAreaSort, newMeasureSort, localIdRef } from "@gooddata/sdk-model";
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts";
import { IReferencePoint, IVisConstruct, IVisualizationProperties } from "../../../interfaces/Visualization";
import {
    ISortConfig,
    newAttributeAreaSortSuggestion,
    newAttributeSortSuggestion,
    newMeasureSortSuggestion,
} from "../../../interfaces/SortConfig";
import { BAR_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import BarChartConfigurationPanel from "../../configurationPanels/BarChartConfigurationPanel";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import { getBucketItems } from "../../../utils/bucketHelper";
import { IAxisConfig } from "@gooddata/sdk-ui-charts";

function areAllMeasuresOnSingleAxis(
    buckets: IReferencePoint["buckets"],
    secondaryYAxis: IAxisConfig,
): boolean {
    const measures = getBucketItems(buckets, BucketNames.MEASURES);
    const measureCount = measures.length;
    const numberOfMeasureOnSecondaryAxis = secondaryYAxis.measures?.length ?? 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

function canSortStackTotalValue(
    buckets: IReferencePoint["buckets"],
    supportedControls: IVisualizationProperties,
): boolean {
    const stackMeasures = supportedControls?.stackMeasures ?? false;
    const secondaryAxis: IAxisConfig = supportedControls?.secondary_yaxis ?? { measures: [] };
    const allMeasuresOnSingleAxis = areAllMeasuresOnSingleAxis(buckets, secondaryAxis);

    return stackMeasures && allMeasuresOnSingleAxis;
}

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

    protected getDefaultSort(referencePoint: IReferencePoint, canSortStackTotalValue: boolean): ISortConfig {
        const { buckets } = referencePoint;
        const measures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);

        const common = {
            supported: true,
            disabled: false,
        };

        if (viewBy.length === 2) {
            if (measures.length >= 2 && !canSortStackTotalValue) {
                return {
                    ...common,
                    currentSort: [
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
                ...common,
                currentSort: [
                    newAttributeAreaSort(viewBy[0].localIdentifier, "desc"),
                    newAttributeAreaSort(viewBy[1].localIdentifier, "desc"),
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
                        metricSorts: [...measures.map((m) => newMeasureSortSuggestion(m.localIdentifier))],
                    },
                ],
            };
        }

        if (!isEmpty(viewBy) && !isEmpty(stackBy)) {
            return {
                ...common,
                currentSort: [newAttributeAreaSort(viewBy[0].localIdentifier, "desc")],
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

        if (!isEmpty(viewBy) && canSortStackTotalValue) {
            return {
                ...common,
                currentSort: [newAttributeAreaSort(viewBy[0].localIdentifier, "desc")],
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

        return {
            supported: true,
            disabled: true,
            disabledExplanation: "je to rozbity",
            currentSort: [],
            availableSorts: [],
        };
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const sort = referencePoint.properties.sortItems;
        // TODO INE: when we will convert referencePoint to the Insight we can use existing defaultSort generators instead of this
        const { supported, disabled, currentSort, availableSorts } = this.getDefaultSort(
            referencePoint,
            canSortStackTotalValue(referencePoint.buckets, referencePoint.properties.controls),
        );
        // TODO validate that sort coming from props is actually valid == its parts can be found in available sorts
        const isExternalSortValid = !!sort;
        return Promise.resolve({
            supported,
            disabled,
            currentSort: sort && isExternalSortValid ? sort : currentSort,
            availableSorts,
        });
    }
}
