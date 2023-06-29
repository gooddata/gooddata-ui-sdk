// (C) 2019-2022 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";
import React from "react";
import { BUCKETS } from "../../../constants/bucket.js";
import { SCATTERPLOT_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_SCATTERPLOT_UICONFIG } from "../../../constants/uiConfig.js";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";

import {
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { removeSort } from "../../../utils/sort.js";
import { setScatterPlotUiConfig } from "../../../utils/uiConfigHelpers/scatterPlotUiConfigHelper.js";
import ScatterPlotConfigurationPanel from "../../configurationPanels/ScatterPlotConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { transformBuckets } from "./bucketHelper.js";
import cloneDeep from "lodash/cloneDeep.js";

/**
 * PluggableScatterPlot
 *
 * ## Buckets
 *
 * | Name             | Id                 | Accepts             |
 * |------------------|--------------------|---------------------|
 * | Measure (X-axis) | measures           | measures only       |
 * | Measure (Y-axis) | secondary_measures | measures only       |
 * | ViewBy           | attribute          | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |MeasureX| ≤ 1
 * - |MeasureY| ≤ 1
 * - |ViewBy| ≤ 1
 * - |MeasureX| + |MeasureY| ≥ 1
 *
 * ## Dimensions
 *
 * The PluggableScatterPlot always creates the same two dimensional execution.
 *
 * - ⊤ ⇒ [[...ViewBy], [MeasureGroupIdentifier]]
 *
 * ## Sorts
 *
 * The PluggableScatterPlot does not use any sorts.
 */
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

        newReferencePoint[BUCKETS] = transformBuckets(newReferencePoint.buckets);

        newReferencePoint = setScatterPlotUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, true);
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

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            this.renderFun(
                <ScatterPlotConfigurationPanel
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
                />,
                configPanelElement,
            );
        }
    }
}
