// (C) 2019 GoodData Corporation
import { BucketNames, IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";
import React from "react";
import { render } from "react-dom";
import { AXIS, AXIS_NAME } from "../../../constants/axis";

import { BUCKETS } from "../../../constants/bucket";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { DEFAULT_LINE_UICONFIG, LINE_UICONFIG_WITH_MULTIPLE_DATES } from "../../../constants/uiConfig";
import {
    IBucketItem,
    IDrillDownContext,
    IExtendedReferencePoint,
    IImplicitDrillDown,
    IReferencePoint,
    IVisConstruct,
    IUiConfig,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
    getFistDateItem,
    getMeasureItems,
    getStackItems,
    isDateBucketItem,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import {
    getReferencePointWithSupportedProperties,
    setSecondaryMeasures,
} from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";

import { setLineChartUiConfig } from "../../../utils/uiConfigHelpers/lineChartUiConfigHelper";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil";

export class PluggableLineChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        // set default to DUAL to get the full supported props list
        // and will be updated in getExtendedReferencePoint
        this.axis = AXIS.DUAL;
        this.type = VisualizationTypes.LINE;
        this.supportedPropertiesList = this.getSupportedPropertiesList();
        this.initializeProperties(props.visualizationProperties);
    }

    public getSupportedPropertiesList(): string[] {
        return LINE_CHART_SUPPORTED_PROPERTIES[this.axis];
    }

    private configureBucketsWithMultipleDates(newReferencePoint: IExtendedReferencePoint): void {
        const buckets = newReferencePoint?.buckets ?? [];
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);

        let attributes: IBucketItem[] = [];
        let stacks: IBucketItem[] = getStackItems(buckets);
        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.LOCATION,
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.ATTRIBUTES,
            BucketNames.SEGMENT,
            BucketNames.STACK,
            BucketNames.COLUMNS,
        ]);

        const firstDate = getFistDateItem(buckets);

        if (firstDate) {
            attributes = [firstDate];
            const nextAttribute = allAttributes.find((attr) => attr !== firstDate);

            if (masterMeasures.length <= 1 && nextAttribute) {
                stacks = [nextAttribute];
            }
        } else {
            if (masterMeasures.length <= 1 && allAttributes.length > 1) {
                stacks = allAttributes.slice(1, 2);
            }

            attributes = getAttributeItemsWithoutStacks(buckets).slice(0, 1);
        }

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: getFilteredMeasuresForStackedCharts(buckets),
            },
            {
                localIdentifier: BucketNames.TREND,
                items: attributes,
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: stacks,
            },
        ]);
    }

    protected configureBuckets(newReferencePoint: IExtendedReferencePoint): void {
        if (this.isMultipleDatesEnabled()) {
            this.configureBucketsWithMultipleDates(newReferencePoint);
            return;
        }

        const buckets = newReferencePoint?.buckets ?? [];
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);
        let attributes: IBucketItem[] = [];
        let stacks: IBucketItem[] = getStackItems(buckets);
        const dateItems = getDateItems(buckets);
        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.LOCATION,
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.SEGMENT,
            BucketNames.STACK,
        ]);

        if (dateItems.length) {
            attributes = dateItems.slice(0, 1);
            stacks =
                masterMeasures.length <= 1 && allAttributes.length > 1
                    ? allAttributes
                          .filter((attribute: IBucketItem) => !isDateBucketItem(attribute))
                          .slice(0, 1)
                    : stacks;
        } else {
            if (
                masterMeasures.length <= 1 &&
                allAttributes.length > 1 &&
                !isDateBucketItem(allAttributes?.[1])
            ) {
                stacks = allAttributes.slice(1, 2);
            }

            attributes = getAttributeItemsWithoutStacks(buckets).slice(0, 1);
        }

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: getFilteredMeasuresForStackedCharts(buckets),
            },
            {
                localIdentifier: BucketNames.TREND,
                items: attributes,
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: stacks,
            },
        ]);
    }

    public getUiConfig(): IUiConfig {
        const config = this.isMultipleDatesEnabled()
            ? LINE_UICONFIG_WITH_MULTIPLE_DATES
            : DEFAULT_LINE_UICONFIG;
        return cloneDeep(config);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: this.getUiConfig(),
        };

        this.configureBuckets(newReferencePoint);

        newReferencePoint = setSecondaryMeasures(newReferencePoint, AXIS_NAME.SECONDARY_Y);

        this.axis = newReferencePoint?.uiConfig?.axis ?? AXIS.PRIMARY;
        this.supportedPropertiesList = this.getSupportedPropertiesList();

        newReferencePoint = setLineChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    private addFilters(source: IInsight, drillConfig: IImplicitDrillDown, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
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
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
