// (C) 2019 GoodData Corporation
import { render } from "react-dom";
import React = require("react");
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import * as BucketNames from "../../../../constants/bucketNames";

import { IVisConstruct, IReferencePoint, IExtendedReferencePoint } from "../../../interfaces/Visualization";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import PieChartConfigurationPanel from "../../configurationPanels/PieChartConfigurationPanel";
import { BUCKETS } from "../../../constants/bucket";
import { PIECHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";

import {
    DEFAULT_PIE_UICONFIG,
    PIE_UICONFIG_WITH_MULTIPLE_METRICS,
    PIE_UICONFIG_WITH_ONE_METRIC,
    UICONFIG,
} from "../../../constants/uiConfig";

import {
    sanitizeUnusedFilters,
    getMeasureItems,
    getAttributeItems,
    removeAllDerivedMeasures,
    removeAllArithmeticMeasuresFromDerived,
    limitNumberOfMeasuresInBuckets,
} from "../../../utils/bucketHelper";

import { setPieChartUiConfig } from "../../../utils/uiConfigHelpers/pieChartUiConfigHelper";
import { removeSort } from "../../../utils/sort";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

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

        const buckets = get(clonedReferencePoint, BUCKETS, []);
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
                <PieChartConfigurationPanel
                    locale={this.locale}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    mdObject={this.mdObject}
                    pushData={this.handlePushData}
                    colors={this.colors}
                    type={this.type}
                    isError={this.isError}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    references={this.references}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
