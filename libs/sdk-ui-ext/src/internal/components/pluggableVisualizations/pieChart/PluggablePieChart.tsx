// (C) 2019-2022 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartConfig, TOP } from "@gooddata/sdk-ui-charts";
import { IInsightDefinition, newMeasureSort } from "@gooddata/sdk-model";

import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import PieChartConfigurationPanel from "../../configurationPanels/PieChartConfigurationPanel.js";

import { BUCKETS } from "../../../constants/bucket.js";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { PIECHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import {
    DEFAULT_PIE_UICONFIG,
    PIE_UICONFIG_WITH_MULTIPLE_METRICS,
    PIE_UICONFIG_WITH_ONE_METRIC,
    UICONFIG,
} from "../../../constants/uiConfig.js";

import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    IBucketItem,
} from "../../../interfaces/Visualization.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";

import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    getAttributeItems,
    getMeasureItems,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
    getBucketItems,
} from "../../../utils/bucketHelper.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { removeSort, getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { setPieChartUiConfig } from "../../../utils/uiConfigHelpers/pieChartUiConfigHelper.js";

/**
 * PluggablePieChart
 *
 * ## Buckets
 *
 * | Name     | Id       | Accepts             |
 * |----------|----------|---------------------|
 * | Measures | measures | measures only       |
 * | ViewBy   | view     | attribute or date   |
 *
 * ### Bucket axioms
 *
 * - |ViewBy| ≤ 1
 * - |Measures| ≥ 1 ∧ ≤ 20
 * - |ViewBy| = 1 ⇒ |Measures| = 1
 * - |ViewBy| = 0 ⇒ |Measures| ≥ 1
 *
 * ## Dimensions
 *
 * The PluggablePieChart always creates two dimensional execution.
 *
 * With measures only:
 * - [[], [MeasureGroupIdentifier]]
 * With viewBy:
 * - [[MeasureGroupIdentifier], [ViewBy]]
 *
 * ## Default sorts
 *
 * When Pie Chart is used with measures only, it's sorted by their order by default.
 * When Pie Chart chart is used with viewBy attribute or date, it's sorted by the values of the measure by default.
 *
 * Default sort behavior can be overriden by sortBy option.
 *
 */
export class PluggablePieChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.PIE;

        this.supportedPropertiesList = PIECHART_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_PIE_UICONFIG),
        };
        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        const buckets = clonedReferencePoint?.buckets ?? [];
        const attributes = getAttributeItems(buckets);

        if (attributes.length) {
            const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, 1);
            const limitedMeasures = getMeasureItems(limitedBuckets);
            set(newReferencePoint, BUCKETS, [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: limitedMeasures,
                },
                {
                    localIdentifier: BucketNames.VIEW,
                    items: attributes.slice(0, 1),
                },
            ]);
        } else {
            const measures = getMeasureItems(buckets);
            if (measures.length > 1) {
                set(newReferencePoint, UICONFIG, cloneDeep(PIE_UICONFIG_WITH_MULTIPLE_METRICS));
            } else {
                set(newReferencePoint, UICONFIG, cloneDeep(PIE_UICONFIG_WITH_ONE_METRIC));
            }

            set(newReferencePoint, BUCKETS, [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: measures,
                },
                {
                    localIdentifier: BucketNames.VIEW,
                    items: [],
                },
            ]);
        }

        newReferencePoint = setPieChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
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

    protected getDefaultAndAvailableSort(
        measures: IBucketItem[],
        viewBy: IBucketItem[],
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        if (!isEmpty(measures) && !isEmpty(viewBy)) {
            return {
                defaultSort: [newMeasureSort(measures[0].localIdentifier, "desc")],
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        [measures[0].localIdentifier],
                        true,
                        false,
                    ),
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
        const measures = getMeasureItems(buckets);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const disabled = viewBy.length < 1 || measures.length < 1 || availableSorts.length === 0;
        const disabledExplanation = getCustomSortDisabledExplanation(measures, viewBy, this.intl);
        return {
            disabled,
            disabledExplanation,
        };
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;
        const measures = getMeasureItems(buckets);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(measures, viewBy);

        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint, availableSorts);

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

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            this.renderFun(
                <PieChartConfigurationPanel
                    locale={this.locale}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    pushData={this.handlePushData}
                    colors={this.colors}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    references={this.references}
                />,
                configPanelElement,
            );
        }
    }

    protected buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IChartConfig {
        const baseVisualizationConfig = super.buildVisualizationConfig(options, supportedControls);
        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            return {
                ...baseVisualizationConfig,
                chart: {
                    verticalAlign: TOP,
                },
            };
        }
        return baseVisualizationConfig;
    }
}
