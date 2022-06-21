// (C) 2019-2022 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";
import React from "react";
import { render } from "react-dom";
import { BUCKETS } from "../../../constants/bucket";
import { SCATTERPLOT_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { DEFAULT_SCATTERPLOT_UICONFIG } from "../../../constants/uiConfig";
import { IExtendedReferencePoint, IReferencePoint, IVisConstruct } from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";
import { setScatterPlotUiConfig } from "../../../utils/uiConfigHelpers/scatterPlotUiConfigHelper";
import ScatterPlotConfigurationPanel from "../../configurationPanels/ScatterPlotConfigurationPanel";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { transformBuckets } from "./bucketHelper";
import cloneDeep from "lodash/cloneDeep";

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
            render(
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
