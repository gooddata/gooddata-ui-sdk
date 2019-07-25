// (C) 2019 GoodData Corporation
import * as React from "react";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import * as BucketNames from "../../../../constants/bucketNames";
import { render } from "react-dom";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisConstruct,
    IBucketItem,
} from "../../../interfaces/Visualization";
import { DEFAULT_LINE_UICONFIG, UICONFIG_AXIS } from "../../../constants/uiConfig";

import { BUCKETS } from "../../../constants/bucket";

import {
    sanitizeUnusedFilters,
    getMeasureItems,
    getAttributeItemsWithoutStacks,
    getStackItems,
    getDateItems,
    getAllAttributeItemsWithPreference,
    isDate,
    filterOutDerivedMeasures,
    getFilteredMeasuresForStackedCharts,
} from "../../../utils/bucketHelper";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel";

import { setLineChartUiConfig } from "../../../utils/uiConfigHelpers/lineChartUiConfigHelper";
import { removeSort } from "../../../utils/sort";
import {
    setSecondaryMeasures,
    getReferencePointWithSupportedProperties,
} from "../../../utils/propertiesHelper";
import { LINE_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

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
                    ? allAttributes.filter((attribute: IBucketItem) => !isDate(attribute)).slice(0, 1)
                    : stacks;
        } else {
            if (masterMeasures.length <= 1 && allAttributes.length > 1 && !isDate(get(allAttributes, "1"))) {
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
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeUnusedFilters(newReferencePoint, clonedReferencePoint));
    }

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <LineChartBasedConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    mdObject={this.mdObject}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.isError}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    axis={this.axis}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
