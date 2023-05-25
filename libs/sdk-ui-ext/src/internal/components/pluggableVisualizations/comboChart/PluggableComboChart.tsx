// (C) 2019-2023 GoodData Corporation
import React from "react";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import without from "lodash/without.js";
import isEmpty from "lodash/isEmpty.js";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartConfig, isAreaChart, isLineChart } from "@gooddata/sdk-ui-charts";
import {
    insightBuckets,
    bucketsIsEmpty,
    IInsightDefinition,
    newAttributeSort,
    insightBucket,
} from "@gooddata/sdk-model";

import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

import { AXIS, AXIS_NAME } from "../../../constants/axis.js";
import { BUCKETS, METRIC } from "../../../constants/bucket.js";
import { PROPERTY_CONTROLS_DUAL_AXIS } from "../../../constants/properties.js";
import { COMBO_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { COMBO_CHART_UICONFIG } from "../../../constants/uiConfig.js";

import {
    IBucketItem,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisualizationProperties,
    IBucketOfFun,
    IVisProps,
} from "../../../interfaces/Visualization.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";

import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import { removeSort, getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import {
    applyUiConfig,
    findBucket,
    getAllAttributeItemsWithPreference,
    getAllMeasuresShowOnSecondaryAxis,
    getBucketItemsByType,
    getBucketItemsWithExcludeByType,
    getMeasureItems,
    hasBucket,
    sanitizeFilters,
    setMeasuresShowOnSecondaryAxis,
    getBucketItems,
} from "../../../utils/bucketHelper.js";
import { getMasterMeasuresCount } from "../../../utils/bucketRules.js";
import {
    getReferencePointWithSupportedProperties,
    isDualAxisOrSomeSecondaryAxisMeasure,
    setSecondaryMeasures,
} from "../../../utils/propertiesHelper.js";
import { setComboChartUiConfig } from "../../../utils/uiConfigHelpers/comboChartUiConfigHelper.js";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel.js";

/**
 * PluggableComboChart
 *
 * ## Buckets
 *
 * | Name                | Id                 | Accepts             |
 * |---------------------|--------------------|---------------------|
 * | Measure (Primary)   | measures           | measures only       |
 * | Measure (Secondary) | secondary_measures | measures only       |
 * | ViewBy              | view               | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |MeasurePrimary| ≤ 20
 * - |MeasureSecondary| ≤ 20
 * - |ViewBy| ≤ 1
 * - |MeasurePrimary| + |MeasureSecondary| ≥ 1
 *
 * ## Dimensions
 *
 * The PluggableComboChart always creates the same two dimensional execution.
 *
 * - ⊤ ⇒ [[MeasureGroupIdentifier], [...ViewBy]]
 *
 * ## Sorts
 *
 * The PluggableComboChart does not use any sorts.
 */
export class PluggableComboChart extends PluggableBaseChart {
    private primaryChartType: string = VisualizationTypes.COLUMN;
    private secondaryChartType: string = VisualizationTypes.COLUMN;

    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.COMBO;
        this.axis = AXIS.DUAL;
        this.secondaryAxis = AXIS_NAME.SECONDARY_Y;

        const propertiesControls = props.visualizationProperties?.controls;

        this.primaryChartType = propertiesControls?.primaryChartType ?? VisualizationTypes.COLUMN;
        this.secondaryChartType = propertiesControls?.secondaryChartType ?? VisualizationTypes.COLUMN;

        this.supportedPropertiesList = this.getSupportedPropertiesList();
        this.defaultControlsProperties = {
            stackMeasures: this.isStackMeasuresByDefault(),
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public getSupportedPropertiesList(): string[] {
        return COMBO_CHART_SUPPORTED_PROPERTIES[this.axis] || [];
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep({
            ...COMBO_CHART_UICONFIG,
            optionalStacking: {
                supported: true,
                disabled: isLineChart(this.primaryChartType),
                stackMeasures: this.isStackMeasuresByDefault(),
            },
        });
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const properties = this.configureChartTypes(clonedReferencePoint);
        this.primaryChartType = properties?.controls?.primaryChartType ?? VisualizationTypes.COLUMN;
        this.secondaryChartType = properties?.controls?.secondaryChartType ?? VisualizationTypes.COLUMN;

        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            properties,
            uiConfig: this.getUiConfig(),
        };

        /**
         * Disable the stackMeasures when there is more than one metric in the primary area chart
         * Highchart won't draw the continuous line for the stacking Area chart.
         * Should not effect the `stack measures` checkbox (on the primary buckets) on AD, it will checked by default
         * if there is more than one metric
         */
        const isMoreThanOneMeasure =
            findBucket(referencePoint.buckets, BucketNames.MEASURES)?.items.length > 1;
        this.defaultControlsProperties = {
            stackMeasures: this.isStackMeasuresByDefault() && isMoreThanOneMeasure,
        };

        this.configureBuckets(newReferencePoint);
        newReferencePoint = setSecondaryMeasures(newReferencePoint, this.secondaryAxis);

        this.axis = newReferencePoint?.uiConfig?.axis ?? AXIS.PRIMARY;

        this.supportedPropertiesList = this.getSupportedPropertiesList();

        newReferencePoint = setComboChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, this.isPercentDisabled(newReferencePoint));
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = applyUiConfig(newReferencePoint);
        if (!this.featureFlags.enableChartsSorting) {
            newReferencePoint = removeSort(newReferencePoint);
        }

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public isStackMeasuresByDefault(): boolean {
        return isAreaChart(this.primaryChartType);
    }

    protected configureBuckets(extReferencePoint: IExtendedReferencePoint): void {
        const buckets = extReferencePoint?.buckets ?? [];
        const attributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.TREND,
            BucketNames.VIEW,
        ]).slice(0, 1);

        let measures: IBucketItem[] = [];
        let secondaryMeasures: IBucketItem[] = [];

        // ref. point has both my buckets -> reuse them fully
        if (hasBucket(buckets, BucketNames.MEASURES) && hasBucket(buckets, BucketNames.SECONDARY_MEASURES)) {
            measures = getBucketItemsByType(buckets, BucketNames.MEASURES, [METRIC]);
            secondaryMeasures = getBucketItemsByType(buckets, BucketNames.SECONDARY_MEASURES, [METRIC]);

            const restMeasures = getBucketItemsWithExcludeByType(
                buckets,
                [BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES],
                [METRIC],
            );
            secondaryMeasures = secondaryMeasures.concat(restMeasures);
        } else {
            // transform from dual axis chart to combo chart
            const allMeasures = getMeasureItems(buckets);
            secondaryMeasures = getAllMeasuresShowOnSecondaryAxis(buckets);
            measures = without(allMeasures, ...secondaryMeasures);
        }

        const isDualAxisEnabled = isDualAxisOrSomeSecondaryAxisMeasure(extReferencePoint, secondaryMeasures);

        set(extReferencePoint, PROPERTY_CONTROLS_DUAL_AXIS, isDualAxisEnabled);

        const primaryChartType =
            extReferencePoint?.properties?.controls?.primaryChartType ?? VisualizationTypes.COLUMN;
        const secondaryChartType =
            extReferencePoint?.properties?.controls?.secondaryChartType ?? VisualizationTypes.LINE;

        set(extReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: setMeasuresShowOnSecondaryAxis(measures, false),
                chartType: primaryChartType,
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: setMeasuresShowOnSecondaryAxis(secondaryMeasures, isDualAxisEnabled),
                chartType: secondaryChartType,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: attributes,
            },
        ]);
    }

    protected buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IChartConfig {
        const baseVisualizationConfig = super.buildVisualizationConfig(options, supportedControls);
        const { stackMeasures, continuousLine } = baseVisualizationConfig;
        /**
         * stackMeasures and continuousLine.enabled can't be the same true. If the stackMeasures is true
         * and the continuous line enabled, we must check the stackMeasures has already true or not.
         */
        if (stackMeasures && stackMeasures === continuousLine?.enabled) {
            return {
                ...baseVisualizationConfig,
                stackMeasures: this.hasStackingAreaChart(this.currentInsight),
            };
        }
        return baseVisualizationConfig;
    }

    private configureChartTypes(referencePoint: IReferencePoint): IVisualizationProperties {
        const buckets = referencePoint?.buckets ?? [];
        const controls = referencePoint?.properties?.controls ?? {};
        const primaryChartType =
            findBucket(buckets, BucketNames.MEASURES)?.chartType ??
            (controls.primaryChartType || VisualizationTypes.COLUMN);
        const secondaryChartType =
            findBucket(buckets, BucketNames.SECONDARY_MEASURES)?.chartType ??
            (controls.secondaryChartType || VisualizationTypes.LINE);

        if (primaryChartType || secondaryChartType) {
            return {
                ...referencePoint.properties,
                controls: {
                    ...controls,
                    primaryChartType,
                    secondaryChartType,
                },
            };
        }

        return referencePoint.properties;
    }

    private isPercentDisabled(extReferencePoint: IExtendedReferencePoint): boolean {
        if (this.axis === AXIS.DUAL) {
            return false;
        }

        const buckets = extReferencePoint?.buckets ?? [];
        const primaryMasterMeasures: number = getMasterMeasuresCount(buckets, BucketNames.MEASURES);
        const secondaryMasterMeasures: number = getMasterMeasuresCount(
            buckets,
            BucketNames.SECONDARY_MEASURES,
        );

        // disable percent if there is more than one measure on primary/secondary y-axis
        return primaryMasterMeasures + secondaryMasterMeasures > 1;
    }

    private isDataPointsControlDisabled(insight: IInsightDefinition): boolean {
        const measureBucketsOfNonColumnCharts = [
            [this.primaryChartType, BucketNames.MEASURES],
            [this.secondaryChartType, BucketNames.SECONDARY_MEASURES],
        ]
            .filter(([chartType]) => chartType !== VisualizationTypes.COLUMN)
            .map(([, bucketId]) => insightBuckets(insight, bucketId));

        return (
            measureBucketsOfNonColumnCharts.length === 0 ||
            measureBucketsOfNonColumnCharts.every((bucket) => bucketsIsEmpty(bucket))
        );
    }

    private hasStackingAreaChart(insight: IInsightDefinition): boolean {
        const isStackingMeasures = this.visualizationProperties?.controls?.stackMeasures;
        if (typeof isStackingMeasures === "undefined") {
            const buckets = insightBucket(insight, BucketNames.MEASURES);
            return isAreaChart(this.primaryChartType) && buckets?.items.length > 1;
        }
        return isStackingMeasures;
    }

    private isContinuousLineControlDisabled(insight: IInsightDefinition): boolean {
        const measureBucketsOfLineCharts = [
            [this.primaryChartType, BucketNames.MEASURES],
            [this.secondaryChartType, BucketNames.SECONDARY_MEASURES],
        ]
            .filter(
                ([chartType]) =>
                    chartType === VisualizationTypes.LINE || chartType === VisualizationTypes.AREA,
            )
            .map(([, bucketId]) => insightBuckets(insight, bucketId));

        return (
            measureBucketsOfLineCharts.length === 0 ||
            measureBucketsOfLineCharts.every((bucket) => bucketsIsEmpty(bucket)) ||
            this.hasStackingAreaChart(insight)
        );
    }

    protected getDefaultAndAvailableSort(buckets: IBucketOfFun[]): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const measures = getBucketItemsByType(buckets, BucketNames.MEASURES, [METRIC]);
        const secondaryMeasures = getBucketItemsByType(buckets, BucketNames.SECONDARY_MEASURES, [METRIC]);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);

        const defaultSort = viewBy.map((vb) => newAttributeSort(vb.localIdentifier, "asc"));

        if (!isEmpty(viewBy) && (!isEmpty(measures) || !isEmpty(secondaryMeasures))) {
            const mergedMeasures = [...measures, ...secondaryMeasures];

            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        mergedMeasures.map((m) => m.localIdentifier),
                        true,
                        mergedMeasures.length > 1,
                    ),
                ],
            };
        }

        return {
            defaultSort: [],
            availableSorts: [],
        };
    }

    private isSortDisabled(
        referencePoint: IReferencePoint,
        availableSorts: ISortConfig["availableSorts"],
    ): {
        disabled: boolean;
        disabledExplanation: string;
    } {
        const { buckets } = referencePoint;
        const measures = getBucketItemsByType(buckets, BucketNames.MEASURES, [METRIC]);
        const secondaryMeasures = getBucketItemsByType(buckets, BucketNames.SECONDARY_MEASURES, [METRIC]);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const disabled =
            viewBy.length < 1 ||
            availableSorts.length === 0 ||
            (measures.length < 1 && secondaryMeasures.length < 1);
        const disabledExplanation = getCustomSortDisabledExplanation(
            [...measures, ...secondaryMeasures],
            viewBy,
            this.intl,
        );

        return {
            disabled,
            disabledExplanation,
        };
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;

        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(buckets);
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
                <LineChartBasedConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                    panelConfig={{
                        isDataPointsControlDisabled: this.isDataPointsControlDisabled(insight),
                        isContinuousLineControlDisabled: this.isContinuousLineControlDisabled(insight),
                    }}
                    dataLabelDefaultValue="auto"
                />,
                configPanelElement,
            );
        }
    }
}
