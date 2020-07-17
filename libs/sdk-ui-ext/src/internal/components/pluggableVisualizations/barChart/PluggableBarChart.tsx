// (C) 2019 GoodData Corporation
import React from "react";
import { render } from "react-dom";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { IInsightDefinition } from "@gooddata/sdk-model";
import cloneDeep from "lodash/cloneDeep";
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts";
import { COLUMN_BAR_CHART_UICONFIG } from "../../../constants/uiConfig";
import { IVisConstruct, IUiConfig } from "../../../interfaces/Visualization";
import { BAR_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import BarChartConfigurationPanel from "../../configurationPanels/BarChartConfigurationPanel";
import { AXIS, AXIS_NAME } from "../../../constants/axis";

export class PluggableBarChart extends PluggableColumnBarCharts {
    constructor(props: IVisConstruct) {
        super(props);
        this.secondaryAxis = AXIS_NAME.SECONDARY_X;
        this.type = VisualizationTypes.BAR;
        this.defaultControlsProperties = {
            stackMeasures: false,
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep(COLUMN_BAR_CHART_UICONFIG);
    }

    public getSupportedPropertiesList() {
        return BAR_CHART_SUPPORTED_PROPERTIES[this.axis || AXIS.DUAL] || [];
    }

    protected renderConfigurationPanel(insight: IInsightDefinition) {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <BarChartConfigurationPanel
                    locale={this.locale}
                    colors={this.colors}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
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
