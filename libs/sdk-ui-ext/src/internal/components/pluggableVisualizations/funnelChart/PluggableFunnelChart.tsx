// (C) 2019 GoodData Corporation
import * as React from "react";
import { render } from "react-dom";
import { IVisConstruct, IReferencePoint, IExtendedReferencePoint } from "../../../interfaces/Visualization";

import { PluggablePieChart } from "../pieChart/PluggablePieChart";
import { setFunnelChartUiConfig } from "../../../utils/uiConfigHelpers/funnelChartUiConfigHelper";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { VisualizationTypes } from "@gooddata/sdk-ui";

export class PluggableFunnelChart extends PluggablePieChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.FUNNEL;
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        return super.getExtendedReferencePoint(referencePoint).then(setFunnelChartUiConfig);
    }

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            const properties = this.visualizationProperties ?? {};

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={properties}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
