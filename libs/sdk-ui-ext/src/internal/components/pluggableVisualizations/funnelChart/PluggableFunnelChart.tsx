// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IVisConstruct, IReferencePoint, IExtendedReferencePoint } from "../../../interfaces/Visualization";

import { PluggablePieChart } from "../pieChart/PluggablePieChart";
import { setFunnelChartUiConfig } from "../../../utils/uiConfigHelpers/funnelChartUiConfigHelper";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { ISortConfig } from "../../../interfaces/SortConfig";

/**
 * PluggableFunnelChart
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
 * The PluggableFunnelChart always creates two dimensional execution.
 *
 * - |ViewBy| = 0 ⇒ [[], [MeasureGroupIdentifier]]
 * - |ViewBy| = 1 ⇒ [[MeasureGroupIdentifier], [ViewBy]]
 *
 * ## Default sorts
 *
 * The PluggableFunnelChart does not use any sorts.
 *
 */
export class PluggableFunnelChart extends PluggablePieChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.FUNNEL;
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        return super.getExtendedReferencePoint(referencePoint).then(setFunnelChartUiConfig);
    }

    protected renderConfigurationPanel(): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const properties = this.visualizationProperties ?? {};

            this.renderFun(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={properties}
                />,
                configPanelElement,
            );
        }
    }

    public getSortConfig(_referencePoint: IReferencePoint): Promise<ISortConfig> {
        return Promise.resolve({
            defaultSort: [],
            availableSorts: [],
            supported: false,
            disabled: false,
        });
    }
}
