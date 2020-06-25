// (C) 2019 GoodData Corporation
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import * as React from "react";
import { render } from "react-dom";
import { AXIS, AXIS_NAME } from "../../../constants/axis";

import { BUCKETS } from "../../../constants/bucket";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { DEFAULT_LINE_UICONFIG, UICONFIG_AXIS } from "../../../constants/uiConfig";
import {
    IBucketItem,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    filterOutDerivedMeasures,
    getAllAttributeItemsWithPreference,
    getAttributeItemsWithoutStacks,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
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
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import { IInsightDefinition } from "@gooddata/sdk-model";

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

    public getSupportedPropertiesList() {
        return LINE_CHART_SUPPORTED_PROPERTIES[this.axis];
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_LINE_UICONFIG),
        };

        const buckets = get(clonedReferencePoint, BUCKETS, []);
        const measures = getMeasureItems(buckets);
        const masterMeasures = filterOutDerivedMeasures(measures);
        let attributes: IBucketItem[] = [];
        let stacks: IBucketItem[] = getStackItems(buckets);
        const dateItems = getDateItems(buckets);
        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
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
                !isDateBucketItem(get(allAttributes, "1"))
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

        newReferencePoint = setSecondaryMeasures(newReferencePoint, AXIS_NAME.SECONDARY_Y);

        this.axis = get(newReferencePoint, UICONFIG_AXIS, AXIS.PRIMARY);
        this.supportedPropertiesList = this.getSupportedPropertiesList();

        newReferencePoint = setLineChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags.enableWeekFilters,
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    protected renderConfigurationPanel(insight: IInsightDefinition) {
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
