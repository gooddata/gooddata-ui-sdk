// (C) 2019 GoodData Corporation
import * as React from "react";
import { render } from "react-dom";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import includes = require("lodash/includes");
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import { IReferencePoint, IExtendedReferencePoint, IVisConstruct } from "../../../interfaces/Visualization";

import {
    sanitizeUnusedFilters,
    getMeasures,
    getPreferredBucketItems,
    getAllAttributeItems,
    removeAllDerivedMeasures,
    removeAllArithmeticMeasuresFromDerived,
    limitNumberOfMeasuresInBuckets,
} from "../../../utils/bucketHelper";

import * as BucketNames from "../../../../constants/bucketNames";
import { METRIC, BUCKETS } from "../../../constants/bucket";
import { removeSort } from "../../../utils/sort";
import { setScatterPlotUiConfig } from "../../../utils/uiConfigHelpers/scatterPlotUiConfigHelper";
import { DEFAULT_SCATTERPLOT_UICONFIG } from "../../../constants/uiConfig";
import ScatterPlotConfigurationPanel from "../../configurationPanels/ScatterPlotConfigurationPanel";
import { SCATTERPLOT_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

export class PluggableScatterPlot extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.SCATTER;
        this.supportedPropertiesList = SCATTERPLOT_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_SCATTERPLOT_UICONFIG),
        };

        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        const buckets = limitNumberOfMeasuresInBuckets(clonedReferencePoint.buckets, 2);

        // Check if there are two measure buckets
        const measuresBucketItems = getPreferredBucketItems(buckets, [BucketNames.MEASURES], [METRIC]);
        const secondaryMeasuresBucketItems = getPreferredBucketItems(
            buckets,
            [BucketNames.SECONDARY_MEASURES],
            [METRIC],
        );
        const tertiaryMeasuresBucketItems = getPreferredBucketItems(
            buckets,
            [BucketNames.TERTIARY_MEASURES],
            [METRIC],
        );
        const allMeasures = getMeasures(buckets);

        const measures =
            measuresBucketItems.length > 0
                ? measuresBucketItems.slice(0, 1)
                : allMeasures.filter(measure => !includes(secondaryMeasuresBucketItems, measure)).slice(0, 1);

        const secondaryMeasures =
            secondaryMeasuresBucketItems.length > 0
                ? secondaryMeasuresBucketItems.slice(0, 1)
                : allMeasures
                      .filter(
                          measure =>
                              !includes([...measures, ...tertiaryMeasuresBucketItems.slice(1)], measure),
                      )
                      .slice(0, 1);

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: secondaryMeasures,
            },
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: getAllAttributeItems(buckets).slice(0, 1),
            },
        ]);

        newReferencePoint = setScatterPlotUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, true);
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
                <ScatterPlotConfigurationPanel
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
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
