// (C) 2019 GoodData Corporation
import React from "react";
import { render } from "react-dom";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import without from "lodash/without";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { isAreaChart, isLineChart } from "@gooddata/sdk-ui-charts";
import { AXIS, AXIS_NAME } from "../../../constants/axis";

import { BUCKETS, METRIC } from "../../../constants/bucket";
import { PROPERTY_CONTROLS_DUAL_AXIS } from "../../../constants/properties";
import { COMBO_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { COMBO_CHART_UICONFIG } from "../../../constants/uiConfig";
import {
    IBucketItem,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

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
} from "../../../utils/bucketHelper";
import { getMasterMeasuresCount } from "../../../utils/bucketRules";
import {
    getReferencePointWithSupportedProperties,
    isDualAxisOrSomeSecondaryAxisMeasure,
    setSecondaryMeasures,
} from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";

import { setComboChartUiConfig } from "../../../utils/uiConfigHelpers/comboChartUiConfigHelper";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import { insightBuckets, bucketsIsEmpty, IInsightDefinition } from "@gooddata/sdk-model";
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

        this.defaultControlsProperties = {
            stackMeasures: this.isStackMeasuresByDefault(),
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
        newReferencePoint = removeSort(newReferencePoint);

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

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            render(
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
                    }}
                    dataLabelDefaultValue="auto"
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
