// (C) 2023-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";

import { type IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationTypes } from "@gooddata/sdk-ui";

import { SANKEY_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_SANKEY_UI_CONFIG } from "../../../constants/uiConfig.js";
import {
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
    type IVisProps,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import {
    configBuckets,
    configSankeyUiConfig,
} from "../../../utils/uiConfigHelpers/sankeyChartUiConfigHelper.js";
import { SankeyChartConfigurationPanel } from "../../configurationPanels/SankeyChartConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

/**
 * PluggableSankeyChart
 *
 * ## Buckets
 *
 * | Name              | Id             | Accepts             |
 * |-------------------|----------------|---------------------|
 * | Measure           | measure        | measures only       |
 * | Attribute ( From )| attribute_from | attribute or date |
 * | Attribute ( To )  | attribute_to   | attribute or date |
 *
 * ### Bucket axioms
 *
 * - |Measure           | = 1
 * - |Attribute ( From )| ≤ 1
 * - |Attribute ( To )  | ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableSankeyChart always creates the same two dimensional execution.
 *
 * - ⊤ ⇒ [[MeasureGroupIdentifier], compact([attributeFrom, attributeTo])]
 *
 * ## Sorts
 *
 * The PluggableSankeyChart does not use any sorts.
 */
export class PluggableSankeyChart extends PluggableBaseChart {
    constructor(params: IVisConstruct) {
        super(params);
        this.type = VisualizationTypes.SANKEY;
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const uiConfig = cloneDeep(DEFAULT_SANKEY_UI_CONFIG);
        this.addMetricToFiltersIfEnabled(uiConfig);

        let extendedReferencePoint: IExtendedReferencePoint = {
            ...cloneDeep(referencePoint),
            uiConfig,
        };

        extendedReferencePoint = removeAllArithmeticMeasuresFromDerived(extendedReferencePoint);
        extendedReferencePoint = removeAllDerivedMeasures(extendedReferencePoint);
        extendedReferencePoint = configBuckets(extendedReferencePoint);
        extendedReferencePoint = configurePercent(extendedReferencePoint, false);
        extendedReferencePoint = configureOverTimeComparison(extendedReferencePoint);
        extendedReferencePoint = configSankeyUiConfig(extendedReferencePoint, this.intl, this.type);

        return Promise.resolve(
            sanitizeFilters(extendedReferencePoint, this.featureFlags?.enableImprovedAdFilters),
        );
    }

    protected override getSupportedPropertiesList(): string[] {
        return SANKEY_CHART_SUPPORTED_PROPERTIES;
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): null {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
            };

            this.renderFun(
                <SankeyChartConfigurationPanel
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
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
        return null;
    }
}
