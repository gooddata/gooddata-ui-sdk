// (C) 2019-2026 GoodData Corporation

import { type IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationTypes } from "@gooddata/sdk-ui";

import {
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
    type IVisProps,
} from "../../../interfaces/Visualization.js";
import { setPyramidChartUiConfig } from "../../../utils/uiConfigHelpers/pyramidChartUiConfigHelper.js";
import { PyramidChartConfigurationPanel } from "../../configurationPanels/PyramidChartConfigurationPanel.js";
import { PluggablePieChart } from "../pieChart/PluggablePieChart.js";

/**
 * PluggablePyramidChart
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
 * The PluggablePyramidChart always creates two dimensional execution.
 *
 * - |ViewBy| = 0 ⇒ [[], [MeasureGroupIdentifier]]
 * - |ViewBy| = 1 ⇒ [[MeasureGroupIdentifier], [ViewBy]]
 *
 * ## Default sorts
 *
 * The PluggablePyramidChart uses the same sorts as pie chart.
 *
 */
export class PluggablePyramidChart extends PluggablePieChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.PYRAMID;
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        return super.getExtendedReferencePoint(referencePoint).then(setPyramidChartUiConfig);
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
                supportsChartFill: options.supportsChartFill,
            };

            this.renderFun(
                <PyramidChartConfigurationPanel
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
                    permissions={this.permissions}
                    references={this.references}
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }
}
